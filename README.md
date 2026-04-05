# Finance Dashboard Backend

A REST API for a finance dashboard with role-based access control and a minimal UI served from `public/`.

## Tech stack

- Node.js  
- Express  
- MongoDB + Mongoose *(assignment wording — this checkout uses **SQLite** + `better-sqlite3`, default file `data/finance.db`)*  
- JWT authentication  
- bcryptjs  

## Setup

1. `git clone <your-repo-url>`
2. `cd` into the project folder
3. `npm install`
4. Create a `.env` file in the project root:

   ```env
   PORT=3000
   JWT_SECRET=your_secret_key
   ```

   Optional: `DATABASE_PATH=/absolute/path/to/finance.db` (defaults to `data/finance.db` next to the app).

5. `npm run db:init` — creates tables and seeds the default admin
6. `npm start`
7. Open **http://localhost:3000**

## Default admin

| | |
|--|--|
| **Email** | admin@finance.com |
| **Password** | admin123 |

## API endpoints

Use `Authorization: Bearer <token>` on every route except the two auth routes.

| Method | Route | Role |
|--------|-------|------|
| POST | `/api/auth/register` | Public (`viewer` or `analyst` in body) |
| POST | `/api/auth/login` | Public |
| GET | `/api/records` | viewer, analyst, admin |
| GET | `/api/records/:id` | viewer, analyst, admin |
| POST | `/api/records` | admin |
| PUT | `/api/records/:id` | admin |
| DELETE | `/api/records/:id` | admin |
| GET | `/api/dashboard/summary` | analyst, admin |
| GET | `/api/dashboard/categories` | analyst, admin |
| GET | `/api/dashboard/recent` | analyst, admin |
| GET | `/api/dashboard/trends` | analyst, admin |
| GET | `/api/users` | admin |
| GET | `/api/users/:id` | admin |
| PUT | `/api/users/:id` | admin |
| DELETE | `/api/users/:id` | admin |

## Role permissions

| Role | Access |
|------|--------|
| Viewer | View records only |
| Analyst | View records + dashboard |
| Admin | Full access |

## Error format

```json
{
  "error": true,
  "message": "...",
  "status": 400
}
```

## Assumptions

- JWTs expire in **24 hours**.  
- Deletes are **hard** deletes (no soft delete).  
- Amounts are stored as **decimals**.  
- Dates use **YYYY-MM-DD**.  
