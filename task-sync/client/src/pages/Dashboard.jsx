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
      <p className="kicker">Project Directory</p>
      <h2 className="page-title">Your Workspace Projects</h2>

      {/* Create Project Form */}
      <div className="panel create-panel">
        <div className="panel-head">
          <span className="head-dot"></span>
          <span>Create New Project</span>
          <span className="spacer"></span>
          <span className="head-idx">// NEW</span>
        </div>
        <div className="panel-body">
          <form onSubmit={handleCreateProject} className="create-row">
            <div>
              <label className="label" htmlFor="proj-title">Project Title</label>
              <input
                className="field"
                id="proj-title"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="proj-desc">Description</label>
              <input
                className="field"
                id="proj-desc"
                type="text"
                placeholder="Optional"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn--primary">
              + Create
            </button>
          </form>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="loading-state">
          <span className="blink"></span>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          No projects found. Create one above.
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => onSelectProject(project)}
            >
              <h3>{project.title}</h3>
              <p className="project-desc">
                {project.description || 'No description provided.'}
              </p>
              <div className="project-meta">
                <span className="tag tag--black">Role: {project.role}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
