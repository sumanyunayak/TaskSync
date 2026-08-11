const express = require("express");
const router = express.Router();
const {
  createProject,
  getUserProjects,
  inviteMember,
  getProjectMembers,
} = require("../controllers/projectController");

const {
  authenticateUser,
  authorizeProjectMember,
  authorizeProjectAdmin,
} = require("../middleware/authMiddleware");

// All project routes require user authentication
router.use(authenticateUser);

// Routes
router.post("/", createProject);
router.get("/", getUserProjects);

// Project specific routes
router.get("/:projectId/members", authorizeProjectMember, getProjectMembers);
router.post(
  "/:projectId/invite",
  authorizeProjectMember,
  authorizeProjectAdmin,
  inviteMember
);

module.exports = router;