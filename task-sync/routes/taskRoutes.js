const express = require("express");
const router = express.Router();

const {
  createTask,
  getProjectTasks,
  updateTask,
  getWorkloadRecommendation,
  getProjectDashboard,
} = require("../controllers/taskController");

const {
  authenticateUser,
  authorizeProjectMember,
} = require("../middleware/authMiddleware");

// Authenticate all routes
router.use(authenticateUser);

// Project Task Routes
router.post("/project/:projectId", authorizeProjectMember, createTask);
router.get("/project/:projectId", authorizeProjectMember, getProjectTasks);
router.get("/project/:projectId/workload", authorizeProjectMember, getWorkloadRecommendation);
router.get("/project/:projectId/dashboard", authorizeProjectMember, getProjectDashboard);

// Direct Task Modification Routes
router.put("/:taskId", updateTask);

module.exports = router;