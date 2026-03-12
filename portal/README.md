# Mesa Portal

Personal project dashboard. Shows projects, links, and status.

## Features

- ✅ Next.js + TypeScript + Tailwind
- ✅ JWT authentication
- ✅ PostgreSQL database
- ✅ Projects API (GET/POST/PATCH/DELETE)
- ✅ Dark theme UI
- 🚧 Discord integration (TODO)
- 🚧 Project scaffolding skill (TODO)

## Setup

### Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
JWT_SECRET=your-secret-key
PORTAL_PASSWORD=your-password
DATABASE_URL=postgresql://user:password@localhost:5432/mesa_portal
NODE_ENV=development
```

### Database

```bash
# Create database
createdb mesa_portal

# Tables auto-created on first API request
```

### Dev

```bash
npm install
npm run dev
```

Visit http://localhost:3000
Password: whatever you set in `PORTAL_PASSWORD`

## API

**GET /api/projects** — List all projects
**GET /api/projects?id=X** — Get one project
**POST /api/projects** — Create (requires auth)
**PATCH /api/projects?id=X** — Update (requires auth)
**DELETE /api/projects?id=X** — Delete (requires auth)

### Auth Token

```bash
# Get token
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"dev-password"}'

# Use token
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer TOKEN_HERE"
```

### Project Fields

```json
{
  "id": "project-id",
  "name": "Project Name",
  "description": "What it does",
  "status": "active|dev|planned",
  "github_url": "https://github.com/...",
  "notion_url": "https://notion.so/...",
  "cloudflare_url": "https://example.com",
  "created_at": "2025-02-23T...",
  "updated_at": "2025-02-23T..."
}
```

## Deployment

Production uses real PostgreSQL. Environment vars from secrets manager.
