# Trainalyze Backend

FastAPI + SQLAlchemy backend for the Trainalyze 运动数据分析平台. Implements the
README §7 data shapes and §9–10 endpoints with SQLite persistence. Data is
seeded from `app/seed_data.json` (generated from the frontend's canonical mock
data, so both sides serve identical shapes).

## Setup

```bash
python -m venv .venv
.venv/Scripts/python -m pip install -e ".[dev]"     # Windows
# source .venv/bin/activate && pip install -e ".[dev]"  # macOS/Linux
```

## Run

```bash
.venv/Scripts/uvicorn app.main:app --reload          # http://127.0.0.1:8000
```

Interactive docs at `/docs`. The Vite dev server proxies `/api` here (see
`frontend/vite.config.ts`).

## Test & lint

```bash
.venv/Scripts/python -m pytest      # 13 tests
.venv/Scripts/python -m ruff check .
```

## Endpoints (prefix `/api`)

| Group | Endpoints |
|---|---|
| System | `GET /health` · `GET /accounts` · `POST /auth/login` · `GET /bootstrap` |
| Profile | `GET/PUT /profile` · `GET/POST /weight` |
| Analytics | `GET /dashboard` · `GET /metrics` · `GET /metrics/{id}` · `GET /activities` · `GET /activities/{id}` · `GET /training` |
| Catalog | `GET /library` · `GET /templates/{id}` · `GET /plans/{id}` · `GET /connectors` · `GET /connectors/{id}` · `PUT /connectors/{id}/config` · `GET /schema` |
| AI | `POST /ai/chat` · `POST /ai/plan` · `GET /ai/insights` · `POST /ai/session-review` · `POST /ai/metric-insight` |

The database URL is configurable via `TRAINALYZE_DATABASE_URL` (default
`sqlite:///./trainalyze.db`; tests use a shared in-memory database).

## Notes

- AI endpoints return canned responses today; wire them to the user's
  configured provider/key (README §10) for production.
- The seed JSON is regenerated from `frontend/src/lib/mockData.ts` via esbuild
  if the canonical data changes.
