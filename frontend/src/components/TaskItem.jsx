import React, { useState, useEffect } from 'react';

export default function TaskItem({ task, onToggleComplete, onDelete }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (task.status === 'COMPLETED' || !task.dueDate) {
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(task.dueDate) - new Date();
      if (difference <= 0) {
        setIsOverdue(true);
        setTimeLeft('Overdue');
        return;
      }

      setIsOverdue(false);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      let timeString = '';
      if (days > 0) timeString += `${days}d `;
      if (hours > 0 || days > 0) timeString += `${hours}h `;
      timeString += `${minutes}m ${seconds}s`;

      setTimeLeft(timeString);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [task.dueDate, task.status]);

  // Format completed date
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'LOW': return 'badge-low';
      case 'HIGH': return 'badge-high';
      default: return 'badge-medium';
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'WORK': return 'badge-work';
      case 'PERSONAL': return 'badge-personal';
      case 'EDUCATION': return 'badge-education';
      default: return 'badge-other';
    }
  };

  const isTaskCompleted = task.status === 'COMPLETED';

  return (
    <div className={`glass-panel task-item-card ${isTaskCompleted ? 'completed-card' : ''} animate-fade-in`}>
      <div className="task-left">
        <button
          className={`checkbox-btn ${isTaskCompleted ? 'checked' : ''}`}
          onClick={() => onToggleComplete(task.id)}
          title={isTaskCompleted ? "Mark active" : "Mark completed"}
        >
          {isTaskCompleted && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="checkmark">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="task-details">
          <h3 className={`task-title ${isTaskCompleted ? 'completed-text' : ''}`}>{task.title}</h3>
          {task.notes && <p className="task-notes">{task.notes}</p>}
          
          <div className="task-badges">
            <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`badge ${getCategoryBadgeClass(task.category)}`}>
              {task.category}
            </span>
            
            {isTaskCompleted ? (
              <span className="completion-time">
                Completed: {formatDateTime(task.completedAt)}
              </span>
            ) : (
              task.dueDate && (
                <span className={`timeline-indicator ${isOverdue ? 'overdue-text' : 'pending-text'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="clock-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{timeLeft}</span>
                </span>
              )
            )}
          </div>
        </div>
      </div>

      <div className="task-actions">
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete(task.id)}
          title="Delete task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <style>{`
        .task-item-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem;
          margin-bottom: 1rem;
          gap: 1rem;
          background: rgba(22, 28, 45, 0.4);
        }

        .task-item-card:hover {
          background: var(--bg-card-hover);
          transform: translateX(4px);
        }

        .completed-card {
          border-color: rgba(16, 185, 129, 0.15);
          background: rgba(16, 185, 129, 0.03);
          opacity: 0.8;
        }

        .completed-card:hover {
          background: rgba(16, 185, 129, 0.05);
        }

        .task-left {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
        }

        .checkbox-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
          background: rgba(15, 23, 42, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          margin-top: 0.15rem;
          outline: none;
        }

        .checkbox-btn:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
          transform: scale(1.08);
        }

        .checkbox-btn.checked {
          background: var(--success);
          border-color: var(--success);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
        }

        .checkmark {
          width: 14px;
          height: 14px;
          color: white;
          animation: checkPop 0.25s ease-out;
        }

        @keyframes checkPop {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }

        .task-details {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }

        .task-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
          transition: all 0.2s ease;
          line-height: 1.4;
          word-break: break-word;
        }

        .completed-text {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .task-notes {
          font-size: 0.9rem;
          color: var(--text-secondary);
          word-break: break-word;
          line-height: 1.4;
        }

        .task-badges {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .timeline-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }

        .clock-icon {
          width: 14px;
          height: 14px;
        }

        .overdue-text {
          background: var(--danger-bg);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.2);
          animation: pulseRed 2s infinite;
        }

        .pending-text {
          background: var(--pending-bg);
          color: #93c5fd;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .completion-time {
          font-size: 0.75rem;
          color: var(--success);
          font-weight: 500;
        }

        @keyframes pulseRed {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .task-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }

        .action-btn svg {
          width: 16px;
          height: 16px;
        }

        .delete-btn:hover {
          background: var(--danger-bg);
          color: #f87171;
          border-color: rgba(239, 68, 68, 0.3);
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </div>
  );
}
