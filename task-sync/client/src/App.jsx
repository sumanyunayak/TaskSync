import React, { useState } from 'react';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace'; 

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setSelectedProject(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <nav className="navbar">
        <div className="brand">
          <span className="brand-mark">TS</span>
          <h1 className="brand-name">TaskSync</h1>
          <span className="brand-sub">collab workspace</span>
        </div>
        {user && (
          <div className="nav-links">
            <span className="nav-user">
              <span className="nav-user-lbl">Operator</span>
              {user.username}
            </span>
            {selectedProject && (
              <button className="nav-btn" onClick={() => setSelectedProject(null)}>
                &larr; Dashboard
              </button>
            )}
            <button className="nav-btn nav-btn--danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main App Content View */}
      <main className="main-content">
        {!user ? (
          <AuthPage onLoginSuccess={(userData) => setUser(userData)} />
        ) : !selectedProject ? (
          <Dashboard onSelectProject={(project) => setSelectedProject(project)} />
        ) : (
          <Workspace project={selectedProject} /> 
        )}
      </main>
    </div>
  );
}