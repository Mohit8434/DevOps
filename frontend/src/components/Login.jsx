import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError('Please enter a User ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8082/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId.trim() }),
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Failed to login');
      }

      const user = await response.json();
      onLoginSuccess(user.id);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Server error. Please make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in-up">
      <div className="glass-panel login-card">
        <div className="login-header">
          <div className="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="login-title">
            Organize Your Day with <span className="gradient-text">Taskflow</span>
          </h2>
          <p className="login-subtitle">Enter your User ID to log in or create a new account instantly</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="userId" className="input-label">User ID</label>
            <input
              type="text"
              id="userId"
              className="text-input"
              placeholder="e.g., mohit123, user_99"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={loading}
              maxLength="50"
              autoFocus
            />
          </div>

          {error && (
            <div className="error-message">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="error-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? (
              <span className="spinner">Connecting...</span>
            ) : (
              <>
                <span>Enter Workspace</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="btn-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          width: 100%;
          padding: 1rem;
        }

        .login-card {
          width: 100%;
          max-width: 450px;
          padding: 2.5rem;
          border-radius: 24px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo-icon {
          width: 60px;
          height: 60px;
          background: var(--accent-gradient);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: white;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
        }

        .logo-icon svg {
          width: 32px;
          height: 32px;
        }

        .login-title {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .login-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .w-full {
          width: 100%;
        }

        .btn svg.btn-icon {
          width: 18px;
          height: 18px;
          transition: transform 0.2s ease;
        }

        .btn:hover svg.btn-icon {
          transform: translateX(4px);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--danger-bg);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          line-height: 1.4;
          animation: fadeIn 0.3s ease-out;
        }

        .error-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .spinner {
          display: inline-block;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
