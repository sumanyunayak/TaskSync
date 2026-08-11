const db = require("../models/connection.js");

// 1. Create a Task inside a Project
const createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assigned_to, status } = req.body;
  const userId = req.user.id;

  if (!title) {
    return res.status(400).json({
      status: "Failed",
      message: "Task title is required",
    });
  }

  try {
    const taskStatus = status || "To Do";
    const assignedUser = assigned_to || null;

    const createTaskQuery = `
      INSERT INTO tasks (title, description, status, project_id, assigned_to)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await db.query(createTaskQuery, [
      title,
      description,
      taskStatus,
      projectId,
      assignedUser,
    ]);

    const newTask = result.rows[0];

    // Log Activity
    await db.query(
      "INSERT INTO activity_logs (project_id, user_id, action) VALUES ($1, $2, $3);",
      [projectId, userId, `Created task "${title}"`]
    );

    res.status(201).json({
      status: "Success",
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed to create task",
      error: error.message,
    });
  }
};

// 2. Get All Tasks for a Project (with Search & Filtering)
const getProjectTasks = async (req, res) => {
  const { projectId } = req.params;
  const { search, status, assigned_to } = req.query;

  try {
    let queryText = `
      SELECT t.*, u.username as assignee_name 
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1
    `;
    const queryParams = [projectId];

    // Search by title
    if (search) {
      queryParams.push(`%${search}%`);
      queryText += ` AND t.title ILIKE $${queryParams.length}`;
    }

    // Filter by status
    if (status) {
      queryParams.push(status);
      queryText += ` AND t.status = $${queryParams.length}`;
    }

    // Filter by assigned user
    if (assigned_to) {
      queryParams.push(assigned_to);
      queryText += ` AND t.assigned_to = $${queryParams.length}`;
    }

    queryText += ` ORDER BY t.created_at DESC;`;

    const result = await db.query(queryText, queryParams);

    res.status(200).json({
      status: "Success",
      message: "Tasks fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};

// 3. Update Task Status / Details with Task History
const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, assigned_to } = req.body;
  const userId = req.user.id;

  try {
    // Get existing task details
    const existingTaskResult = await db.query("SELECT * FROM tasks WHERE id = $1;", [taskId]);
    if (existingTaskResult.rows.length === 0) {
      return res.status(404).json({
        status: "Failed",
        message: "Task not found",
      });
    }

    const currentTask = existingTaskResult.rows[0];

    // Fields to track for history
    const updates = [];
    const values = [];
    let paramIndex = 1;

    // Check updates and record Task History
    if (title && title !== currentTask.title) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
      await db.query(
        "INSERT INTO task_history (task_id, user_id, field_changed, old_value, new_value) VALUES ($1, $2, $3, $4, $5);",
        [taskId, userId, "title", currentTask.title, title]
      );
    }

    if (description !== undefined && description !== currentTask.description) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
      await db.query(
        "INSERT INTO task_history (task_id, user_id, field_changed, old_value, new_value) VALUES ($1, $2, $3, $4, $5);",
        [taskId, userId, "description", currentTask.description, description]
      );
    }

    if (status && status !== currentTask.status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
      await db.query(
        "INSERT INTO task_history (task_id, user_id, field_changed, old_value, new_value) VALUES ($1, $2, $3, $4, $5);",
        [taskId, userId, "status", currentTask.status, status]
      );

      // Log activity for status change
      await db.query(
        "INSERT INTO activity_logs (project_id, user_id, action) VALUES ($1, $2, $3);",
        [currentTask.project_id, userId, `Moved task "${currentTask.title}" to ${status}`]
      );
    }

    if (assigned_to !== undefined && assigned_to !== currentTask.assigned_to) {
      updates.push(`assigned_to = $${paramIndex++}`);
      values.push(assigned_to);
      await db.query(
        "INSERT INTO task_history (task_id, user_id, field_changed, old_value, new_value) VALUES ($1, $2, $3, $4, $5);",
        [taskId, userId, "assigned_to", String(currentTask.assigned_to), String(assigned_to)]
      );
    }

    if (updates.length === 0) {
      return res.status(200).json({
        status: "Success",
        message: "No changes detected",
        data: currentTask,
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(taskId);

    const updateQuery = `
      UPDATE tasks 
      SET ${updates.join(", ")} 
      WHERE id = $${paramIndex} 
      RETURNING *;
    `;

    const updatedResult = await db.query(updateQuery, values);

    res.status(200).json({
      status: "Success",
      message: "Task updated successfully",
      data: updatedResult.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed to update task",
      error: error.message,
    });
  }
};

// 4. Intelligent Workload Balancer
const getWorkloadRecommendation = async (req, res) => {
  const { projectId } = req.params;

  try {
    const workloadQuery = `
      SELECT u.id as user_id, u.username, u.email,
        COUNT(t.id) FILTER (WHERE t.status IN ('To Do', 'In Progress')) as active_task_count
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      LEFT JOIN tasks t ON u.id = t.assigned_to AND t.project_id = $1
      WHERE pm.project_id = $1
      GROUP BY u.id, u.username, u.email
      ORDER BY active_task_count ASC;
    `;

    const result = await db.query(workloadQuery, [projectId]);

    const recommendedMember = result.rows.length > 0 ? result.rows[0] : null;

    res.status(200).json({
      status: "Success",
      message: "Workload distribution retrieved successfully",
      data: {
        recommended_member: recommendedMember,
        all_members_workload: result.rows,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Error calculating workload",
      error: error.message,
    });
  }
};

// 5. Get Project Activity Logs & Progress Calculation
const getProjectDashboard = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Activity Logs
    const logsQuery = `
      SELECT al.*, u.username 
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      WHERE al.project_id = $1
      ORDER BY al.created_at DESC
      LIMIT 10;
    `;
    const logsResult = await db.query(logsQuery, [projectId]);

    // Progress Calculation
    const progressQuery = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'Done') as completed_tasks
      FROM tasks
      WHERE project_id = $1;
    `;
    const progressResult = await db.query(progressQuery, [projectId]);

    const total = parseInt(progressResult.rows[0].total_tasks, 10);
    const completed = parseInt(progressResult.rows[0].completed_tasks, 10);
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      status: "Success",
      message: "Project dashboard details fetched successfully",
      data: {
        total_tasks: total,
        completed_tasks: completed,
        progress_percentage: progressPercentage,
        recent_activity: logsResult.rows,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Error fetching project dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  updateTask,
  getWorkloadRecommendation,
  getProjectDashboard,
};