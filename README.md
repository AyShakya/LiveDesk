# LiveDesk

LiveDesk is a full-stack real-time collaborative editing platform built as a resume-ready project. It combines workspace management, document editing, live presence, and WebSocket-based synchronization into one containerized application.

This project was designed to demonstrate practical product engineering across the stack: authenticated user flows, shared workspaces, document CRUD, real-time collaboration, Redis-backed broadcasting, PostgreSQL persistence, and Docker-based deployment.

## Project Summary

LiveDesk lets users create or join workspaces, manage documents inside each workspace, and edit content with live updates. The frontend is a React + TypeScript single-page app, the backend is an Express API with WebSocket support, and the infrastructure layer uses PostgreSQL, Redis, and Nginx behind Docker Compose.

## What I Built

This repository includes the following work:

- Authentication with register, login, and protected routes.
- Workspace creation, joining by invite code, member listing, updating, and deletion.
- Document creation, listing, renaming, editing, and deletion inside a workspace.
- Real-time editing over WebSockets with reconnect logic and message queuing.
- Presence tracking so users can see who is currently active in a workspace.
- Redis Pub/Sub integration for broadcasting document and presence events.
- PostgreSQL-backed persistence for users, workspaces, documents, and membership data.
- Nginx reverse proxy and Docker Compose setup for a unified local deployment.
- Responsive UI states such as skeleton loaders, protected pages, and workspace navigation.

## Core Features

### Real-time collaboration

- WebSocket connections are opened per workspace and document.
- Document changes are diffed and synchronized across connected clients.
- The client keeps a retry queue and reconnects automatically if the socket drops.

### Presence awareness

- Online users are tracked per workspace.
- Presence updates are published through Redis so connected clients stay in sync.
- The editor shows the current active users for the open workspace.

### Workspace management

- Users can create a workspace from the dashboard.
- Users can join a workspace with an invite code.
- Workspace members can be viewed from the workspace header.
- Workspace metadata can be updated or removed based on role permissions.

### Document management

- Documents are listed in a workspace sidebar.
- New documents can be created from the workspace view.
- Existing documents can be renamed or deleted.
- Editors load document content from the API before connecting to live sync.

### Production-style backend structure

- Express API routes are split into auth, workspace, document, and presence modules.
- Redis handles rate limiting, presence pub/sub, and cross-instance event delivery.
- PostgreSQL stores durable application data.
- Health checks verify the database and cache before the server starts listening.

## Architecture

```text
React frontend
    |
    v
Nginx reverse proxy
    |
    +--> Express REST API
    |
    +--> WebSocket server
            |
            +--> Redis Pub/Sub
            +--> PostgreSQL
```

The app is split into three main layers:

- Frontend: user-facing editor, workspace dashboard, auth screens, and collaboration UI.
- Backend: REST endpoints, WebSocket handling, presence tracking, and document persistence.
- Infrastructure: Nginx, PostgreSQL, Redis, and Docker Compose orchestration.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Tiptap collaboration extensions

### Backend

- Node.js
- Express 5
- ws for WebSockets
- ioredis
- pg
- jsonwebtoken
- bcrypt

### Infrastructure

- Docker
- Docker Compose
- Nginx
- PostgreSQL 15
- Redis 7

## How It Works

1. A user signs up or logs in and receives a token.
2. The frontend stores the token and attaches it to API requests.
3. The user creates or joins a workspace.
4. The workspace view loads documents and member data from the backend.
5. Opening a document connects the client to the WebSocket server with the token, workspace ID, and document ID.
6. Edits are sent as structured update messages and rebroadcast to other clients.
7. Presence events are written through Redis and pushed back to all subscribed clients.

## Backend API Surface

The backend exposes the following route groups:

- `/auth` for register, login, and current-user lookup.
- `/workspaces` for workspace creation, listing, joining, updating, deletion, and member access.
- `/documents` for document creation, listing, fetching, updating, and deletion.
- `/presence` for online/offline tracking and current presence lookups.
- `/health` for dependency checks.

## WebSocket Behavior

The editor connects to a WebSocket endpoint that expects:

- `token`
- `workspaceId`
- `docId`

The socket layer includes:

- authentication and membership checks before joining a document room,
- per-document broadcasting inside a workspace,
- heartbeats with ping/pong handling,
- automatic reconnect with exponential backoff,
- queued outbound messages while the connection is temporarily unavailable.

## Repository Structure

```text
LiveDesk/
├── frontend/        React + TypeScript client
├── backend/         Express API, WebSocket server, workers
├── nginx/           Reverse proxy configuration
├── docker-compose.yml
└── README.md
```

## Local Setup

### Prerequisites

- Docker
- Docker Compose

### Run with Docker

```bash
docker compose up -d --build
```

Open the app at:

```text
http://localhost
```

## Environment Variables

### Backend

The backend reads its settings from environment variables such as:

- `PORT`
- `CLIENT_URL`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `REDIS_HOST`
- `REDIS_PORT`

### Frontend

The frontend expects:

- `VITE_API_URL`
- `VITE_WS_URL`

## Notes On Implementation

- Rate limiting is applied to authentication and workspace-join flows.
- Protected routes keep unauthenticated users away from workspace pages.
- Skeleton loaders are used while workspace and editor data load.
- The editor preserves a local draft and rebases changes when remote updates arrive.
- Nginx is used to avoid CORS issues and keep browser traffic on one origin.

## Future Improvements

- CRDT or operational transformation for stronger conflict resolution.
- Document version history and restore points.
- Richer member roles and granular permissions.
- More advanced editor tooling and formatting controls.
- Multi-instance scaling beyond a single local deployment.

## Author

Ayush Shakya

- GitHub: https://github.com/AyShakya
- LinkedIn: https://linkedin.com/in/ayush-shakya24
