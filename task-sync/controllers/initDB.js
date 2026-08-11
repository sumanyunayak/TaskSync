const { query } = require("../models/connection.js");

const initDatabase = async () => {
  console.log("initDatabase function started...");

  try {
    const result = await query("SELECT current_database();");
    console.log("Connected to:", result.rows[0].current_database);

    // Drop tables if they exist (Uncomment during initial dev reset)
    await query("DROP TABLE IF EXISTS task_history CASCADE;");
    await query("DROP TABLE IF EXISTS activity_logs CASCADE;");
    await query("DROP TABLE IF EXISTS tasks CASCADE;");
    await query("DROP TABLE IF EXISTS project_members CASCADE;");
    await query("DROP TABLE IF EXISTS projects CASCADE;");
    await query("DROP TABLE IF EXISTS users CASCADE;");

    // 1. Users Table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(300) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Projects Table
    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_by INT REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Project Members Table
    const createProjectMembersTable = `
      CREATE TABLE IF NOT EXISTS project_members (
        id SERIAL PRIMARY KEY,
        project_id INT REFERENCES projects(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'Member',
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, user_id)
      );
    `;

    // 4. Tasks Table
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'To Do',
        project_id INT REFERENCES projects(id) ON DELETE CASCADE,
        assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 5. Activity Logs Table
    const createActivityLogsTable = `
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        project_id INT REFERENCES projects(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. Task History Table
    const createTaskHistoryTable = `
      CREATE TABLE IF NOT EXISTS task_history (
        id SERIAL PRIMARY KEY,
        task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        field_changed VARCHAR(100) NOT NULL,
        old_value TEXT,
        new_value TEXT,
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await query(createUsersTable);
    await query(createProjectsTable);
    await query(createProjectMembersTable);
    await query(createTasksTable);
    await query(createActivityLogsTable);
    await query(createTaskHistoryTable);

    console.log("All tables recreated successfully with correct columns!");
  } catch (error) {
    console.error("Error creating tables:", error);
    process.exit(1);
  }
};

module.exports = {
  initDatabase,
};