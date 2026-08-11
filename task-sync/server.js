const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { initDatabase } = require("./controllers/initDB");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// Initialize Database Schema
initDatabase();

// Base Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "Success",
    message: "Welcome to TaskSync Workspace API",
  });
});

app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`Successfully connected to Server at port ${PORT}`);
});