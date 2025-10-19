# 🌱 Carbon Footprint Tracker

_A DevOps-Oriented Full-Stack Project_

## ✅ 1. Overview

Carbon Footprint Tracker is a simple full-stack application built to demonstrate **CI/CD, containerization, and automation practices** using GitHub Actions, Docker, and AWS.

The focus of this project is **DevOps workflows**.

---

## ✅ 2. Tech Stack

### 🖥️ Backend

- Node.js + Express
- MongoDB (Mongoose)
- Jest + Supertest

### 🌐 Frontend

- HTML, CSS (Tailwind-like structure)
- Served via **Nginx container**

### 🐳 Containerization

- Docker & Docker Compose
- Multi-stage builds (Backend)
- Production-ready Nginx config

### ⚙️ CI/CD

- GitHub Actions
- Branch-based workflows:

  - `dev` ➝ Build & Test
  - `main` ➝ Build, Push & Deploy

### ☁️ Deployment Targets

- AWS EC2 (via SSM command)
- AWS ECR for Docker Images

---

## ✅ 3. Project Structure
```
carbon-tracker/
├── .github/
│ └── workflows/
│ └── deploy.yml
├── backend/
│ ├── src/
│ │ ├── **test**/
│ │ │ ├── activity.model.test.js
│ │ │ ├── metrics.test.js
│ │ │ └── server.test.js
│ │ ├── models/
│ │ │ └── activity.js
│ │ ├── metrics.js
│ │ └── server.js
│ ├── Dockerfile
│ ├── docker-compose.yml
│ ├── package.json
│ ├── .env.example
│ └── .eslintrc.js
├── frontend/
│ ├── index.html
│ ├── styles.css
│ ├── Dockerfile
│ └── nginx.conf
├── docker-compose.dev.yml
└── .gitignore
```
---

## ✅ 4. GitHub Actions (CI/CD Pipeline)

📌 Located in: `.github/workflows/deploy.yml`

### ✅ Pipeline Workflow

#### 🔹 🔄 Continuous Integration (All Branches)

- Runs on push or PR to `main` or `dev`
- Steps:
  ✅ Checkout code
  ✅ Install Node + dependencies
  ✅ Linting
  ✅ Unit tests + coverage
  ✅ Upload test reports
  ✅ Comment coverage in PRs

#### 🔹 🧪 Dev Branch (build only)

- Builds Docker image (tagged with `dev-SHA`)
- Validates container runs

#### 🔹 🚀 Main Branch → ECR + EC2 Deploy

- Build Docker image
- Push to AWS ECR (`latest` + SHA tag)
- Pull image on EC2
- Restart container via `aws ssm send-command`

---

## ✅ 5. Docker & Nginx Setup

### 📦 Backend (`backend/Dockerfile`)

- Multi-stage build
- Exposes port `4000`
- Healthcheck `/api/health`

### 🌍 Frontend (`frontend/Dockerfile`)

- Based on `nginx:alpine`
- Copies static files
- Uses `nginx.conf` for:

  - ✅ Reverse proxy for `/api/`
  - ✅ Gzip & caching
  - ✅ Health endpoint `/health`

### 🧩 Docker Compose (Development)

File: `docker-compose.dev.yml`

Services:

- MongoDB
- Backend
- Volumes for hot reload

---

## ✅ 6. Running Locally (Development Mode)

docker-compose -f docker-compose.dev.yml up --build

Then:

- Backend → [http://localhost:4000](http://localhost:4000)
- MongoDB → mongodb://localhost:27017
- Frontend (if enabled in compose) → [http://localhost:80](http://localhost:80)

---

## ✅ 7. Environment Variables (`backend/.env.example`)

PORT=4000
MONGO_URI=mongodb://mongo:27017/carbon_dev
NODE_ENV=development

Copy to `.env` before running.

---

## ✅ 8. Testing

Inside backend:

npm test

Coverage automatically generated and reported in GitHub Actions.

---

## ✅ 9. Production Deployment Flow

1️⃣ Push to `main` branch
2️⃣ GitHub Actions:

- Build backend Docker image
- Push to Amazon ECR
- Connect to EC2 via SSM
- Stop old container
- Pull latest image
- Run with `.env.production`

✅ No manual SSH required

---
