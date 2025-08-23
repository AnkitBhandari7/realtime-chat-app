Real-Time Chat App

A full-stack real-time chat application built with Node.js, Express, MongoDB, Socket.IO, React, TypeScript, and Tailwind CSS.

Features
Backend (Node.js + Express + MongoDB + Socket.IO)

🔑 CRUD Operations for users with Authentication (JWT) & Authorization.

📡 Real-time communication with Socket.IO (messages, user join/leave events).

💾 Chat history stored in MongoDB.

📊 Shows total chat counts and total active users.

Frontend (React + TypeScript + Tailwind CSS)

🎧 Listens to events (message, user:join, stats:update) and updates the UI live.

💬 Input box for sending messages.

📜 Scrollable list of messages.

Tech Stack

Backend:

Node.js

Express

MongoDB (Mongoose)

Socket.IO

JWT Authentication

TypeScript

Frontend:

React

TypeScript

Tailwind CSS

Socket.IO Client

Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/your-username/realtime-chat-app.git
cd realtime-chat-app

2️⃣ Backend Setup
cd backend
npm install


Create .env file based on .env.example:

PORT=5001
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000


Run backend:

npm run dev

3️⃣ Frontend Setup
cd frontend
npm install


Create .env file based on .env.example:

VITE_API_URL=http://localhost:5001


Run frontend:

npm run dev

Usage

Open two browser tabs and log in with different accounts.

Send messages — they will appear in real-time on both clients.

User join/leave events and chat statistics are displayed live.

Folder Structure
realtime-chat-app/
│── backend/
│   ├── src/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── socket/
│   ├── .env.example
│── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── .env.example

.env.example

Backend (backend/.env.example)

PORT=5001
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000


Frontend (frontend/.env.example)

VITE_API_URL=http://localhost:5001

Author

Developed by [Your Name]