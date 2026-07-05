# Tour Planner

A full-stack tour planning app: create tours with auto-calculated routes, log each trip, and search/export your data. Every user's tours and logs are private to their own account.

**Course:** SWEN2 · FH Technikum Wien

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, Leaflet, Lucide icons |
| Backend | Spring Boot 4, Java 17, Spring Security |
| Database | PostgreSQL 16 |
| Auth | JWT (stateless, BCrypt-hashed passwords) |
| Routing API | OpenRouteService |
| Deployment | Docker Compose |

## Getting Started

1. **Create a `.env` file** in the project root with:
   ```
   DB_USER=postgres
   DB_PASSWORD=<choose a password>
   JWT_SECRET=<a long random string>
   ORS_API_KEY=<free key from https://openrouteservice.org>
   ```
2. **Run it:**
   ```bash
   docker compose up -d --build
   ```
3. Open the app at **http://localhost:4201**. The backend API is at `http://localhost:8081` (Swagger UI: `/swagger-ui/index.html`).

## Project Structure

```
tour-planner_backend/    Spring Boot API (presentation → business logic → data access)
tour-planner_frontend/   Angular SPA
init-db.sql              Postgres init script (mounted into the postgres container)
docker-compose.yml        Orchestrates postgres + backend + frontend
```

## Key Features

- Tour CRUD with auto-fetched route (distance/time/geometry) via OpenRouteService
- Per-tour trip logs (date, difficulty, distance, rating) with computed popularity/rating/child-friendliness
- Full-text search, JSON/CSV export, JSON/CSV import
- Real account settings: edit profile, change password (BCrypt-verified)
- Light/dark/auto theme

## Testing

Backend unit tests (JUnit 5 + Mockito) cover the business-logic layer — see `tour-planner_backend/src/test/java`. Run with:
```bash
cd tour-planner_backend && ./mvnw test
```

A Postman collection (`Tour-Planner.postman_collection.json`) is included for manual API testing — see `PRESENTATION.md` for details on how the project evolved.
