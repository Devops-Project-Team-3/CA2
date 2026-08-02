# StudySpark

StudySpark is a React + Vite frontend with a Node.js + Express backend and a shared Aiven MySQL database.

For the easiest setup, use Docker:

[TEAM_RUN_GUIDE.md](TEAM_RUN_GUIDE.md)

Containerisation details for marking:

[CONTAINERIZATION.md](CONTAINERIZATION.md)

## Quick Start

From the `StudySpark base` folder:

```bash
docker compose up --build
```

Open:

```text
http://localhost:5173
```

The backend runs on:

```text
http://localhost:5000
```

## Environment Variables

The backend needs a private env file:

```text
backend/.env
```

Use [.env.example](.env.example) as the template, but do not commit real credentials.

## Project Structure

```text
backend/
  src/
    config/
    controllers/
    database/
    routes/
    services/
frontend/
  src/
    components/
    layouts/
    pages/
    services/
```

## Main Features

- User registration, login, and profile avatar
- Study planner sessions
- Dashboard with account-scoped study and quiz data
- Notifications and reminder acknowledgement
- AI quiz generation with text/PDF input
- Light, dark, and cozy themes

## Assigned Areas

| Teammate | Feature |
| --- | --- |
| Izzul | Authentication and profile |
| Yuki | Study planner |
| Zachary | Dashboard |
| Rui Feng | Notifications |
| Kenneth | AI quiz |
| Ryan | System design and repository workflow |

## Notes

- Do not commit `backend/.env`.
- Classmates should use the same private Aiven env values if all data should go into the shared database.
- Docker runs the frontend and backend only. Aiven stays online separately.
