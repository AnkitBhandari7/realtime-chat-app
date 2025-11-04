# 💬 Realtime Chat Application

<div align="center">

![Realtime Chat](https://img.shields.io/badge/Realtime-Chat-blue?style=for-the-badge&logo=socket.io)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

🚀 A **full-stack real-time chat application** built with React, Node.js, TypeScript, and Socket.IO.  
Now enhanced with **Redis caching** for blazing-fast session management and scalability.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Setup](#-getting-started) • [Structure](#-project-structure) • [License](#-license)

</div>

---

## ✨ Features

### 💬 Core Functionality
- **Realtime Messaging** — Instant chat powered by Socket.IO  
- **Public & Private Chats** — Global rooms and one-on-one conversations  
- **Persistent Storage** — Messages stored in MySQL using Sequelize ORM  
- **User Authentication** — JWT-secured login & registration  
- **Online/Offline Presence** — Track connected users in real-time  
- **Redis Session Store** — Fast, scalable session management  
- **Message History** — Retrieve previous messages instantly  

### 🧠 User Experience
- **Modern Dark Mode UI** — Inspired by Discord  
- **Responsive Design** — Works on desktop and mobile  
- **Live Typing Indicator** *(optional enhancement)*  
- **Auto-scroll** — Always see the latest messages  
- **User Search** — Quickly find users to chat with  
- **Timestamped Messages** — Every message shows when it was sent  

### 🔒 Security
- **Password Hashing** — bcrypt for secure credential storage  
- **JWT Authentication** — Stateless auth for APIs  
- **Protected Routes** — Middleware-based access control  
- **Input Validation** — Server-side sanitization  
- **Helmet + CORS** — Hardened Express security configuration  

---

## 🛠 Tech Stack

### 🖥️ Frontend
- **React 18 + TypeScript** — Component-based, strongly-typed UI  
- **Vite** — Lightning-fast dev environment  
- **Socket.IO Client** — Real-time event handling  
- **Axios** — REST API communication  
- **Tailwind CSS** — Modern utility-first styling  
- **Heroicons** — Clean and consistent UI icons  

### ⚙️ Backend
- **Node.js + Express + TypeScript** — Scalable and type-safe backend  
- **Socket.IO** — WebSocket-based real-time communication  
- **Sequelize ORM + MySQL** — Reliable relational data management  
- **Redis + connect-redis** — High-performance session and cache store  
- **JWT + bcryptjs** — Secure authentication system  
- **Helmet + CORS** — Security best practices  

---

## 🚀 Getting Started

### ✅ Prerequisites
- **Node.js** (v18+)
- **MySQL** (v8+)
- **Redis** (v6+)

### 📦 Installation

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/realtime-chat-app.git
cd realtime-chat-app


2️⃣ Set Up MySQL Database

CREATE DATABASE realtime_chat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

3️⃣ Start Redis Server

Make sure Redis is running locally:

redis-server

4️⃣ Backend Setup

cd server
npm install
cp .env.example .env

Edit .env:
# Server
PORT=5001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=realtime_chat

# JWT Secret
JWT_SECRET=your-super-secret-key

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# CORS
CORS_ORIGIN=http://localhost:5173

Run backend:

npm run dev

5️⃣ Frontend Setup

cd ../client
npm install
cp .env.example .env

Edit .env:

VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001

Run frontend:

npm run dev

🖥️ Access the app:
Frontend → http://localhost:5173

Backend → http://localhost:5001

Health Check → http://localhost:5001/health

🧱 Project Structure

realtime-chat-app/
├── client/                     # React + TypeScript frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/              # Page views (Login, Chat, etc.)
│   │   ├── api.ts              # API service setup
│   │   └── main.tsx            # App entry point
│   └── package.json
│
├── server/                     # Node.js + TypeScript backend
│   ├── src/
│   │   ├── config/             # DB + Redis configuration
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth and error middleware
│   │   ├── models/             # Sequelize models
│   │   ├── routes/             # Express routes
│   │   ├── socket.ts           # Socket.IO setup
│   │   ├── app.ts              # Express + Redis + sessions
│   │   └── index.ts            # Server entry point
│   ├── package.json
│   └── .env
│
└── README.md


📸 Screenshots

|                      Login                     |                      Public Chat                     |                      Private Chat                     |
| :--------------------------------------------: | :--------------------------------------------------: | :---------------------------------------------------: |
| <img src="screenshots/login.png" width="300"/> | <img src="screenshots/public_chat.png" width="300"/> | <img src="screenshots/private-chat.png" width="300"/> |


📝 License

This project is licensed under the MIT License — see the LICENSE file for details.

👨‍💻 Author

Ankit Bhandari
📧 your.email@example.com

🌐 GitHub: @ankitbhandari

💼 LinkedIn: Ankit Bhandari

🙏 Acknowledgments

. Socket.IO — Real-time communication magic

. Sequelize — ORM simplicity

. Redis — Blazing-fast caching and session store

. Tailwind CSS — Effortless styling

. Open Source Community — For endless inspiration ❤️

⚡ “Fast. Secure. Realtime. Built with passion.”
— Ankit Bhandari
