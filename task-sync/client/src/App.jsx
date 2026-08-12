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
        <h1>TaskSync Workspace</h1>
        {user && (
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem' }}>Welcome, <strong>{user.username}</strong></span>
            {selectedProject && (
              <button onClick={() => setSelectedProject(null)}>
                &larr; Back to Dashboard
              </button>
            )}
            <button onClick={handleLogout}>Logout</button>
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