**Inventory and Order Management System (IMS)**

A professional, containerized full-stack Inventory and Order Management application. The system features a responsive React administrative user interface dashboard, 
a robust FastAPI backend service engine, and a managed relational PostgreSQL database layer.

The entire development lifecycle utilizes Podman container orchestration for local isolation and parity, and is fully deployed to production using separate
cloud infrastructures via a Continuous Integration / Continuous Deployment (CI/CD) pipeline.

🌐** Live Production Access**

The application is fully live, publicly accessible, and distributed across globally optimized web networks:

Production Frontend (UI Dashboard): https://inventory-system-one-lac.vercel.app

Production Backend Gateway (API Docs): https://inventory-backend-api-jpoo.onrender.com/docs

Public Container Image Registry: docker.io/namrathabp/inventory-backend:latest

🏗️ **Cloud Infrastructure Architecture**

To maximize data persistence, speed, and reliability, the system abandons monolithic hosting and abstracts the stack into dedicated cloud infrastructure zones:

[ React Client UI ] --------(HTTPS + CORS)--------> [ FastAPI Gateway ]
  (Hosted on Vercel)                                  (Hosted on Render)
                                                             |
                                                       (SQLAlchemy ORM)
                                                             v
                                                    [ Managed PostgreSQL ]
                                                      (Hosted on Render)
                                                      
1. UI Core Layer (Vercel): Hosts the static React/Vite compilation. Environment variables route dynamic state updates to the remote API gateway securely.

2. API Routing Node (Render Web Services): An isolated Linux container running an optimized multi-stage Python/Uvicorn distribution instance.

3. Persistence Layer (Render PostgreSQL): A managed, independent relational instance decoupled from the ephemeral container lifecycles to guarantee zero-loss
   transactional history.

🛠️ **Local Environment & Containerization Setup**

The project uses decoupled multi-stage builds to optimize image layer distribution sizes and strip development environments from production runtimes.

Frontend Architecture (frontend/Dockerfile)

Uses an alpine-based node staging layer to bundle React assets into compressed, flat files, which are immediately loaded onto a root privilege-free production 
Nginx web proxy engine listening internally on port 8080.

Backend Architecture (backend/Dockerfile)

Exposes Uvicorn services directly while mapping dynamic context pointers onto decoupled environmental drivers (DATABASE_URL).

**To launch the full system locally using container orchestration, run this command from the root directory:**

podman-compose up --build -d

Local Frontend: http://localhost:3000

Local Backend: http://localhost:8000

🧪 **Automated End-to-End Test Suite**

Automated transaction verification is built natively via the pytest engine. The suite covers isolated CRUD workflows, relational order mapping transactions, 
and schema structural checks. Tests run asynchronously using an inline environment pointer execution sequence inside the running backend service block.
Run the following command in your terminal to force containerized execution checks:

podman exec -it fastapi_backend_container env PYTHONPATH=. pytest app/test_main.py -v

