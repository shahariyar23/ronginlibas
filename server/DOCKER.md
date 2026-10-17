# Rongin Libas - NestJS Backend Docker Guide

This guide details how to build, run, test, and deploy the `server/` NestJS backend using Docker and Docker Compose on local machines (`linux/amd64` and `linux/arm64`) and Oracle Cloud Infrastructure (OCI) ARM64 Ubuntu VMs (`aarch64`).

---

## 1. Architecture & Design Principles

- **Isolated Backend Dockerization**: Only `server/` is containerized. `web/` and `admin/` frontends remain decoupled, and Vercel serverless deployment behavior for GitHub pushes is completely preserved.
- **Multi-Platform Support**: Built on `node:24-bookworm-slim`, providing first-class compatibility with `linux/arm64` (Oracle Ampere A1 Compute) and `linux/amd64`.
- **Multi-Stage Build**:
  - `builder`: Installs complete dependencies (including devDependencies and native build toolchain `python3`, `make`, `g++`), generates multi-platform Prisma Client engines, compiles TypeScript via NestJS, and prunes devDependencies.
  - `runner`: Lightweight production image with runtime OpenSSL, CA certificates, `curl`, and executes as a non-root `node` user (UID/GID 1000).
- **Prisma & Database**: Pre-generates Prisma client engines (`debian-openssl-3.0.x`, `linux-arm64-openssl-3.0.x`, `rhel-openssl-3.0.x`, `native`). Uses existing managed PostgreSQL (e.g., Neon serverless) via SSL. **Does not execute destructive migrations automatically on container startup.**
- **Security & Secrets**: Never bakes `.env` into the Docker image. Secrets are supplied at runtime via environment variables or a host `.env` file. Automatically strips outer quotes from environment values passed by Docker.
- **Port & Binding**: Binds to `0.0.0.0:${PORT:-4000}` inside the container so network ingress functions reliably.
- **Health Check**: Native health monitoring configured using `curl -f http://localhost:4000/api/v1/health`.

---

## 2. Prerequisites

- Docker Engine (v24+ or v26+)
- Docker Compose (v2.20+)
- Access to your hosted PostgreSQL database (e.g. Neon)
- A local `.env` file inside `server/` (copied from `server/.env.example`)

---

## 3. Local Docker Build & Run

### A. Build Image Locally
From the `server/` directory:

```bash
cd server
docker build -t rongin-libas-server:latest .
```

To cross-build specifically for ARM64 using Docker Buildx:
```bash
docker buildx build --platform linux/arm64 -t rongin-libas-server:arm64 --load .
```

### B. Run Image with Environment Variables

Run the container using your local `.env` file:

```bash
docker run -d \
  --name rongin-libas-server \
  -p 4000:4000 \
  --env-file .env \
  rongin-libas-server:latest
```

Check logs:
```bash
docker logs -f rongin-libas-server
```

Verify health check:
```bash
docker inspect --format='{{json .State.Health}}' rongin-libas-server
curl -i http://localhost:4000/api/v1/health
```

Stop and remove container:
```bash
docker stop rongin-libas-server
docker rm rongin-libas-server
```

---

## 4. Docker Compose Commands

The provided `docker-compose.yml` runs exclusively the NestJS backend and connects to your external PostgreSQL (Neon) database.

### Start Backend in Background
```bash
cd server
docker compose up -d
```

### View Live Logs
```bash
docker compose logs -f
```

### Check Container Status & Health
```bash
docker compose ps
```

### Stop Backend
```bash
docker compose down
```

### Rebuild and Restart after Code Changes
```bash
docker compose up -d --build
```

---

## 5. Environment Variables Reference

Provide these variables in your host `.env` file (never commit `.env` to Git):

| Variable | Required | Description | Example / Default |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | Environment mode | `production` |
| `PORT` | Yes | HTTP listening port | `4000` |
| `HOST` | No | Network binding host | `0.0.0.0` |
| `DATABASE_URL` | Yes | PostgreSQL connection string with SSL | `postgresql://user:pass@ep-xyz.neon.tech/rongin_libas?sslmode=require` |
| `JWT_ACCESS_SECRET` | Yes | Access token signing secret (32+ chars) | `openssl rand -base64 48` |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret (32+ chars) | `openssl rand -base64 48` |
| `JWT_ACCESS_EXPIRES_IN` | No | Access token lifespan | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token lifespan | `7d` |
| `WEB_FRONTEND_URL` | Yes | Customer storefront origin for CORS | `https://ronginlibas.com` |
| `ADMIN_FRONTEND_URL` | Yes | Admin frontend origin for CORS | `https://admin.ronginlibas.com` |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary media storage | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key | `1234567890` |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret | `secret` |
| `UDDOKTAPAY_ENV` | Optional | Payment gateway mode | `sandbox` or `production` |
| `UDDOKTAPAY_BASE_URL` | Optional | Payment gateway base URL | `https://sandbox.uddoktapay.com` |
| `UDDOKTAPAY_API_KEY` | Optional | Payment gateway secret key | `api_key` |
| `STEADFAST_ENABLED` | Optional | Courier logistics toggle | `true` |
| `STEADFAST_MODE` | Optional | Courier simulator or live | `mock` or `live` |
| `STEADFAST_API_KEY` | Optional | Steadfast merchant key | `key` |
| `STEADFAST_SECRET_KEY`| Optional | Steadfast merchant secret | `secret` |
| `SMTP_HOST` | Optional | Mail server host | `smtp.gmail.com` |
| `SMTP_PORT` | Optional | Mail server port | `587` |
| `SMTP_USER` | Optional | Mail authentication username | `noreply@domain.com` |
| `SMTP_PASS` | Optional | Mail authentication password | `app_password` |

