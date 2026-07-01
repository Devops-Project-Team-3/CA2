# StudySpark

StudySpark is a group web app project using React + Vite for the frontend and Node.js + Express for the backend.

This repository is the shared base structure only. Feature logic is not implemented yet.

## Project Structure

```text
backend/
  src/
    config/
    controllers/
    routes/
    services/
  server.js
frontend/
  src/
    components/
    layouts/
    pages/
    services/
```

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Install Backend Dependencies

```bash
cd backend
npm install
```

## Run Frontend

```bash
cd frontend
npm run dev
```

The frontend runs on Vite's local development server.

## Run Backend

```bash
cd backend
npm run dev
```

By default, the backend runs on `http://localhost:5000`.

## Assigned Files

| Teammate | Feature | Frontend Page | Backend Route | Backend Controller | Service |
| --- | --- | --- | --- | --- | --- |
| Izzul | User Authentication | `Login-Izzul.jsx`, `Register-Izzul.jsx`, `Profile-Izzul.jsx` | `authRoutes-Izzul.js` | `authController-Izzul.js` | `authService-Izzul.js` |
| Yuki | Study Planner CRUD | `StudyPlanner-Yuki.jsx` | `plannerRoutes-Yuki.js` | `plannerController-Yuki.js` | `plannerService-Yuki.js` |
| Zachary | Adaptive Dashboard | `Dashboard-Zachary.jsx` | `dashboardRoutes-Zachary.js` | `dashboardController-Zachary.js` | `dashboardService-Zachary.js` |
| Rui Feng | Notifications | `Notifications-RuiFeng.jsx` | `notificationRoutes-RuiFeng.js` | `notificationController-RuiFeng.js` | `notificationService-RuiFeng.js` |
| Kenneth | AI Quiz Generator | `AIQuiz-Kenneth.jsx` | `quizRoutes-Kenneth.js` | `quizController-Kenneth.js` | `quizService-Kenneth.js` |
| Ryan | GitHub & System Design | System design documentation and repo workflow | Base repo workflow | Base repo workflow | Base repo workflow |

Shared frontend API helper: `frontend/src/services/api.js`

Frontend service files call backend API routes so pages do not need to know backend route details directly.

## Homepage Hub

The homepage is the shared entry point for StudySpark. Each feature card links to the owner's placeholder page so teammates can quickly find the part of the project they are responsible for.

Teammates should build inside their assigned files. Shared files like `Navbar.jsx`, `Layout.jsx`, `App.jsx`, and `Home-Shared.jsx` should only be edited after team agreement.

## Future Database Integration

The project currently uses placeholder/mock data only. No real database is installed or configured yet.

Frontend pages should call frontend service files, and frontend service files should call backend API routes. Backend routes should call controller functions. When the team adds a database later, the backend controllers can be updated to read and write data using Supabase or SQL without rewriting the frontend page structure.

Future database setup should use environment variables in `.env` for database URLs, keys, and credentials. Do not commit real database credentials to the repository.

The placeholder database config file is located at `backend/src/config/database.js`.

## Branch Workflow

- `main` = stable base only
- `feature/auth` = Izzul
- `feature/planner` = Yuki
- `feature/dashboard` = Zachary
- `feature/notifications` = Rui Feng
- `feature/ai-quiz` = Kenneth
- `feature/system-design` = Ryan

Create your feature branch from `main`, work only in your assigned files unless agreed by the team, and open a pull request back into `main` when ready.
