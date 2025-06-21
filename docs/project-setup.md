# PS-Olympics Project Setup Guide

## Prerequisites

- Node.js (v18.x or later)
- PostgreSQL (v14.x or later)
- Redis (v6.x or later)
- Git

## Repository Structure

```
ps-olympics-app/
├── frontend/               # React frontend application
├── backend/               # Node.js API server
├── docs/                  # Project documentation
│   ├── database-schema.md
│   ├── api-design.md
│   └── frontend-architecture.md
└── docker/                # Docker configuration
```

## Initial Setup

### 1. Clone Repository

```bash
git clone git@github.com:your-org/ps-olympics-app.git
cd ps-olympics-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Configure environment variables
DATABASE_URL="postgresql://user:password@localhost:5432/ps_olympics"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
PORT=3000

# Run database migrations
npm run migrate:up

# Seed initial data
npm run seed

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Configure environment variables
REACT_APP_API_BASE_URL="http://localhost:3001/api/v1"

# Start development server
npm run dev
```

## Development Workflow

### 1. Branch Strategy

```
main           # Production branch
├── staging    # Staging environment
└── develop    # Development branch
    ├── feature/xxx    # Feature branches
    ├── bugfix/xxx     # Bug fix branches
    └── hotfix/xxx     # Hot fix branches
```

### 2. Commit Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style updates
refactor: Code refactoring
test: Test updates
chore: Build process or auxiliary tool changes
```

### 3. Code Quality Tools

```bash
# Frontend
cd frontend

# Lint code
npm run lint

# Run tests
npm run test

# Check types
npm run type-check

# Backend
cd backend

# Lint code
npm run lint

# Run tests
npm run test

# Check types
npm run type-check
```

## Docker Setup

### 1. Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 2. Production Build

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Configuration

### 1. Development Environment

```env
# Backend (.env)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/ps_olympics
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000

# Frontend (.env)
REACT_APP_API_BASE_URL=http://localhost:3001/api/v1
```

### 2. Production Environment

```env
# Backend (.env.production)
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@db:5432/ps_olympics
REDIS_URL=redis://redis:6379
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://ps-olympics.com

# Frontend (.env.production)
VITE_API_URL=https://api.ps-olympics.com/v1
VITE_WS_URL=wss://api.ps-olympics.com
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

## Database Management

### 1. Migrations

```bash
# Create new migration
npm run migrate:create name_of_migration

# Run pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Reset database
npm run migrate:reset
```

### 2. Seeding

```bash
# Run all seeds
npm run seed

# Run specific seed
npm run seed:specific seed_name
```

## Deployment

### 1. CI/CD Pipeline (GitHub Actions)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Tests
        run: |
          npm ci
          npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Production
        if: github.ref == 'refs/heads/main'
        run: |
          # Deploy to production server
```

### 2. Deployment Checklist

```
□ Run all tests
□ Build production assets
□ Run database migrations
□ Update environment variables
□ Deploy backend services
□ Deploy frontend assets
□ Verify WebSocket connections
□ Check monitoring systems
□ Test critical user flows
```

## Monitoring and Logging

### 1. Tools Setup

```bash
# Install monitoring tools
npm install --save-dev @sentry/react @sentry/tracing
npm install --save-dev winston

# Configure Sentry
SENTRY_DSN=https://your-sentry-dsn
SENTRY_ENVIRONMENT=production
```

### 2. Health Checks

```bash
# Backend health check endpoint
GET /api/v1/health

Response:
{
  "status": "healthy",
  "timestamp": "2025-06-07T10:00:00Z",
  "services": {
    "database": "up",
    "redis": "up",
    "websocket": "up"
  }
}
```

## Performance Optimization

### 1. Frontend Optimization

```bash
# Analyze bundle size
npm run analyze

# Generate performance report
npm run lighthouse

# Configure CDN
VITE_CDN_URL=https://cdn.ps-olympics.com
```

### 2. Backend Optimization

```bash
# Enable compression
npm install compression
npm install helmet

# Configure caching
CACHE_TTL=300
REDIS_CACHE_PREFIX=ps_olympics
```

## Security Measures

### 1. Security Headers

```javascript
// Configure security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);
```

### 2. Rate Limiting

```javascript
// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

## Documentation

### 1. API Documentation

```bash
# Generate API documentation
npm run docs:generate

# Serve documentation
npm run docs:serve
```

### 2. Component Documentation

```bash
# Run Storybook
npm run storybook

# Build static storybook
npm run build-storybook
```
