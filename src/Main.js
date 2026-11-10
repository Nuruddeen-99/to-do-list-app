import './Main.css';
import { useState } from 'react';

function Main() {
  const [curTask, setCurTask] = useState('');
  const [allTask, setAllTask] = useState([]);
  const [deadline, setDeadline] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [count, setCount] = useState(0);

  const btnClick = () => {
    if (!curTask.trim()) {
      alert('Please enter a task');
      return;
    }  
    if (!deadline.trim()) {
      alert('Please enter deadline');
      return;
    }
    const newTask = {
      title: curTask,
      deadline: deadline,
      completed: false,
    };
    if (editIndex >= 0) {
      const updatedTasks = allTask.map((task, index) => 
        index === editIndex ? newTask : task
      );
      setAllTask(updatedTasks);
      setEditIndex(-1);
    } else {
      setAllTask([...allTask, newTask]);
      setCount(count + 1);
    }
    setCurTask('');
    setDeadline('');
  };

    const handleLogout = () => {
      // Logic for logging out the user
      console.log('Logging out...');
    };

  const editTask = (index) => {
    setCurTask(allTask[index].title);
    setDeadline(allTask[index].deadline);
    setEditIndex(index);
  };
  
  const dlt = (index) => {
    let templist = [...allTask];
    templist.splice(index, 1);
    setCount(count - 1);
    setAllTask(templist);
  };

  const toggleTask = (index) => {
    const updatedList = allTask.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setAllTask(updatedList);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });
    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"],
        v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    return `${dayOfWeek}, ${getOrdinal(day)} ${month} ${year}`;
  };

  return (
    <>
    <nav className="navbar">
      <div className="logo">My To Do List</div>
      <div className="nav-items">
        <img
          src="https://via.placeholder.com/30" 
          alt="Account"
          className="account-icon"
        />
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
    <div style={{padding: "30px 30px 30px 30px", backgroundColor: 'rgb(11,17,20,1)'}}>
      <div className="header">
        <h1>My To Do List</h1><br/>
        <div style={{alignContent:"center", height:"18px", padding:"0px 0px 10px 0px",}}>TASK</div>
        <input
          type="text"
          placeholder="Enter new Task..."
          value={curTask}
          id='tsk'
          onChange={(e) => setCurTask(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              btnClick();
            }
          }}
        /><br/><br/><div style={{alignContent:"center", height:"18px", padding:"0px 0px 10px 0px",}}>DEADLINE</div>
        <input
          type="date"
          className='dd'
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <img src='deadline.png' alt='Deadline icon' width={'42px'} style={{height: '42px', marginLeft:"180px", borderRadius:'5px',}} />
        <br/><br/><br/>
        <span onClick={btnClick} className="addBtn">{editIndex >= 0 ? 'Edit' : 'Add'}</span>
      </div>
      <br/>
      <div>
       <table className="taskTable" height="100%">
  <thead>
    <tr>
      <th width={"5%"}>#</th>
      <th width={"60%"}>Task</th>
      <th width={"20%"}>Deadline</th>
      <th width={"15%"}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {allTask.map((task, index) => (
      <tr key={index} className={task.completed ? 'checked' : ''}>
        <td>
          <input
            type="checkbox"
            className="taskCheckbox"
            checked={task.completed}
            onChange={() => toggleTask(index)}
          />
        </td>
        <td className='task-title'>{task.title}</td>
        <td style={{textAlign:"center"}} className='task-title'>{formatDate(task.deadline)}</td>
        <td style={{textAlign:"center", display:"flex", justifyContent:"space-evenly"}}>
          <button className="edit" title={"Edit Task"} onClick={() => editTask(index)}>&#x270E;</button>
          <button className="close" title={"Delete Task"} onClick={() => dlt(index)}>&times;</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

      </div>
    </div>
    </>
  );
}

export default Main;
