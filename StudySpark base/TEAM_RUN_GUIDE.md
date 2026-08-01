# StudySpark Team Run Guide

Use this guide to run the app with Docker. Docker runs the frontend and backend. The database is the shared Aiven MySQL database.

## 1. Install Required Apps

Install:

- Docker Desktop
- Git

Open Docker Desktop before running the app.

## 2. Get The Project

Clone the GitHub repo:

```bash
git clone https://github.com/Devops-Project-Team-3/CA2.git
```

Go into the app folder:

```bash
cd CA2
cd "StudySpark base"
```

If your folder is already called `StudySpark base`, just open a terminal there.

## 3. Create The Backend Env File

Inside `StudySpark base/backend`, create a file named:

```text
.env
```

Paste the private values given by the project owner.

Template:

```env
PORT=5000
DB_HOST=your-aiven-host
DB_PORT=your-aiven-port
DB_USER=avnadmin
DB_PASSWORD=your-aiven-password
DB_NAME=defaultdb
DB_SSL=true
JWT_SECRET=use-the-shared-team-secret
GEMINI_API_KEY=optional-gemini-key
```

Important:

- Do not rename `.env`.
- Do not put `.env` in the frontend folder.
- Do not commit `.env` to GitHub.
- If `GEMINI_API_KEY` is empty, normal app features work, but AI quiz generation may not work.

## 4. Start The App

From the `StudySpark base` folder, run:

```bash
docker compose up --build
```

Wait until you see the frontend is ready.

Open:

```text
http://localhost:5173
```

Backend check:

```text
http://localhost:5000
```

You should see:

```text
StudySpark backend base server is running.
```

## 5. Run Docker Tests

From the `StudySpark base` folder:

```bash
docker compose run --rm backend-test
docker compose run --rm frontend-test
```

This runs:

- `backend-test`: backend route/config smoke tests
- `frontend-test`: frontend production build test

Use this after pulling new code to prove the frontend and backend still pass inside Docker.

Containerisation details for marking are documented in:

```text
CONTAINERIZATION.md
```

For Render deployment, set the frontend environment variable:

```env
BACKEND_URL=https://your-backend-service-name.onrender.com
```

Do not use `localhost` for `BACKEND_URL` on Render.

## 6. Stop The App

Press `Ctrl + C` in the terminal.

Then run:

```bash
docker compose down
```

## 7. Start Again Next Time

From `StudySpark base`, run:

```bash
docker compose up
```

Use `--build` again only after pulling new code:

```bash
git pull
docker compose up --build
```

## 8. Common Fixes

If Docker says port `5000` or `5173` is already in use:

```bash
docker compose down
```

Then close any old frontend/backend terminals and run again:

```bash
docker compose up --build
```

If login/register/database features do not work:

- Check that `backend/.env` exists.
- Check that `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_SSL=true` are correct.
- Make sure Docker Desktop is running.

If AI quiz does not generate:

- Check `GEMINI_API_KEY` in `backend/.env`.

## 9. What Data Is Shared

All users connect to the same Aiven database if they use the same `backend/.env`.

Each account still has its own data because the backend stores data by logged-in user ID.
