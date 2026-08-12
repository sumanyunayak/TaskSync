import React, { useState, useEffect } from 'react';

export default function Workspace({ project }) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [recommendedMember, setRecommendedMember] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  // New Task Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState('');

  // Invitation State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');

  // Fetch All Workspace Data
  const fetchTasks = async () => {
    try {
      let query = `/api/tasks/project/${project.id}?`;
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (statusFilter) query += `status=${encodeURIComponent(statusFilter)}&`;
      if (assigneeFilter) query += `assigned_to=${encodeURIComponent(assigneeFilter)}&`;

      const res = await fetch(query);
      const data = await res.json();
      if (data.status === 'Success') setTasks(data.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchMembersAndWorkload = async () => {
    try {
      // Get Members
      const memRes = await fetch(`/api/projects/${project.id}/members`);
      const memData = await memRes.json();
      if (memData.status === 'Success') setMembers(memData.data);

      // Get Workload Recommendation
      const workRes = await fetch(`/api/tasks/project/${project.id}/workload`);
      const workData = await workRes.json();
      if (workData.status === 'Success') {
        setRecommendedMember(workData.data.recommended_member);
      }
    } catch (err) {
      console.error('Error fetching members/workload:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/api/tasks/project/${project.id}/dashboard`);
      const data = await res.json();
      if (data.status === 'Success') {
        setProgress(data.data.progress_percentage);
        setActivityLogs(data.data.recent_activity);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, assigneeFilter]);

  useEffect(() => {
    fetchMembersAndWorkload();
    fetchDashboardData();
  }, [project.id]);

  // Create Task Handler
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const res = await fetch(`/api/tasks/project/${project.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          assigned_to: newAssignee || null,
        }),
      });

      const data = await res.json();
      if (data.status === 'Success') {
        setNewTitle('');
        setNewDesc('');
        setNewAssignee('');
        fetchTasks();
        fetchDashboardData();
        fetchMembersAndWorkload();
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  // Invite Member Handler
  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      const res = await fetch(`/api/projects/${project.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      setInviteMsg(data.message);
      if (data.status === 'Success') {
        setInviteEmail('');
        fetchMembersAndWorkload();
      }
    } catch (err) {
      setInviteMsg('Failed to invite member');
    }
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');

    // Optimistic UI Update
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === parseInt(taskId, 10) ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.status === 'Success') {
        fetchDashboardData();
      } else {
        fetchTasks(); // Revert on failure
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      fetchTasks();
    }
  };

  const columns = ['To Do', 'In Progress', 'Done'];

  return (
    <div>
      {/* Header & Progress Bar */}
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h2>{project.title}</h2>
        <p style={{ color: '#64748b' }}>{project.description || 'No description provided.'}</p>
        
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
            <span>Project Completion Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Workload Balancer Recommendation */}
        {recommendedMember && (
          <div style={{ background: '#eff6ff', padding: '0.8rem', borderRadius: '6px', borderLeft: '4px solid #3b82f6', fontSize: '0.85rem' }}>
            💡 <strong>Smart Workload Recommendation:</strong> Assign new tasks to <strong>{recommendedMember.username}</strong> ({recommendedMember.active_task_count} active tasks).
          </div>
        )}
      </div>

      {/* Task Filters & Creation */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Task Creation Form */}
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
          <h3>+ Add New Task</h3>
          <form onSubmit={handleCreateTask} style={{ display: 'grid', gap: '0.8rem', marginTop: '0.8rem' }}>
            <input
              type="text"
              placeholder="Task Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              type="text"
              placeholder="Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <select
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">Assign Member (Optional)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.username} ({m.role})
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
              Create Task
            </button>
          </form>
        </div>

        {/* Invite Member Section */}
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
          <h3>Invite Team Member</h3>
          <form onSubmit={handleInviteMember} style={{ display: 'grid', gap: '0.8rem', marginTop: '0.8rem' }}>
            <input
              type="email"
              placeholder="Member Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
              Send Invite
            </button>
          </form>
          {inviteMsg && <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#2563eb' }}>{inviteMsg}</p>}
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 2, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">All Assignees</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.username}
            </option>
          ))}
        </select>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          return (
            <div
              key={col}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
            >
              <h3>
                {col} ({colTasks.length})
              </h3>
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <h4>{task.title}</h4>
                  <p>{task.description || 'No description'}</p>
                  <div className="task-meta">
                    <span>👤 {task.assignee_name || 'Unassigned'}</span>
                    <span>{new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Activity Feed Section */}
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem' }}>
        <h3>Recent Activity Feed</h3>
        <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
          {activityLogs.map((log) => (
            <li
              key={log.id}
              style={{ padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}
            >
              <strong>{log.username}</strong>: {log.action}
              <span style={{ float: 'right', color: '#94a3b8' }}>
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}