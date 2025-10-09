# 💬 Realtime Chat Application

A modern, full-stack realtime chat application built with **React**, **Node.js**, **Socket.IO**, and **MySQL**.  
It allows users to communicate instantly in public or private chats with persistent message history stored in MySQL.

---

## 🚀 Overview

This project demonstrates a scalable and stylish chat system that includes:

- **JWT authentication**
- **MySQL persistence** with Sequelize ORM
- **Modern dark interface** built using TailwindCSS

Users can register, log in, view online members, chat publicly, and send private messages.

---

## ⚙️ Features

- ⚡ **Realtime Communication** – Socket.IO instantly updates all clients  
- 💭 **Private Messaging** – Direct messages saved with `recipientId`  
- 🌍 **Public Chatroom** – Everyone can chat in a shared room  
- 🔒 **Authentication** – Secure login/register using JWT tokens  
- 💾 **Persistence** – MySQL + Sequelize for relational data  
- 🎨 **Modern Dark UI** – TailwindCSS styling with React + Vite  
- 🧭 **Online Users Counter** – Track active users in realtime  

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React (18), Vite, TailwindCSS, Heroicons |
| **Backend** | Node.js, Express, Socket.IO |
| **Database** | MySQL (v8), Sequelize ORM |
| **Auth** | JWT, Bcrypt |
| **Other Tools** | Axios, TypeScript, DBeaver / Workbench, Postman |

---

## 🖼️ Screenshot

> Replace with your own screenshots or GIFs

**Dark Chat Interface Example**

---

## 📂 Folder Structure

realtime-chat/
├── client/ # React Frontend
│ ├── src/
│ │ ├── pages/ # Chat, Login, Register
│ │ ├── components/ # UI components
│ │ ├── api.ts # Axios instance
│ │ └── index.css # Tailwind/Global styles
│ └── package.json
│
└── server/ # Node + Express Backend
├── src/
│ ├── config/ # DB connection
│ ├── controllers/ # Express controllers
│ ├── middleware/ # JWT auth middleware
│ ├── models/ # Sequelize models (User, Message)
│ ├── routes/ # API routes
│ ├── socket.ts # Socket.IO logic
│ └── index.ts # Entry point
└── package.json

yaml
Copy code

---

## ⚙️ Prerequisites

- Node.js >= 18  
- npm or yarn  
- MySQL >= 8  
- (Optional) DBeaver / MySQL Workbench  

---

## 🧩 Environment Variables

Create a file **`.env`** inside `/server`:

```env
PORT=5001
JWT_SECRET=your_secret_key
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=realtime_chat
CORS_ORIGIN=http://localhost:5173
Create a file .env inside /client if needed:

env
Copy code
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
🛠️ Installation
1️⃣ Clone the repository
bash
Copy code
git clone https://github.com/yourusername/realtime-chat.git
cd realtime-chat
2️⃣ Install dependencies
Server:

bash
Copy code
cd server
npm install
Client:

bash
Copy code
cd ../client
npm install
▶️ Running the Application
Run the backend
bash
Copy code
cd server
npm run dev
Expected console output:

arduino
Copy code
MySQL connected successfully
✅ Models synchronized with DB
🚀 Server listening on port 5001
Run the frontend
In another terminal:

bash
Copy code
cd client
npm run dev
Then visit http://localhost:5173

🧮 Database Setup
Open MySQL or DBeaver

Create a database:

sql
Copy code
CREATE DATABASE realtime_chat
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
Sequelize will sync tables (users, messages) automatically.

🔐 Authentication Flow
Register – Create an account (username, email, password hashed with bcrypt)

Login – Returns a JWT token

Authorization – Token stored in localStorage and sent with each request/socket auth

Protected Routes – /api/users, /api/chat, /api/auth/me require a valid JWT

🗨️ Messaging Flow
Client emits one of:

chat:message → public message

chat:private → private message with recipientId

Server saves in MySQL:

Public → recipientId = NULL

Private → recipientId = target user's id

Server broadcasts:

chat:message → all clients

chat:private → sender + recipient only

Client queries:

/api/chat/messages

/api/chat/private/:userId

🎨 UI Highlights
Responsive two-column layout

Dark sleek theme with TailwindCSS

Sidebar: live user list

Header: profile + logout

Message bubbles:

💙 You

🩶 Others

🧪 Example API Routes
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Authenticate user
GET	/api/users	List users (authenticated)
GET	/api/chat/stats	Get message/user counts
GET	/api/chat/messages	Public messages
GET	/api/chat/private/:userId	Private DM history

📊 SQL Schema (simplified)
sql
Copy code
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  senderId INT UNSIGNED NOT NULL,
  recipientId INT UNSIGNED NULL,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipientId) REFERENCES users(id) ON DELETE CASCADE
);
🧘 Troubleshooting
Issue	Cause / Fix
Too many keys specified	Drop duplicate indexes or stop using { alter:true }
Private messages not loading	Ensure recipientId exists and socket emits chat:private
Unauthorized (401)	Invalid / expired JWT → re-login
Blank sidebar	Check /api/users and database contents

🧩 Commands Summary
Command	Function
npm run dev	Start app in dev mode (server or client)
npm run build	Build for production
npm start	Run compiled server build

👨‍💻 Contributing
Fork this repository

Create your feature branch:

bash
Copy code
git checkout -b feature/amazing
Commit your changes:

bash
Copy code
git commit -m "Add something amazing"
Push to the branch:

bash
Copy code
git push origin feature/amazing
Create a Pull Request

📜 License
MIT License © 2025 Your Name
Feel free to use and modify for personal / educational projects.

💖 Acknowledgements
Socket.IO for realtime communication

TailwindCSS for rapid modern UI styling

Sequelize for ORM convenience

React + Vite for lightning-fast development

Everyone contributing to open-source ❤️