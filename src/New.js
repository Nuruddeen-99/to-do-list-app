import React, { useState, useEffect, useMemo } from 'react';
import './New.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

function New() {
  const [showAddTaskPane, setShowAddTaskPane] = useState(false);
  const [currentTab, setCurrentTab] = useState('incomplete');
  const [curTask, setCurTask] = useState('');
  const [prior, setPriority] = useState('');
  const [deadline, setDeadline] = useState('');
  const [allTask, setAllTask] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [group, setGroup] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [groups, setGroups] = useState([]);
  const [groupVisibility, setGroupVisibility] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const { fname, lname, userId } = location.state || { fname: 'Default', lname: 'User', userId: null };

  // Generate a unique ID for client-side tasks
  const generateLocalId = () =>
    `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

  const groupedTasks = useMemo(() => {
    return allTask.reduce((acc, task) => {
      const groupName = task.group ? task.group.toUpperCase() : 'UNGROUPED';
      acc[groupName] = acc[groupName] || [];
      acc[groupName].push(task);
      return acc;
    }, {});
  }, [allTask]);

  // Load initial tasks from DB on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [tasksRes, groupsRes] = await Promise.all([
          axios.get(`${API_URL}/api/tasks/${userId}`),
          axios.get(`${API_URL}/api/groups`, { params: { userId } })
        ]);

        setAllTask(tasksRes.data.map(task => ({
          ...task,
          deadline: new Date(task.deadline),
          localId: task._id || generateLocalId()
        })));
        setGroups(groupsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const resetForm = () => {
    setCurTask('');
    setDeadline('');
    setPriority('');
    setGroup('');
    setNewGroup('');
    setEditingId(null);
    setErrorMessage('');
  };

  const openAddTaskPane = () => {
    resetForm();
    setShowAddTaskPane(true);
  };

  const closeAddTaskPane = () => {
    resetForm();
    setShowAddTaskPane(false);
  };

  // Sync state to database and logout
  const handleLogout = async () => {
    if (!userId) {
      navigate('/');
      return;
    }

    setSyncing(true);
    try {
      await axios.post(`${API_URL}/api/tasks/sync/${userId}`, { tasks: allTask });
      navigate('/');
    } catch (error) {
      console.error('Error saving tasks on logout:', error);
      alert('Failed to save changes. Please try logging out again.');
      setSyncing(false);
    }
  };

  const btnClick = () => {
    if (!curTask.trim()) return setErrorMessage('Please enter a task title');
    if (!deadline) return setErrorMessage('Please enter a deadline');
    if (!prior) return setErrorMessage('Please select a priority');
    if (group === '__new__' && !newGroup.trim()) return setErrorMessage('Please enter a new category name');

    setErrorMessage('');

    const grp = group === '__new__' ? newGroup.trim() : group;
    if (grp && !groups.includes(grp)) {
      setGroups(prev => [...prev, grp]);
    }

    const taskPayload = {
      localId: editingId || generateLocalId(),
      title: curTask.trim(),
      priority: prior,
      deadline: new Date(deadline),
      completed: false,
      userId,
      group: grp
    };

    if (editingId) {
      setAllTask(prev => prev.map(task => (task.localId === editingId ? { ...task, ...taskPayload } : task)));
    } else {
      setAllTask(prev => [...prev, taskPayload]);
    }

    closeAddTaskPane();
  };

  const editTask = (task) => {
    setCurTask(task.title);
    setPriority(task.priority);
    setDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '');
    setGroup(task.group || '');
    setEditingId(task.localId);
    setErrorMessage('');
    setShowAddTaskPane(true);
  };

  const dlt = (localId) => {
    setAllTask(prev => prev.filter(task => task.localId !== localId));
    setDeleteId(null);
  };

  const confirmDelete = () => {
    if (deleteId) {
      const id = deleteId;
      setDeleteId(null);
      dlt(id);
    }
  };

  const toggleTask = (localId) => {
    setAllTask(prev =>
      prev.map(task => (task.localId === localId ? { ...task, completed: !task.completed } : task))
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid Date';

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });

    const getOrdinal = (n) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${dayOfWeek}, ${getOrdinal(day)} ${month} ${year}`;
  };

  const incompleteCount = allTask.filter(task => !task.completed).length;
  const completedCount = allTask.filter(task => task.completed).length;

  const renderRows = (isCompleted) =>
    Object.keys(groupedTasks).map((groupName) => {
      const groupTasks = groupedTasks[groupName].filter(task => !!task.completed === isCompleted);
      if (groupTasks.length === 0) return null;

      return (
        <React.Fragment key={groupName}>
          <tr className="group-header">
            <td
              colSpan="5"
              onClick={() => setGroupVisibility(prev => ({
                ...prev,
                [groupName]: !prev[groupName]
              }))}
            >
              {groupVisibility[groupName] === false ? '▶' : '▼'} {groupName} ({groupTasks.length})
            </td>
          </tr>
          {groupVisibility[groupName] !== false &&
            groupTasks.map(task => (
              <tr key={task.localId} className={isCompleted ? 'completed-task-row' : ''}>
                <td>
                  <input
                    type="checkbox"
                    className="taskCheckbox"
                    checked={!!task.completed}
                    onChange={() => toggleTask(task.localId)}
                  />
                </td>
                <td className={`task-title ${isCompleted ? 'completed' : ''}`}>{task.title}</td>
                <td className="task-priority" data-priority={task.priority}>{task.priority}</td>                <td className="task-deadline">{formatDate(task.deadline)}</td>
                <td className="task-actions">
                  {!isCompleted && (
                    <button className="edit-btn" title="Edit Task" onClick={() => editTask(task)}>&#x270E;</button>
                  )}
                  <button className="delete-btn" title="Delete Task" onClick={() => setDeleteId(task.localId)}>&times;</button>
                </td>
              </tr>
            ))}
        </React.Fragment>
      );
    });

  return (
    <div className="main-container">
      {syncing && (
        <div className="logout-overlay">
          <div className="logout-card">
            <div className="spinner"></div>
            <p>Saving your changes...</p>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="logout-overlay">
          <div className="logout-card">
            <p className="logout-message">Are you sure you want to delete this task?</p>
            <div className="logout-actions">
              <button className="cancel-button" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="confirm-delete-button" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="logo">My To Do List</div>
        <div className="user-info">
          <img src="prof.png" alt="User Icon" className="user-icon" />
          <span className="user-name">{fname} {lname}</span>
          <button className="logout-button" onClick={handleLogout} disabled={syncing}>Logout</button>
        </div>
      </nav>

      <main className="main-content">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your tasks...</p>
          </div>
        ) : (
          <>
            <div className="add-task-section">
              <button className="add-task-button" onClick={openAddTaskPane}>
                + Add New Task
              </button>
            </div>

            {showAddTaskPane && (
              <div className="task-pane-overlay" onClick={closeAddTaskPane}>
                <div className="task-pane" onClick={(e) => e.stopPropagation()}>
                  <h2 className="task-pane-title">{editingId ? 'Edit Task' : 'Add New Task'}</h2>
                  {errorMessage && <p className="error-msg">{errorMessage}</p>}

                  <label className="field-label">Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="task-deadline-input"
                  />

                  <label className="field-label">Task</label>
                  <input
                    type="text"
                    placeholder="Enter task..."
                    onChange={(e) => setCurTask(e.target.value)}
                    value={curTask}
                  />

                  <label className="field-label">Priority (1 - 5, 1 being highest)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="e.g. 1"
                    onChange={(e) => setPriority(e.target.value)}
                    value={prior}
                  />

                  <label className="field-label">Category</label>
                  <select value={group} onChange={(e) => setGroup(e.target.value)}>
                    <option value="" disabled>Select a category</option>
                    {groups.map(grp => (
                      <option key={grp} value={grp}>{grp.toUpperCase()}</option>
                    ))}
                    <option value="__new__">+ Add New Category</option>
                  </select>

                  {group === '__new__' && (
                    <input
                      type="text"
                      placeholder="Enter new category name"
                      onChange={(e) => setNewGroup(e.target.value)}
                      value={newGroup}
                      className="new-group-input"
                    />
                  )}

                  <div className="task-pane-actions">
                    <button className="add-task-submit-button" onClick={btnClick}>
                      {editingId ? 'Update Task' : 'Create Task'}
                    </button>
                    <button className="close-task-pane" onClick={closeAddTaskPane}>Close</button>
                  </div>
                </div>
              </div>
            )}

            <div className="task-tab-bar">
              <div
                className={`tab-item ${currentTab === 'incomplete' ? 'active-tab' : ''}`}
                onClick={() => setCurrentTab('incomplete')}
              >
                Incomplete ({incompleteCount})
              </div>
              <div
                className={`tab-item ${currentTab === 'completed' ? 'active-tab' : ''}`}
                onClick={() => setCurrentTab('completed')}
              >
                Completed ({completedCount})
              </div>
            </div>

            <div className="task-list">
              {allTask.length === 0 ? (
                <div className="empty-state">
                  <p>No tasks yet. Click "Add New Task" to get started!</p>
                </div>
              ) : (
                <table className="taskTable">
                  <thead>
                    <tr>
                      <th width="6%">#</th>
                      <th width="48%">Task</th>
                      <th width="12%">Priority</th>
                      <th width="22%">Deadline</th>
                      <th width="12%">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderRows(currentTab === 'completed')}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default New;