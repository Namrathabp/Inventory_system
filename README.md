# Inventory & Order Management System

A production-grade, containerized full-stack application for inventory and order management — deployed live across globally distributed cloud infrastructure.

**Live Demo:** [inventory-system-one-lac.vercel.app](https://inventory-system-one-lac.vercel.app)  
**API Docs (Swagger):** [inventory-backend-api-jpoo.onrender.com/docs](https://inventory-backend-api-jpoo.onrender.com/docs)  
**Container Image:** `docker.io/namrathabp/inventory-backend:latest`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI + Uvicorn |
| Database | PostgreSQL (managed, Render) |
| ORM | SQLAlchemy |
| Frontend | React + Vite |
| Containerisation | Docker + docker-compose (Podman-compatible) |
| Testing | Pytest (async, CRUD + schema coverage) |
| Deployment | Vercel (frontend) · Render (backend + DB) |
| API Docs | Swagger / OpenAPI (auto-generated) |

---

## Architecture

```
[ React/Vite UI ]  ──(HTTPS + CORS)──▶  [ FastAPI Gateway ]  ──(SQLAlchemy ORM)──▶  [ PostgreSQL ]
   Vercel CDN                               Render Web Service                        Render Managed DB
```

Three independent cloud zones — decoupled for reliability, zero data loss on container restarts.

---

## Features

- Full CRUD for products, orders, and inventory records
- Real-time stock level tracking with low-stock alerts
- Order lifecycle management (pending → fulfilled → closed)
- Category-based product filtering and search
- RESTful API with full Swagger/OpenAPI documentation
- Containerised multi-stage Docker builds (frontend + backend)
- Async pytest suite covering isolated CRUD workflows, relational order mapping, and schema checks

---

## Running Locally

### Prerequisites
- Docker / Podman + docker-compose

### One command startup

```bash
git clone https://github.com/Namrathabp/Inventory_system.git
cd Inventory_system
podman-compose up --build -d
# or: docker-compose up --build -d
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

### Run Tests

```bash
podman exec -it fastapi_backend_container env PYTHONPATH=. pytest app/test_main.py -v
```

---

## API Highlights

| Method | Endpoint | Description |
|---|---|---|
| GET | `/products/` | List all products with stock levels |
| POST | `/products/` | Create a new product |
| PATCH | `/products/{id}/stock` | Update stock quantity |
| GET | `/orders/` | List all orders |
| POST | `/orders/` | Create a new order |
| PATCH | `/orders/{id}/status` | Update order status |
| GET | `/docs` | Interactive Swagger UI |

---

## Deployment

**Frontend (Vercel):** Static React/Vite build served via Vercel CDN. Environment variables route API calls to the Render backend.

**Backend (Render):** Multi-stage Docker build running an optimised Uvicorn instance. DATABASE_URL injected via environment variable at runtime.

**Database (Render PostgreSQL):** Managed, independent relational instance — decoupled from container lifecycle to guarantee zero-loss transactional history.

---

## Author

**Namratha B P** — Python Backend Developer  
[LinkedIn](https://linkedin.com/in/NamrathaBP) · [GitHub](https://github.com/Namrathabp) · namrathabp123@gmail.com
