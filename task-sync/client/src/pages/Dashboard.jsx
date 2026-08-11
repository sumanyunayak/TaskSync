import React, { useState, useEffect } from 'react';

export default function Dashboard({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.status === 'Success') {
        setProjects(data.data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();

      if (data.status === 'Success') {
        setTitle('');
        setDescription('');
        fetchProjects();
      }
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  return (
    <div>
      <h2>Your Workspace Projects</h2>
      
      {/* Create Project Form */}
      <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
        <h3>Create New Project</h3>
        <form onSubmit={handleCreateProject} style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem' }}>
          <input
            type="text"
            placeholder="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ flex: 2, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
            + Create
          </button>
        </form>
      </div>

      {/* Projects List */}
      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects found. Create one above!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              style={{
                background: '#fff',
                padding: '1.2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                borderLeft: '4px solid #2563eb'
              }}
            >
              <h3>{project.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.5rem 0' }}>
                {project.description || 'No description provided.'}
              </p>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Role: <strong>{project.role}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}