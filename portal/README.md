# Mesa Portal

Personal project dashboard. Shows projects, links, and status.

## Features

- ✅ Next.js + TypeScript
- ✅ JWT auth (stub)
- ✅ Projects API (GET/POST/PATCH)
- ✅ Tailwind UI
- 🚧 PostgreSQL (TODO)
- 🚧 Discord updates (TODO)

## Dev

```bash
npm install
npm run dev
```

Visit http://localhost:3000
Password: `dev-password`

## API

**GET /api/projects** — List projects
**POST /api/projects** — Create (requires auth token)
**PATCH /api/projects?id=X** — Update (requires auth token)

Token: POST to `/api/auth` with password.
