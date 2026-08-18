const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models/connection.js");

// 1. User Registration
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      status: "Failed",
      message: "Please provide username, email, and password",
    });
  }

  try {
    const checkUserQuery = `SELECT * FROM users WHERE email = $1 OR username = $2;`;
    const existingUser = await db.query(checkUserQuery, [email, username]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        status: "Failed",
        message: "User with this email or username already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const createUserQuery = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at;
    `;

    const result = await db.query(createUserQuery, [
      username,
      email,
      hashedPassword,
    ]);

    res.status(201).json({
      status: "Success",
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Something went wrong during registration",
      error: error.message,
    });
  }
};

// 2. User Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "Failed",
      message: "Please provide email and password",
    });
  }

  try {
    const findUserQuery = `SELECT * FROM users WHERE email = $1;`;
    const result = await db.query(findUserQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "Failed",
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "Failed",
        message: "Invalid email or password",
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" },
    );

    // Set HttpOnly Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Require HTTPS in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    res.status(200).json({
      status: "Success",
      message: "Logged in successfully",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Something went wrong during login",
      error: error.message,
    });
  }
};

// 3. User Logout
const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    status: "Success",
    message: "Logged out successfully",
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
