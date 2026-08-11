import React, { useState } from 'react';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';

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
          <div>
            <h2>Project: {selectedProject.title}</h2>
            <p style={{ color: '#64748b' }}>{selectedProject.description}</p>
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff', borderRadius: '8px' }}>
              <p>Kanban Workspace coming in Phase 7!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}