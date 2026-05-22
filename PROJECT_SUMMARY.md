# Tour Planner — Project Summary

**Course:** SWEN2 · FH Technikum Wien · 2026

---

## Purpose

Tour Planner is a full-stack web application for planning, managing, and documenting outdoor tours.
Users can register, log in, create tours with automatically calculated routes (via OpenRouteService API),
attach tour logs with statistics (distance, duration, difficulty rating), and export/import tour data.
The entire application is containerised with Docker and deployed to Microsoft Azure via a fully automated CI/CD pipeline built with Azure Pipelines.

---

## Team Members — DevOps Responsibilities

| Name | DevOps Role |
|---|---|
| **Hashkeil Mahmoud** | Azure DevOps Pipeline (`azure-pipelines.yml`) · Security: Variable Group, Service Connections · Deploy to Azure Container Apps |
| **Amin Kasmi** | Stage 1 CI — Frontend build job (`npm ci`, `ng build --configuration=production`) · Pipeline artifact for frontend dist |
| **Muaz Ahmed** | Docker setup · `docker-compose.yml` · Multi-stage Dockerfiles · Stage 3 Docker Build & Push to ACR |
| **Glen** | IaC — Bicep templates (`infra/main.bicep`) · Stage 2 Bicep lint validation · Azure infrastructure provisioning |

---

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Angular 19, nginx (Docker multi-stage build) |
| Backend | Spring Boot 4, Java 17, Maven (Docker multi-stage build) |
| Database | PostgreSQL 16 (Azure Database for PostgreSQL Flexible Server) |
| Authentication | JWT — stateless, signed with HMAC-SHA256 |
| Routing API | OpenRouteService REST API |
| Container Registry | Azure Container Registry (ACR) |
| Cloud Deployment | Azure Container Apps (Spain Central) |
| Secrets | Azure DevOps Variable Group (encrypted secret variables) |
| CI/CD | Azure Pipelines (`azure-pipelines.yml`) |

---

## Azure DevOps — Pipeline Overview

The pipeline is defined in `azure-pipelines.yml` and runs automatically on every push to `master`.

**Stage 1 — Build & Test (CI)**
Backend and frontend build in parallel on `ubuntu-latest` agents.
- Backend: `mvn clean verify` with Java 17 — enforces unit test execution, publishes JUnit results
- Frontend: `npm ci` + `ng build --configuration=production` with Node 20

**Stage 2 — IaC Validate**
`bicep lint infra/main.bicep` — validates infrastructure-as-code before any deployment

**Stage 3 — Docker Build & Push**
Builds backend and frontend Docker images and pushes to Azure Container Registry.
Auth via `tour-planner-acr-connection` Service Connection — no credentials in YAML.
Images are tagged with `$(Build.BuildId)` (for rollback) and `latest`.

**Stage 4 — Release / Deploy**
Updates Azure Container Apps with the new images and injects all secrets from the Variable Group at runtime.
A smoke test (`curl /actuator/health`) verifies the backend is healthy after deployment.

---

## Security

**Rule: NO passwords, secrets, or API keys are stored in Git or in the pipeline YAML.**

| Secret | Stored in | How accessed in pipeline |
|---|---|---|
| `DB-PASSWORD` | Azure DevOps Variable Group (encrypted) | `$(DB-PASSWORD)` — masked in logs |
| `JWT-SECRET` | Azure DevOps Variable Group (encrypted) | `$(JWT-SECRET)` — masked in logs |
| `ORS-API-KEY` | Azure DevOps Variable Group (encrypted) | `$(ORS-API-KEY)` — masked in logs |
| ACR credentials | Service Connection `tour-planner-acr-connection` | Used by `Docker@2` task |
| Azure credentials | Service Connection `tour-planner-azure-connection` | Used by `AzureCLI@2` task — Contributor on RG only |

Local development uses a `.env` file (excluded from Git via `.gitignore`).
The `.env.example` file shows required variable names without any real values.

---

## Pipeline Flow

```
git push → master  →  CI (Build+Test)  →  IaC Validate  →  Docker Build+Push  →  Deploy + Smoke Test
```
