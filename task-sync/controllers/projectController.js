const db = require("../models/connection.js");

// 1. Create a Project (Using PostgreSQL Transaction)
const createProject = async (req, res) => {
  const { title, description } = req.body;
  const userId = parseInt(req.user.id, 10);

  if (!title) {
    return res.status(400).json({
      status: "Failed",
      message: "Project title is required",
    });
  }

  const client = await db.client();

  try {
    await client.query("BEGIN"); // Start Transaction

    // Insert Project
    const createProjectQuery = `
      INSERT INTO projects (title, description, created_by)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const projectRes = await client.query(createProjectQuery, [
      title,
      description,
      userId,
    ]);
    const newProject = projectRes.rows[0];

    // Automatically add creator as 'Admin' in project_members
    const addAdminQuery = `
      INSERT INTO project_members (project_id, user_id, role)
      VALUES ($1, $2, 'Admin');
    `;
    await client.query(addAdminQuery, [newProject.id, userId]);

    // Record Activity Log
    const logQuery = `
      INSERT INTO activity_logs (project_id, user_id, action)
      VALUES ($1, $2, $3);
    `;
    await client.query(logQuery, [
      newProject.id,
      userId,
      `Created project "${title}"`,
    ]);

    await client.query("COMMIT"); // Commit Transaction

    res.status(201).json({
      status: "Success",
      message: "Project created successfully",
      data: newProject,
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback on Error
    res.status(500).json({
      status: "Failed",
      message: "Failed to create project",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// 2. Get All Projects Accessible by Current User
const getUserProjects = async (req, res) => {
  const userId = req.user.id;

  try {
    const getProjectsQuery = `
      SELECT p.*, pm.role 
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = $1
      ORDER BY p.created_at DESC;
    `;
    const result = await db.query(getProjectsQuery, [userId]);

    res.status(200).json({
      status: "Success",
      message: "User projects fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Error fetching user projects",
      error: error.message,
    });
  }
};

// 3. Invite/Add Member to Project (Admin Only)
const inviteMember = async (req, res) => {
  const { projectId } = req.params;
  const { email, role } = req.body; // role defaults to 'Member'

  if (!email) {
    return res.status(400).json({
      status: "Failed",
      message: "User email is required to send invitation",
    });
  }

  try {
    // Find user by email
    const userResult = await db.query("SELECT id, username FROM users WHERE email = $1;", [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: "Failed",
        message: "No registered user found with this email",
      });
    }

    const invitedUser = userResult.rows[0];
    const memberRole = role || "Member";

    // Add user to project_members
    const addMemberQuery = `
      INSERT INTO project_members (project_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    await db.query(addMemberQuery, [projectId, invitedUser.id, memberRole]);

    // Log activity
    await db.query(
      "INSERT INTO activity_logs (project_id, user_id, action) VALUES ($1, $2, $3);",
      [projectId, req.user.id, `Invited ${invitedUser.username} as ${memberRole}`]
    );

    res.status(200).json({
      status: "Success",
      message: `User ${invitedUser.username} successfully added to project`,
    });
  } catch (error) {
    if (error.code === "23505") { // PostgreSQL unique violation error
      return res.status(400).json({
        status: "Failed",
        message: "User is already a member of this project",
      });
    }

    res.status(500).json({
      status: "Failed",
      message: "Failed to invite user",
      error: error.message,
    });
  }
};

// 4. Get All Members of a Project
const getProjectMembers = async (req, res) => {
  const { projectId } = req.params;

  try {
    const getMembersQuery = `
      SELECT u.id, u.username, u.email, pm.role, pm.joined_at
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1;
    `;
    const result = await db.query(getMembersQuery, [projectId]);

    res.status(200).json({
      status: "Success",
      message: "Project members fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Error fetching project members",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getUserProjects,
  inviteMember,
  getProjectMembers,
};