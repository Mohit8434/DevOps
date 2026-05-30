import React, { useState, useEffect } from 'react';
import TaskItem from './TaskItem';

export default function Dashboard({ userId, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('WORK');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:8082/api/tasks?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError('Could not fetch tasks. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const taskData = {
        userId,
        title: title.trim(),
        notes: notes.trim() || null,
        priority,
        category,
        dueDate: dueDate ? dueDate : null, // E.g., "2026-05-30T15:30"
      };

      const response = await fetch('http://localhost:8082/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Failed to create task');
      }

      // Reset form
      setTitle('');
      setNotes('');
      setPriority('MEDIUM');
      setCategory('WORK');
      setDueDate('');

      // Refresh list
      await fetchTasks();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error adding task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:8082/api/tasks/${taskId}/toggle`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to toggle status');
      }
      
      // Update local state directly for speedy feel
      setTasks(prevTasks =>
        prevTasks.map(t => {
          if (t.id === taskId) {
            const isPending = t.status === 'PENDING';
            return {
              ...t,
              status: isPending ? 'COMPLETED' : 'PENDING',
              completedAt: isPending ? new Date().toISOString() : null
            };
          }
          return t;
        })
      );
    } catch (err) {
      console.error(err);
      setError('Error updating task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:8082/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // Update local state
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error(err);
      setError('Error deleting task');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all completed tasks? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8082/api/tasks/history?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to clear history');
      }
      
      // Remove completed tasks from state
      setTasks(prevTasks => prevTasks.filter(t => t.status !== 'COMPLETED'));
    } catch (err) {
      console.error(err);
      setError('Error clearing history');
    }
  };

  // Compute stats
  const activeTasks = tasks.filter(t => t.status === 'PENDING');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Filtered active tasks
  const filteredActiveTasks = activeTasks.filter(t => {
    if (selectedCategoryFilter === 'ALL') return true;
    return t.category === selectedCategoryFilter;
  });

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Header */}
      <header className="dashboard-header glass-panel">
        <div className="header-user-info">
          <div className="avatar">
            {userId.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="welcome-title">Workspace: <span className="gradient-text">{userId}</span></h1>
            <p className="welcome-subtitle">Mohit Raj gupta</p>
          </div>
        </div>
        <button onClick={onLogout} className="btn btn-secondary btn-logout">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="logout-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Log out</span>
        </button>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid">
        
        {/* Left column: Add Task Form & Statistics */}
        <div className="dashboard-col-left">
          
          {/* Stats Card */}
          <div className="glass-panel stats-card">
            <h2 className="panel-title">Overview</h2>
            <div className="stats-content">
              <div className="stats-circle-container">
                <svg className="progress-ring" width="100" height="100">
                  <circle className="progress-ring-bg" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" r="42" cx="50" cy="50"/>
                  <circle 
                    className="progress-ring-bar" 
                    stroke="url(#indigo-violet)" 
                    strokeWidth="8" 
                    fill="transparent" 
                    r="42" 
                    cx="50" 
                    cy="50"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 42}`,
                      strokeDashoffset: `${2 * Math.PI * 42 * (1 - completionPercentage / 100)}`
                    }}
                  />
                  <defs>
                    <linearGradient id="indigo-violet" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="stats-percentage">{completionPercentage}%</div>
              </div>
              <div className="stats-metrics">
                <div className="metric-item">
                  <span className="metric-dot pending"></span>
                  <div className="metric-data">
                    <span className="metric-val">{activeTasks.length}</span>
                    <span className="metric-label">Pending Tasks</span>
                  </div>
                </div>
                <div className="metric-item">
                  <span className="metric-dot success"></span>
                  <div className="metric-data">
                    <span className="metric-val">{completedTasks.length}</span>
                    <span className="metric-label">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Task Card */}
          <div className="glass-panel add-task-card">
            <h2 className="panel-title">Add New Task</h2>
            <form onSubmit={handleAddTask} className="add-task-form">
              <div className="input-group">
                <label className="input-label">Task Title *</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Notes</label>
                <textarea
                  className="textarea-input"
                  placeholder="Optional details..."
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-row-2">
                <div className="input-group">
                  <label className="input-label">Priority</label>
                  <select
                    className="select-input"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select
                    className="select-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="WORK">Work</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="EDUCATION">Education</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Complete Timeline (Due Date & Time)</label>
                <input
                  type="datetime-local"
                  className="text-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting || !title.trim()}>
                {isSubmitting ? (
                  <span>Adding Task...</span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="btn-icon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Create Task</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right column: Task Lists (Active & History) */}
        <div className="dashboard-col-right">
          
          {/* Active Tasks panel */}
          <div className="glass-panel tasks-panel">
            <div className="tasks-panel-header">
              <h2 className="panel-title">
                Active Tasks 
                <span className="count-badge">{activeTasks.length}</span>
              </h2>
              {/* Category Filter Pills */}
              <div className="filter-pills">
                {['ALL', 'WORK', 'PERSONAL', 'EDUCATION', 'OTHER'].map(cat => (
                  <button
                    key={cat}
                    className={`pill-btn ${selectedCategoryFilter === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategoryFilter(cat)}
                  >
                    {cat.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="tasks-list-container">
              {loading && tasks.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner-loader"></div>
                  <p>Loading tasks...</p>
                </div>
              ) : filteredActiveTasks.length === 0 ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="empty-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No active tasks found in this category.</p>
                  <span className="empty-sub">Create one using the form on the left!</span>
                </div>
              ) : (
                filteredActiveTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggleComplete={handleToggleComplete} 
                    onDelete={handleDeleteTask}
                  />
                ))
              )}
            </div>
          </div>

          {/* History / Completed Tasks panel */}
          <div className="glass-panel history-panel">
            <div className="tasks-panel-header">
              <h2 className="panel-title text-muted-header">
                Task History
                <span className="count-badge completed-badge">{completedTasks.length}</span>
              </h2>
              {completedTasks.length > 0 && (
                <button onClick={handleClearHistory} className="btn btn-danger btn-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="btn-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Clear History</span>
                </button>
              )}
            </div>

            <div className="tasks-list-container history-list">
              {completedTasks.length === 0 ? (
                <div className="empty-state sm-empty">
                  <p>No tasks completed yet.</p>
                </div>
              ) : (
                completedTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggleComplete={handleToggleComplete} 
                    onDelete={handleDeleteTask}
                  />
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-radius: 20px;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--accent-gradient);
          color: white;
          font-weight: 800;
          font-family: var(--font-title);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }

        .welcome-title {
          font-size: 1.4rem;
          font-weight: 700;
        }

        .welcome-subtitle {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .btn-logout {
          font-size: 0.875rem;
          padding: 0.6rem 1.2rem;
        }

        .logout-icon {
          width: 16px;
          height: 16px;
        }

        /* Dashboard Grid Layout */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        .dashboard-col-left {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dashboard-col-right {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .panel-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .text-muted-header {
          color: var(--text-secondary);
        }

        .count-badge {
          background: var(--accent-primary);
          color: white;
          font-size: 0.75rem;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          font-weight: 700;
        }

        .completed-badge {
          background: var(--text-muted);
        }

        /* Stats Card Styles */
        .stats-card {
          padding: 1.5rem;
        }

        .stats-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .stats-circle-container {
          position: relative;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-ring {
          transform: rotate(-90deg);
        }

        .progress-ring-bar {
          transition: stroke-dashoffset 0.35s;
          transform-origin: 50% 50%;
        }

        .stats-percentage {
          position: absolute;
          font-family: var(--font-title);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stats-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .metric-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .metric-dot.pending { background: var(--pending); }
        .metric-dot.success { background: var(--success); }

        .metric-data {
          display: flex;
          flex-direction: column;
        }

        .metric-val {
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.1;
        }

        .metric-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        /* Add Task Styles */
        .add-task-card {
          padding: 1.5rem;
        }

        .add-task-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-error {
          color: #f87171;
          font-size: 0.85rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
        }

        /* Tasks Panels */
        .tasks-panel, .history-panel {
          padding: 1.5rem;
        }

        .tasks-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .filter-pills {
          display: flex;
          gap: 0.35rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
        }

        .pill-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.35rem 0.7rem;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          outline: none;
        }

        .pill-btn:hover {
          border-color: rgba(255, 255, 255, 0.15);
          color: var(--text-primary);
        }

        .pill-btn.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        .tasks-list-container {
          min-height: 200px;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        .history-list {
          min-height: 100px;
          max-height: 300px;
        }

        .btn-sm {
          font-size: 0.75rem;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
        }

        .btn-sm svg.btn-icon {
          width: 14px;
          height: 14px;
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1.5rem;
          color: var(--text-secondary);
        }

        .sm-empty {
          padding: 1.5rem;
        }

        .empty-icon {
          width: 40px;
          height: 40px;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .empty-state p {
          font-weight: 500;
          font-size: 0.95rem;
        }

        .empty-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        /* Loading Spinner */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
          gap: 1rem;
        }

        .spinner-loader {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(99, 102, 241, 0.1);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
