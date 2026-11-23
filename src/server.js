require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || true }));

// Simple health check for Render
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// MongoDB connection
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected successfully to server'))
  .catch(err => console.error('An error occurred connecting to MongoDB: ', err));

// Define the User schema and model
const loginSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
});
const Login = mongoose.model('Login', loginSchema);

const taskSchema = new mongoose.Schema({
  title: String,
  priority: String,
  deadline: Date,
  time: String,
  completed: Boolean,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Login' }, // Link to User
  group: { type: String, default: 'General' }
});
const Task = mongoose.model('Task', taskSchema);

// Signup route
app.post('/api/signup', (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Create a new user and save it to the database
  const user = new Login({ firstName, lastName, email, password });
  user.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Login route
app.post('/api/home', (req, res) => {
  const { email, password } = req.body;

  Login.findOne({ email, password })
    .then(user => {
      if (!user) {
        return res.status(203).json('Error: User not found');
      }
      res.status(200).json({
        fname: user.firstName,
        lname: user.lastName,
        userId: user._id, // Include userId for subsequent requests
      });
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

app.get('/api/groups', async (req, res) => {
  try {
    const groups = await Task.distinct('group', { userId: req.query.userId });
    res.json(groups);
  } catch (error) {
    res.status(500).send('Error fetching groups');
  }
});

// Route to get all tasks for a user
app.get('/api/tasks/:userId', (req, res) => {
  const { userId } = req.params;
  Task.find({ userId })
    .then(tasks => res.json(tasks))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Route to add a new task
app.post('/api/tasks', (req, res) => {
  const { title, priority, deadline, time, completed, userId, group } = req.body;

  const newTask = new Task({ title, priority, deadline, time, completed, userId, group });
  newTask.save()
    .then(task => res.json(task))  // Return the created task object
    .catch(err => res.status(400).json('Error: ' + err));
});

// Route to update an existing task
app.put('/api/tasks/:id', async (req, res) => {
  const { title, priority, deadline, time, completed, group } = req.body;
  const { id } = req.params; // Get the task ID from the URL parameters

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, priority, deadline, time, completed, group }, // Updated data
      { new: true } // Return the updated document
    );
    res.json(updatedTask); // Return the updated task
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Route to delete a task
app.delete('/api/tasks/:id', (req, res) => {
  Task.findByIdAndDelete(req.params.id)
    .then(() => res.json('Task deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Route to bulk-save all tasks for a user (acts as a "save on logout")
app.post('/api/tasks/sync/:userId', async (req, res) => {
  const { userId } = req.params;
  const { tasks } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json('Error: Invalid userId');
  }
  if (!Array.isArray(tasks)) {
    return res.status(400).json('Error: Tasks array required');
  }

  try {
    // Replace the user's existing tasks with the current client state
    await Task.deleteMany({ userId });

    const tasksToInsert = tasks.map(task => ({
      title: task.title,
      priority: task.priority,
      deadline: task.deadline,
      time: task.time || '',
      completed: task.completed,
      userId,
      group: task.group || 'General'
    }));

    if (tasksToInsert.length > 0) {
      await Task.insertMany(tasksToInsert);
    }

    res.json({ message: 'Sync successful' });
  } catch (err) {
    console.error('Error syncing tasks:', err);
    res.status(400).json('Error: ' + err.message);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
