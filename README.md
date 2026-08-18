# TaskSync – Collaborative Workspace

TaskSync is a modern, full-stack collaborative project management platform designed for team productivity and secure workspace management. Unlike simple to-do applications, TaskSync enables project owners to manage workspaces, invite registered team members, assign responsibilities, track dynamic project progress, and visualize workflow stages through an interactive, drag-and-drop Kanban interface.

---

## 🚀 Key Features

* **Authentication & Authorization**: Secure user registration and login using `bcryptjs` password hashing and JWT (JSON Web Tokens) stored in HttpOnly cookies.
* **Role-Based Workspace Security**: Multi-tier access control (`Admin` vs. `Member`) enforced via custom Express authorization middleware.
* **Interactive Drag-and-Drop Kanban Board**: Real-time status updates across workflow columns (`To Do`, `In Progress`, `Done`) powered by native HTML5 Drag and Drop.
* **Intelligent Workload Balancer**: Algorithmic task distribution that monitors member task counts and recommends the least occupied team member for assignment.
* **Project Progress Analytics**: Live project completion metrics calculated from task completion ratios.
* **Recent Activity Feed**: Real-time activity tracking for task status shifts, invitations, and workspace creation.
* **Task History & Modification Tracking**: System logs recording previous values, changed fields, timestamps, and user IDs for task updates.
* **Advanced Search & Filtering**: Instant task filtering by title search, completion status, or assigned team member.

---

## 🛠️ Tech Stack

### Frontend
* **Framework**: React + Vite (Single Page Application)
* **Styling**: Brutalist Design Architecture / Custom CSS
* **Icons**: Lucide React

### Backend
* **Runtime**: Node.js & Express.js
* **Authentication**: JSON Web Token (`jsonwebtoken`), `bcryptjs`, `cookie-parser`
* **Database Driver**: `pg` (PostgreSQL client pool)

### Database
* **Database**: PostgreSQL (Relational DB with foreign key constraints and SQL transactions)

---

## 📁 Project Structure

```text
task-sync/
├── client/                   # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI Components & Error Boundaries
│   │   ├── pages/            # AuthPage, Dashboard, and Workspace pages
│   │   ├── App.jsx           # Main Application State & Routing
│   │   ├── index.css         # Global Styles & Brutalist Theme
│   │   └── main.jsx          # React DOM Root
│   └── vite.config.js        # Vite Proxy Configuration
│
├── controllers/              # Backend Controllers
│   ├── authController.js     # User Register, Login, and Logout
│   ├── initDB.js             # Automated PostgreSQL Schema Creation
│   ├── projectController.js  # Projects & Team Invitations (SQL Transactions)
│   └── taskController.js     # Tasks, Workload Balancer & Analytics
│
├── middleware/               # Express Security Middleware
│   └── authMiddleware.js     # JWT Verification & Role Checks
│
├── models/                   # Database Connection
│   └── connection.js         # PostgreSQL Pool Instance
│
├── routes/                   # RESTful API Endpoints
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   └── taskRoutes.js
│
├── .env                      # Environment Variables Config
├── server.js                 # Express Application Entry Point
└── package.json

