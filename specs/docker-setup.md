# Docker Setup Specification

This document specifies the Docker configuration for the Booklite project, including Dockerfiles, docker-compose, and deployment configurations.

## Overview

The Booklite application uses Docker for:
- Local development environment
- Consistent build process
- Production deployment
- CI/CD pipelines

## Docker Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Docker Compose                     │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Frontend │  │ Backend  │  │  Nginx   │         │
│  │  (Astro) │  │(Fastify) │  │ (Proxy)  │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│       │              │              │               │
│       └──────────────┴──────────────┘               │
│                      │                               │
│              ┌───────┴────────┐                     │
│              │   PostgreSQL   │                     │
│              │   (Optional)   │                     │
│              └────────────────┘                     │
└─────────────────────────────────────────────────────┘
```

---

## Dockerfile Specifications

### Frontend Dockerfile

**Location**: `docker/frontend.Dockerfile`

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY frontend/ ./
COPY shared/ ../shared/

# Build application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install serve for static file serving
RUN npm install -g serve

# Copy built assets
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 4321

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4321/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["serve", "-s", "dist", "-l", "4321"]
```

### Backend Dockerfile

**Location**: `docker/backend.Dockerfile`

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY backend/ ./
COPY shared/ ../shared/

# Build application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies and built application
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/server.js"]
```

---

## Docker Compose Configuration

**Location**: `docker-compose.yml`

```yaml
version: '3.9'

services:
  # Frontend Service
  frontend:
    build:
      context: .
      dockerfile: docker/frontend.Dockerfile
    container_name: booklite-frontend
    ports:
      - '4321:4321'
    environment:
      - NODE_ENV=development
      - PUBLIC_API_URL=http://localhost:3000/v1
      - PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - backend
    networks:
      - booklite-network
    restart: unless-stopped

  # Backend Service
  backend:
    build:
      context: .
      dockerfile: docker/backend.Dockerfile
    container_name: booklite-backend
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
      - PORT=3000
      - HOST=0.0.0.0
      - DATABASE_URL=${DATABASE_URL}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=http://localhost:4321
      - CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID}
      - CLOUDFLARE_ACCESS_KEY_ID=${CLOUDFLARE_ACCESS_KEY_ID}
      - CLOUDFLARE_SECRET_ACCESS_KEY=${CLOUDFLARE_SECRET_ACCESS_KEY}
      - EMAIL_PROVIDER=postmark
      - POSTMARK_API_KEY=${POSTMARK_API_KEY}
    depends_on:
      - postgres
    networks:
      - booklite-network
    restart: unless-stopped
    volumes:
      - ./backend/uploads:/app/uploads

  # PostgreSQL (Optional - for local development)
  postgres:
    image: postgres:16-alpine
    container_name: booklite-postgres
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_USER=booklite
      - POSTGRES_PASSWORD=booklite_dev_password
      - POSTGRES_DB=booklite_dev
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./sql:/docker-entrypoint-initdb.d
    networks:
      - booklite-network
    restart: unless-stopped
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U booklite']
      interval: 10s
      timeout: 5s
      retries: 5

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: booklite-nginx
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - booklite-network
    restart: unless-stopped

  # Redis (Optional - for caching and sessions)
  redis:
    image: redis:7-alpine
    container_name: booklite-redis
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data
    networks:
      - booklite-network
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 3s
      retries: 5

networks:
  booklite-network:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
```

---

## Nginx Configuration

**Location**: `docker/nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:4321;
    }

    upstream backend {
        server backend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /v1/ {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # CORS headers
            add_header Access-Control-Allow-Origin $http_origin always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-CSRF-Token" always;
            add_header Access-Control-Allow-Credentials "true" always;
            
            if ($request_method = 'OPTIONS') {
                return 204;
            }
        }

        # Auth endpoints with stricter rate limiting
        location /v1/auth/ {
            limit_req zone=auth_limit burst=5 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

---

## .dockerignore

**Location**: `.dockerignore`

```
# Dependencies
node_modules
npm-debug.log
yarn-error.log

# Build outputs
dist
build
.astro
.output

# Environment files
.env
.env.*
!.env.example

# Git
.git
.gitignore
.gitattributes

# IDE
.vscode
.idea
*.swp
*.swo

# Testing
coverage
.nyc_output

# Logs
logs
*.log

# OS files
.DS_Store
Thumbs.db

# Documentation
README.md
docs/
specs/

# CI/CD
.github

# Temporary files
tmp
temp
*.tmp

# Database
*.db
*.sqlite
```

---

## Docker Compose Profiles

### Development Profile

```yaml
# docker-compose.dev.yml
version: '3.9'

services:
  frontend:
    build:
      target: builder
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

  backend:
    build:
      target: builder
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev
```

### Production Profile

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  frontend:
    build:
      target: runner
    environment:
      - NODE_ENV=production

  backend:
    build:
      target: runner
    environment:
      - NODE_ENV=production
```

---

## Usage Instructions

### Local Development

```bash
# Start all services
docker-compose up -d

# Start with development profile
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild services
docker-compose build

# Remove volumes
docker-compose down -v
```

### Production Build

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Individual Services

```bash
# Build frontend only
docker build -f docker/frontend.Dockerfile -t booklite-frontend .

# Build backend only
docker build -f docker/backend.Dockerfile -t booklite-backend .

# Run frontend
docker run -p 4321:4321 booklite-frontend

# Run backend
docker run -p 3000:3000 booklite-backend
```

---

## Environment Variables

### Required for Docker Compose

Create a `.env` file in the root directory:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (if using local PostgreSQL)
DATABASE_URL=postgresql://booklite:booklite_dev_password@postgres:5432/booklite_dev

# JWT
JWT_SECRET=your-jwt-secret

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_SECRET_ACCESS_KEY=your-secret-key

# Email
POSTMARK_API_KEY=your-postmark-key
```

---

## Health Checks

All services include health checks:

- **Frontend**: HTTP GET to `/health`
- **Backend**: HTTP GET to `/health`
- **PostgreSQL**: `pg_isready` command
- **Redis**: `redis-cli ping` command

---

## Security Considerations

1. **Non-root user**: Backend runs as non-root user (nodejs:1001)
2. **Minimal base images**: Using Alpine Linux for smaller attack surface
3. **Multi-stage builds**: Separate build and runtime stages
4. **Health checks**: Automatic container restart on failure
5. **Network isolation**: Services communicate through internal network
6. **Volume permissions**: Proper ownership and permissions on volumes

---

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 4321, 5432 are available
2. **Permission errors**: Check volume permissions
3. **Build failures**: Clear Docker cache: `docker system prune -a`
4. **Network issues**: Recreate network: `docker network prune`

### Debug Commands

```bash
# View container logs
docker-compose logs -f [service-name]

# Execute command in container
docker-compose exec [service-name] sh

# Inspect container
docker inspect [container-name]

# View container stats
docker stats
```

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-23  
**Status**: Specification - Ready for Implementation