---

## 6. Prisma Database Migrations

In accordance with production reliability standards, container startup **does not execute destructive migrations** or schema resets.

### Applying Migrations to Production Database
To run pending migrations against your database from inside the running container:

```bash
docker compose exec server npx prisma migrate deploy
```

Or using standard Docker:
```bash
docker exec -it rongin-libas-server npx prisma migrate deploy
```

### Checking Migration Status
```bash
docker compose exec server npx prisma migrate status
```

### Creating an Admin User
If initializing a fresh database, run the admin generation script inside the container:
```bash
docker compose exec server node scripts/create-admin.js
```

---

## 7. Oracle Cloud ARM64 (aarch64) Ubuntu Deployment

Oracle Cloud provides Always Free Ampere A1 ARM64 compute instances (up to 4 OCPUs and 24 GB RAM). Follow these steps to deploy:

### Step 1: Provision Oracle Cloud VM
1. Create a VM instance on OCI with **Canonical Ubuntu 24.04 or 22.04 Minimal (aarch64)**.
2. In the VM's VCN Security List, add an **Ingress Rule** for port `4000` (or `80`/`443` if using a reverse proxy):
   - Source CIDR: `0.0.0.0/0`
   - Protocol: `TCP`
   - Destination Port Range: `4000`

### Step 2: Install Docker on the ARM64 VM
SSH into your Oracle VM:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg lsb-release

# Install Docker Engine
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow ubuntu user to run docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

Verify architecture:
```bash
uname -m
# Should return: aarch64
docker run --rm hello-world
```

### Step 3: Configure Firewall (iptables / ufw)
Oracle Ubuntu images include strict `iptables` rules by default. Allow port 4000:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 4000 -j ACCEPT
sudo netfilter-persistent save
```
*(Or if using UFW: `sudo ufw allow 4000/tcp`)*

### Step 4: Clone Repository & Build Backend

```bash
git clone -b oracle-docker https://github.com/your-org/RonginLibas.git
cd RonginLibas/server

# Create production .env file
nano .env
# (Paste production DATABASE_URL, JWT secrets, etc.)

# Start backend via Docker Compose
docker compose up -d --build
```

### Step 5: Verify Deployment on Oracle VM
```bash
# Check container status
docker compose ps

# Check logs
docker compose logs -f

# Verify local endpoint
curl -i http://localhost:4000/api/v1/health

# Verify from external workstation
curl -i http://<ORACLE_VM_PUBLIC_IP>:4000/api/v1/health
```

---

## 8. Troubleshooting & Common Issues

### Issue 1: `the URL must start with the protocol postgresql:// or postgres://`
- **Cause**: Wrapping quotes around `DATABASE_URL` in `.env` (e.g. `DATABASE_URL="postgresql://..."`) being parsed literally by Docker `--env-file`.
- **Resolution**: `server/src/main.ts` and `server/src/prisma/prisma.service.ts` automatically strip leading/trailing quotes from environment values. If editing manually, ensure values in `.env` do not contain superfluous quotes.

### Issue 2: Health check fails or returns connection refused
- **Cause**: Server listening on `127.0.0.1` instead of `0.0.0.0`, or port mismatch.
- **Resolution**: `main.ts` explicitly binds to `0.0.0.0`. Verify `PORT=4000` is set in `.env` and matches the exposed Docker port mapping.

### Issue 3: Cannot connect to Neon PostgreSQL database from VM
- **Cause**: Outbound internet traffic blocked or SSL certificates missing.
- **Resolution**: The `runner` stage includes `ca-certificates`. Verify your Oracle VM has outbound internet connectivity (`curl -I https://neon.tech`). Verify that Neon connection string specifies `sslmode=require`.

### Issue 4: Out of Memory during `npm ci` on 1GB RAM instances
- **Cause**: Ampere A1 instances with 1GB RAM may encounter memory pressure during TypeScript/Prisma compilation.
- **Resolution**: Enable 2GB or 4GB of swap space on the VM:
  ```bash
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```

### Issue 5: Port 4000 unreachable from the browser
- **Cause**: Oracle Cloud Security List ingress rule missing or local Ubuntu iptables blocking port.
- **Resolution**: Add TCP port 4000 ingress rule in OCI VCN Security List and run `sudo iptables -I INPUT 6 -p tcp --dport 4000 -j ACCEPT`.

---

## 9. Vercel Coexistence Guarantee

The Docker setup is strictly self-contained within `server/`:
- Vercel deployments from GitHub use `server/src/main.ts` and `package.json` directly.
- `schema.prisma` retains `rhel-openssl-3.0.x` for AWS Lambda / Amazon Linux Vercel execution environments.
- No root configs, frontend paths (`web/`, `admin/`), or Vercel build workflows were modified.
