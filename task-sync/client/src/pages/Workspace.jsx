import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const COLUMN_CLASS = {
  'To Do': 'kanban-column--todo',
  'In Progress': 'kanban-column--progress',
  'Done': 'kanban-column--done',
};

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
      let query = `${API_BASE}/api/tasks/project/${project.id}?`;
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (statusFilter) query += `status=${encodeURIComponent(statusFilter)}&`;
      if (assigneeFilter) query += `assigned_to=${encodeURIComponent(assigneeFilter)}&`;

      const res = await fetch(query, { credentials: 'include' });
      const data = await res.json();
      if (data.status === 'Success') setTasks(data.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchMembersAndWorkload = async () => {
    try {
      // Get Members
      const memRes = await fetch(`${API_BASE}/api/projects/${project.id}/members`, { credentials: 'include' });
      const memData = await memRes.json();
      if (memData.status === 'Success') setMembers(memData.data);

      // Get Workload Recommendation
      const workRes = await fetch(`${API_BASE}/api/tasks/project/${project.id}/workload`, { credentials: 'include' });
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
      const res = await fetch(`${API_BASE}/api/tasks/project/${project.id}/dashboard`, { credentials: 'include' });
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
      const res = await fetch(`${API_BASE}/api/tasks/project/${project.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const res = await fetch(`${API_BASE}/api/projects/${project.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      <div className="panel ws-header">
        <div className="panel-head">
          <span className="head-dot"></span>
          <span>Project Workspace</span>
          <span className="spacer"></span>
          <span className="head-idx">// {project.id}</span>
        </div>
        <div className="panel-body">
          <h2 className="ws-title">{project.title}</h2>
          <p className="ws-sub">{project.description || 'No description provided.'}</p>

          <div className="progress-label">
            <span>Project Completion</span>
            <span className="pct">{progress}%</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>

          {/* Workload Balancer Recommendation */}
          {recommendedMember && (
            <div className="rec-banner">
              <span className="rec-label">Recommendation</span>
              <span>
                Assign new tasks to <strong>{recommendedMember.username}</strong> (
                {recommendedMember.active_task_count} active tasks)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Task Filters & Creation */}
      <div className="ws-forms">
        {/* Task Creation Form */}
        <div className="panel">
          <div className="panel-head">
            <span className="head-dot"></span>
            <span>+ Add New Task</span>
          </div>
          <div className="panel-body">
            <form onSubmit={handleCreateTask} className="form-grid">
              <div>
                <label className="label" htmlFor="task-title">Task Title</label>
                <input
                  className="field"
                  id="task-title"
                  type="text"
                  placeholder="Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="task-desc">Description</label>
                <input
                  className="field"
                  id="task-desc"
                  type="text"
                  placeholder="Optional"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="task-assignee">Assignee</label>
                <select
                  className="field"
                  id="task-assignee"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                >
                  <option value="">Assign Member (Optional)</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.username} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn--primary">
                Create Task
              </button>
            </form>
          </div>
        </div>

        {/* Invite Member Section */}
        <div className="panel">
          <div className="panel-head">
            <span className="head-dot"></span>
            <span>Invite Team Member</span>
          </div>
          <div className="panel-body">
            <form onSubmit={handleInviteMember} className="form-grid">
              <div>
                <label className="label" htmlFor="invite-email">Member Email</label>
                <input
                  className="field"
                  id="invite-email"
                  type="email"
                  placeholder="name@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn--cyan">
                Send Invite
              </button>
            </form>
            {inviteMsg && <p className="form-success" style={{ marginTop: '0.7rem', marginBottom: 0 }}>{inviteMsg}</p>}
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="panel filter-bar">
        <div className="panel-head">
          <span className="head-dot"></span>
          <span>Filters</span>
        </div>
        <div className="panel-body">
          <div className="filter-row">
            <input
              className="field"
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <select
              className="field"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="">All Assignees</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.username}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          return (
            <div
              key={col}
              className={`kanban-column ${COLUMN_CLASS[col]}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
            >
              <h3>
                <span>{col}</span>
                <span className="col-count">{colTasks.length}</span>
              </h3>
              <div className="task-list">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="task-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <h4>{task.title}</h4>
                    <p className="task-desc">{task.description || 'No description'}</p>
                    <div className="task-meta">
                      <span className="task-assign">
                        <span className="a-idx">@</span>
                        {task.assignee_name || 'Unassigned'}
                      </span>
                      <span>{new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Feed Section */}
      <div className="panel activity-panel">
        <div className="panel-head">
          <span className="head-dot"></span>
          <span>Recent Activity Feed</span>
        </div>
        <div className="panel-body">
          <ul className="activity-list">
            {activityLogs.map((log) => (
              <li key={log.id}>
                <span>
                  <span className="who">{log.username}</span>: {log.action}
                </span>
                <span className="when">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
