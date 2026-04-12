# 🚀 LiveDesk — Real-Time Collaborative Editing Platform

LiveDesk is a real-time collaborative document editing platform inspired by tools like Google Docs. It enables multiple users to edit documents simultaneously with live updates, presence tracking, and low-latency synchronization.

---

## ✨ Features

- ⚡ Real-time document editing using WebSockets
- 👥 Live user presence and cursor tracking
- 🔄 Instant synchronization across multiple clients
- 🧠 Redis Pub/Sub for distributed message broadcasting
- 🔐 Authentication-ready backend architecture
- 📦 Fully containerized system using Docker
- 🌐 Nginx reverse proxy for unified routing

---

## 🏗️ Architecture Overview


Client (React)
↓
Nginx (Reverse Proxy)
↓
Backend (Node.js + WebSockets)
↓
Redis (Pub/Sub) ←→ PostgreSQL (Persistent Storage)


---

## 🧠 Key Concepts Implemented

### 🔹 Real-Time Communication
- Implemented WebSocket-based bidirectional communication
- Achieved low-latency updates across multiple connected clients

### 🔹 Pub/Sub System (Redis)
- Used Redis Pub/Sub to broadcast document updates
- Enabled horizontal scalability across multiple backend instances

### 🔹 Presence System
- Tracks active users in a document session
- Supports live cursor updates and collaborative awareness

### 🔹 Containerized Architecture
- Separated services:
  - Backend
  - Database (PostgreSQL)
  - Cache / Messaging (Redis)
  - Reverse Proxy (Nginx)
- Managed using Docker Compose

---

## ⚙️ Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- WebSockets (ws / socket.io)

### Infrastructure
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- Redis (Pub/Sub)
- PostgreSQL (Database)

---

## 🚀 Getting Started

### Prerequisites

- Docker
- Docker Compose

---

### 1. Clone the Repository

```bash
git clone https://github.com/AyShakya/LiveDesk.git
cd LiveDesk
```
### 2. Run the Application
```
docker compose up -d --build
```
### 3. Access the App
http://localhost

---

🔁 How It Works (Flow)
1. User connects to WebSocket server
2. Joins a document room/session
3. Edits are sent via WebSocket events
4. Backend publishes updates via Redis
5. All subscribed clients receive updates instantly

---

📦 Project Structure
```
LiveDesk/
├── frontend/       # React + TypeScript app
├── backend/        # Node.js + WebSocket server
├── nginx/          # Reverse proxy config
├── docker-compose.yml
```

---

⚡ Challenges Solved

- ❌ Eliminated CORS issues using Nginx reverse proxy
- 🔄 Synced real-time edits across multiple clients reliably
- 🧩 Managed inter-service communication using Docker networking
- ⚙️ Ensured reproducible setup with containerized architecture

---

🚀 Future Improvements

- Operational Transformation (OT) / CRDT for conflict resolution
- Persistent document versioning
- Authentication & access control
- Horizontal scaling with multiple backend instances
- WebRTC for peer-to-peer optimizations

---

### 🧑‍💻 Author

Ayush Shakya

-GitHub: https://github.com/AyShakya
-LinkedIn: https://linkedin.com/in/ayush-shakya24
