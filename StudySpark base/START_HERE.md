# Start Here: StudySpark

StudySpark is currently only the base skeleton for the group project. It has the shared folders, placeholder pages, placeholder backend routes, and setup instructions. Real feature logic will be added later by each feature owner.

## Important Rules

- Do not edit `main` directly.
- Create your own feature branch before working.
- Only edit your own feature files unless the team agrees first.
- Ask before changing shared files like `App.jsx`, `Navbar.jsx`, `Layout.jsx`, `Home-Shared.jsx`, or backend server setup.

## How To Run The Frontend

```bash
cd frontend
npm install
npm run dev
```

## How To Run The Backend

```bash
cd backend
npm install
npm run dev
```

## Branch Naming Rules

- `main` = stable base only
- `feature/auth` = Izzul
- `feature/planner` = Yuki
- `feature/dashboard` = Zachary
- `feature/notifications` = Rui Feng
- `feature/ai-quiz` = Kenneth
- `feature/system-design` = Ryan

## File Ownership

### Izzul: User Authentication

- `frontend/src/pages/Login-Izzul.jsx`
- `frontend/src/pages/Register-Izzul.jsx`
- `frontend/src/pages/Profile-Izzul.jsx`
- `frontend/src/services/authService-Izzul.js`
- `backend/src/routes/authRoutes-Izzul.js`
- `backend/src/controllers/authController-Izzul.js`

### Yuki: Study Planner CRUD

- `frontend/src/pages/StudyPlanner-Yuki.jsx`
- `frontend/src/services/plannerService-Yuki.js`
- `backend/src/routes/plannerRoutes-Yuki.js`
- `backend/src/controllers/plannerController-Yuki.js`

### Zachary: Adaptive Dashboard

- `frontend/src/pages/Dashboard-Zachary.jsx`
- `frontend/src/services/dashboardService-Zachary.js`
- `backend/src/routes/dashboardRoutes-Zachary.js`
- `backend/src/controllers/dashboardController-Zachary.js`

### Rui Feng: Notifications

- `frontend/src/pages/Notifications-RuiFeng.jsx`
- `frontend/src/services/notificationService-RuiFeng.js`
- `backend/src/routes/notificationRoutes-RuiFeng.js`
- `backend/src/controllers/notificationController-RuiFeng.js`

### Kenneth: AI Quiz Generator

- `frontend/src/pages/AIQuiz-Kenneth.jsx`
- `frontend/src/services/quizService-Kenneth.js`
- `backend/src/routes/quizRoutes-Kenneth.js`
- `backend/src/controllers/quizController-Kenneth.js`

### Ryan: GitHub & System Design

- `README.md`
- `START_HERE.md`
- GitHub branch workflow
- System design documentation

## Final Reminder

Work inside your assigned files. If you need to edit shared files, ask the team first.
