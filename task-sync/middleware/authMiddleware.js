const jwt = require("jsonwebtoken");
const db = require("../models/connection.js");

// 1. Verify Authentication Middleware
const authenticateUser = (req, res, next) => {
  // Get token from HttpOnly cookie OR Authorization header (Bearer <token>)
  let token = req.cookies ? req.cookies.token : null;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      status: "Failed",
      message: "Access denied. Authentication token missing.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    req.user = decoded; // Attach user payload ({ id, username, email }) to request
    next();
  } catch (error) {
    return res.status(401).json({
      status: "Failed",
      message: "Invalid or expired token.",
      error: error.message,
    });
  }
};

// 2. Verify Project Membership Middleware
const authorizeProjectMember = async (req, res, next) => {
  const rawId = req.params.projectId || req.params.id || req.body.project_id;
  const projectId = parseInt(rawId, 10);
  const userId = req.user.id;

  if (isNaN(projectId)) {
    return res.status(400).json({
      status: "Failed",
      message: "Invalid Project ID format.",
    });
  }

  try {
    // Check if project exists
    const projectResult = await db.query("SELECT * FROM projects WHERE id = $1;", [projectId]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        status: "Failed",
        message: "Project not found.",
      });
    }

    // Check project membership
    const memberQuery = `
      SELECT role FROM project_members 
      WHERE project_id = $1 AND user_id = $2;
    `;
    const memberResult = await db.query(memberQuery, [projectId, userId]);

    if (memberResult.rows.length === 0) {
      return res.status(403).json({
        status: "Failed",
        message: "Access forbidden. You are not a member of this project.",
      });
    }

    // Attach project role to request object
    req.projectRole = memberResult.rows[0].role;
    req.projectId = projectId;
    next();
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Authorization check failed.",
      error: error.message,
    });
  }
};

// 3. Verify Admin Role Middleware
const authorizeProjectAdmin = (req, res, next) => {
  if (req.projectRole !== "Admin") {
    return res.status(403).json({
      status: "Failed",
      message: "Permission denied. Only project Admins can perform this action.",
    });
  }
  next();
};

module.exports = {
  authenticateUser,
  authorizeProjectMember,
  authorizeProjectAdmin,
};