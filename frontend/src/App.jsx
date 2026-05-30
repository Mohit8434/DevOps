import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [userId, setUserId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check localStorage for logged-in user ID
    const savedUserId = localStorage.getItem('todo_user_id');
    if (savedUserId) {
      setUserId(savedUserId);
    }
    setIsInitializing(false);
  }, []);

  const handleLoginSuccess = (id) => {
    localStorage.setItem('todo_user_id', id);
    setUserId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem('todo_user_id');
    setUserId(null);
  };

  if (isInitializing) {
    return (
      <div className="app-loader">
        <div className="spinner-loader"></div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <main className="container">
        {!userId ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <Dashboard userId={userId} onLogout={handleLogout} />
        )}
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Taskflow Todo. Designed with premium dark aesthetics.</p>
      </footer>

      <style>{`
        .app-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          width: 100%;
        }

        .app-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: var(--bg-primary);
        }

        .app-footer {
          text-align: center;
          padding: 1.5rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-color);
          margin-top: auto;
          backdrop-filter: var(--card-blur);
          background: rgba(10, 13, 26, 0.8);
        }
      `}</style>
    </div>
  );
}
