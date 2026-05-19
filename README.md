# Doceum

**Web platform for interactive documents with cryptographic verification**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?logo=springboot&logoColor=white)](https://spring.io)
[![Java](https://img.shields.io/badge/Java-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![WebAssembly](https://img.shields.io/badge/Wasm-654FF0?logo=webassembly&logoColor=white)](https://webassembly.org/)
[![Rust](https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white)](https://www.rust-lang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![Docker](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

[Readme на русском](./docs/README.RU.md)

---

## About the Project

**Doceum** (from Latin *doceo* – I teach, I instruct) is a platform for creating, publishing and distributing **interactive documents** as standalone digital artifacts.

Unlike traditional text editors or knowledge bases, Doceum treats a document as a **controlled form of knowledge transfer** – with tabs, steppers, accordions, quizzes, and other interactive elements. At the same time, documents remain **self‑contained**, **stateless** and **cryptographically verifiable**.

The project solves a long‑standing problem: existing solutions force a choice between interactivity (lock‑in to a platform) and portability (loss of rich UX). Doceum delivers both.

### Key Features

- **Interactive document format `.doceo`** – ZIP archive with JSON tree of blocks (headings, paragraphs, tabs, steppers, quizzes, code blocks, images, etc.)
- **Rich text support** – bold, italic, underline, strikethrough, links, inline code, spoilers, copy‑snippets
- **Full document lifecycle** – draft - publish - unpublish - archive
- **Cryptographic verification** – HMAC‑SHA256 signature ensures integrity and authorship
- **Public catalog (Library)** – search by title or author with pagination
- **Favorites** – personal library of saved publications
- **Visual editor** – block palette, property panel, real‑time editing
- **Viewer** – renders any valid `.doceo` document with full interactivity
- **WebAssembly parser** – high‑performance document parsing written in Rust
- **Self‑contained documents** – work offline without external dependencies

---

## Tech Stack

| Layer | Technology                                                                |
|-------|---------------------------------------------------------------------------|
| **Backend** | Spring Boot 3, Java 21, Spring Security, JWT, JPA (Hibernate)             |
| **Frontend** | React 19, TypeScript, MobX, React Router, TipTap, CSS Modules             |
| **Parser** | Rust + WebAssembly (ZIP handling, JSON validation, signature verification) |
| **Database** | PostgreSQL (main), Redis (tokens)                                         |
| **File Storage** | Configurable file system path                                             |
| **Containerization** | Docker, Docker Compose                                                    |
| **Reverse Proxy** | Nginx (serves frontend + proxies API)                                     |
| **CI/CD** | GitHub Actions (test - build - deploy - telegram notify)                  |
| **Deployment** | Cloud.ru VM, [doceum.ru](https://doceum.ru) domain                        |

---

## Build & Run

### Prerequisites

- Docker & Docker Compose (for containerized setup)
- or local JDK 21 + Node.js 20 + Rust (for development)

### 1. Using Docker (recommended)

```bash
git clone https://github.com/Honsage/Doceum.git
cd Doceum

cp .env.example .env
# edit .env with your secrets

docker-compose --env-file .env up -d --build
```

After startup:

- Frontend: http://localhost
- Backend API: http://localhost:8080/api

### 2. Local development

#### Backend

```bash
cd backend

# PostgreSQL and Redis via Docker
docker run --name doceum-db -e POSTGRES_DB=doceum -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16-alpine
docker run --name doceum-redis -p 6379:6379 -d redis:7-alpine

# Run Spring Boot
./mvnw spring-boot:run
```

#### Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend will be available at http://localhost:3000, API proxied to backend.

## Project Structure

```
Doceum/
├── .env.example
├── docker-compose.yml
├── LICENSE
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/java/ru/doceum/
│       │   ├── common/ports/        # inter‑module interfaces
│       │   └── modules/
│       │       ├── auth/
│       │       ├── documents/
│       │       ├── hub/
│       │       └── profile/
│       └── test/
├── frontend/
│   ├── Dockerfile
│   ├── nginx/nginx.conf
│   ├── package.json
│   ├── src/
│   │   ├── components/              # UI blocks, .doceo renderers
│   │   ├── pages/                   # Viewer, Editor, Hub, Profile, Auth
│   │   ├── stores/                  # MobX stores
│   │   ├── services/                # API clients, parser, storage
│   │   └── types/                   # TypeScript interfaces
│   └── tests/
├── wasm/
│   ├── Cargo.toml
│   └── src/                         # WASM parser in Rust           
└── docs/
    └── doceo-format/
        └── en.SPECIFICATION.md      # formal .doceo specification
```

---

## Architecture

The backend is built as a **modular monolith** with Clean Architecture inside each module:

```
modules/
├── auth/          # authentication, JWT, refresh tokens (Redis)
├── documents/     # drafts, publications, signing, file storage
├── hub/           # public catalog, search
└── profile/       # favorites, user documents
```

Each module follows the same layered structure:

- **api** – REST controllers
- **application** – use cases + DTOs
- **domain** – models, repositories (pure interfaces)
- **infrastructure** – JPA entities, Redis, file storage, security

The frontend is a single‑page application with:

- **Store** – MobX (AuthStore, EditorStore, DocumentStore, UiStore)
- **Components** – reusable UI blocks + `.doceo` block renderers
- **Pages** – Viewer, Editor, Hub, Profile, Auth
- **Service layer** – API client, parser facade, localStorage

The **WASM parser** is written in Rust and compiled to WebAssembly. It handles ZIP extraction, JSON validation, and block tree construction, offloading heavy operations from the main thread.

### Container Diagram

<img alt="container diagram" src="./docs/images/c4-containers.png" width="600">

### ER Diagram

<img alt="entity-relationship diagram" src="./docs/images/erd.png" width="600">

---

## API Overview

| Module | Method | Endpoint | Description                |
|--------|--------|----------|----------------------------|
| **Auth** | POST | `/api/auth/register` | User registration          |
| | POST | `/api/auth/login` | Login with JWT tokens      |
| | POST | `/api/auth/refresh` | Refresh access token       |
| | POST | `/api/auth/logout` | Revoke refresh token       |
| **Documents** | POST | `/api/documents` | Create draft               |
| | PUT | `/api/documents/{id}/draft` | Upload `.doceo` file       |
| | GET | `/api/documents/{id}/draft` | Download draft             |
| | DELETE | `/api/documents/{id}/draft` | Delete document            |
| | POST | `/api/documents/{id}/publish` | Publish (sign)             |
| | DELETE | `/api/documents/{id}/publish` | Unpublish                  |
| | GET | `/api/documents/{id}/view` | View published file        |
| | GET | `/api/documents/{id}/metadata` | Get document metadata      |
| | POST | `/api/documents/verify` | Verify signature           |
| **Hub** | GET | `/api/hub/recent` | Latest publications        |
| | GET | `/api/hub/documents` | Search by title/author     |
| | GET | `/api/hub/documents/{id}` | Document card              |
| **Profile** | GET | `/api/profile/favorites` | Favorites list             |
| | POST/DELETE | `/api/profile/favorites/{id}` | Add/remove favorite        |
| | GET | `/api/profile/documents/drafts` | My drafts (AUTHOR)         |
| | GET | `/api/profile/documents/published` | My published docs (AUTHOR) |

**Authentication**: All endpoints except `/api/auth/*`, `/api/documents/*/view` and `/api/documents/verify` require a valid JWT access token in the `Authorization: Bearer <token>` header.

**Roles**:

- **READER** – view published documents, search catalog, manage favorites
- **AUTHOR** – create, edit, publish and delete own documents
- **ADMIN** – full access, user and publication management

---

## UI Design

The UI design was created in **Figma** with a focus on readability and minimal cognitive load. The color palette "Soft Clarity" uses warm neutrals with a soft mint accent.

**Design principles:**

- **Calm and readable** – soft neutral tones reduce eye strain during long reading sessions
- **Functional clarity** – the accent color combines beige and green qualities, suitable for educational content
- **Brand identity** – custom logo (stylized letter "D" with scroll motifs)

**Color palette:**

| Role | Light theme | Dark theme |
|------|-------------|------------|
| Primary background | `#FAF9F6` | `#1a1a1a` |
| Secondary background | `#F0EDE8` | `#2a2a2a` |
| Primary text | `#2C2A27` | `#e0e0e0` |
| Accent | `#5E9A8C` | `#7EB09E` |
| Callout info | `#ECF2F6` / `#A3B8C9` | `#1e2a3a` / `#4a6a8a` |
| Callout tip | `#E6F0ED` / `#5E9A8C` | `#1a2a22` / `#4a8a6a` |
| Callout warning | `#FAF4E8` / `#E8B66C` | `#2a241a` / `#b89a4a` |
| Callout danger | `#FAECEB` / `#FA8F89` | `#2a1a1a` / `#c06a6a` |

**Typography:**

- **Primary font:** Lora (serif) – warm, bookish, optimized for Cyrillic
- **Monospace:** JetBrains Mono – code blocks and inline code

**Figma design:** [https://www.figma.com/design/syDWeHawJRQ0vODRcVIC62/Doceum](https://www.figma.com/design/syDWeHawJRQ0vODRcVIC62/Doceum?node-id=0-1&p=f&t=Jv7lH1h0MbIGVVvx-0)

---

## Testing

### Backend

```bash
cd backend
mvn test
```

### Frontend

```bash
cd frontend
npm run test           # all tests
npm run test:unit      # unit only
npm run test:fuzz      # property‑based fuzzing
```

### WASM Parser

```bash
cd wasm
cargo test
```

---

## Deployment

### Environment variables

Create `.env` file:

```env
# Database
DB_NAME=doceum
DB_USER=postgres
DB_PASSWORD=your_strong_password
DB_HOST=postgres
DB_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_at_least_32_chars

# CORS
CORS_ALLOWED_ORIGINS=https://doceum.ru,https://www.doceum.ru

# Signing
DOCEO_SIGNING_SECRET=your_signing_secret

# Storage
STORAGE_ROOT=/storage

# Frontend API URL
VITE_API_URL=/api
```

### Production

```bash
docker-compose --env-file .env up -d --build
```

The platform is available at **https://doceum.ru**

### CI/CD (GitHub Actions)

The pipeline runs on every push to `master` and consists of the following jobs:

1. **test-backend** – runs JUnit tests via Maven
2. **test-frontend** – runs Vitest unit tests
3. **build** – packages backend JAR and builds frontend dist
4. **deploy** – pulls codebase, deploys to production server
5. **telegram_notify** – sends deployment status notification to Telegram

---

## Documentation

- [`.doceo` **format specification**](./docs/doceo-format/en.SPECIFICATION.md)
- The specification covers ZIP structure, manifest schema, node types, validation rules (16 invariants), and versioning policy

---

## License

This project is licensed under the **MIT License** – you are free to use, modify, and distribute it.

Contributions are welcome! Feel free to open issues and pull requests.

---

## Links

- **Demo**: [https://doceum.ru](https://doceum.ru)
- **Format specification**: [https://honsage.github.io/Doceum/](https://honsage.github.io/Doceum/)
- **Figma Design**: [https://www.figma.com/design/syDWeHawJRQ0vODRcVIC62/Doceum](https://www.figma.com/design/syDWeHawJRQ0vODRcVIC62/Doceum?node-id=0-1&p=f&t=Jv7lH1h0MbIGVVvx-0)