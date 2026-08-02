# StudySpark Containerisation Notes

This project uses Docker Compose to run the StudySpark frontend and backend consistently across team machines.

## Containers

| Service | Purpose | Dockerfile |
| --- | --- | --- |
| `backend` | Runs the Express API on port `5000` | `backend/Dockerfile` |
| `frontend` | Serves the built React app through Nginx on port `5173` | `frontend/Dockerfile` |
| `backend-test` | Runs backend smoke tests in Docker | `backend/Dockerfile` test stage |
| `frontend-test` | Runs the frontend production build test in Docker | `frontend/Dockerfile` test stage |

## Strong Containerisation Features

- Multi-stage Dockerfiles are used for structured image builds.
- The frontend is built with Vite and served using Nginx instead of a development server.
- Nginx proxies `/api` requests to the backend container, so the browser can use the same frontend URL.
- The frontend proxy is controlled by the `BACKEND_URL` environment variable, so the same image works locally and on Render.
- Backend configuration is injected through `backend/.env`.
- Aiven MySQL stays outside Docker and is configured with environment variables.
- Health checks are defined for frontend and backend containers.
- Docker Compose waits for the backend health check before starting the frontend.
- Separate Docker test services are available for frontend and backend checks.
- `.dockerignore` excludes `node_modules`, `.env`, and build output from Docker build context.

## Run The App

```bash
docker compose up --build
```

Open:

```text
http://localhost:5173
```

Backend check:

```text
http://localhost:5000
```

## Run Container Tests

```bash
docker compose run --rm backend-test
docker compose run --rm frontend-test
```

This proves both application sides can build/run their checks inside Docker:

- `backend-test`: route/config smoke tests
- `frontend-test`: Vite production build

## Environment Variables

Create:

```text
backend/.env
```

Use `.env.example` as the template. Do not commit real credentials.

Important variables:

```env
PORT=5000
DB_HOST=your-aiven-host
DB_PORT=your-aiven-port
DB_USER=avnadmin
DB_PASSWORD=your-aiven-password
DB_NAME=defaultdb
DB_SSL=true
JWT_SECRET=use-a-long-random-secret
GEMINI_API_KEY=optional-gemini-key
```

## Render Deployment Notes

If frontend and backend are deployed as separate Render services:

- Backend service needs the normal backend env vars from `.env.example`.
- Frontend service needs:

```env
BACKEND_URL=https://your-backend-service-name.onrender.com
```

Do not set `BACKEND_URL` to `localhost` on Render. On Render, `localhost` means the frontend container itself, not the backend service.
