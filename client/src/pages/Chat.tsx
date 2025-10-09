import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import api from "../api";
import {
  PaperClipIcon,
  FaceSmileIcon,
  ArrowUpCircleIcon,
} from "@heroicons/react/24/solid";

type Stats = { totalMessages: number; totalUsers: number; onlineUsers: number };
interface Sender {
  _id: string;
  username: string;
}
interface Message {
  _id: string;
  content: string;
  createdAt: string;
  sender: Sender;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    totalUsers: 0,
    onlineUsers: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [activeChatUserId, setActiveChatUserId] = useState<number | null>(null);
  const [activeChatUserName, setActiveChatUserName] = useState<string | null>(
    null
  );

  const username = localStorage.getItem("username") || "user";
  const token = localStorage.getItem("token") || "";
  const socketRef = useRef<Socket | null>(null);

  //Load users + stats 
  useEffect(() => {
    async function loadInitial() {
      try {
        const [usersRes, statsRes] = await Promise.all([
          api.get("/users"),
          api.get("/chat/stats"),
        ]);
        const self = localStorage.getItem("username");
        setUsers(usersRes.data.filter((u: any) => u.username !== self));
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to load users/stats:", err);
      }
    }
    loadInitial();
  }, []);

  //Socket connection
  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001", {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("chat:history", (history) => {
      const formatted = history.map((m: any) => ({
        _id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        sender: { _id: m.sender.id, username: m.sender.username },
      }));
      setMessages(formatted);
    });

    socket.on("chat:message", (msg: any) => appendMessage(msg));
    socket.on("chat:private", (msg: any) => appendMessage(msg));
    socket.on("stats:update", (s: Stats) => setStats(s));

    return () => socket.disconnect();
  }, [token]);

  function appendMessage(msg: any) {
    const formatted: Message = {
      _id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt,
      sender: { _id: msg.sender.id, username: msg.sender.username },
    };
    setMessages((prev) => [...prev, formatted]);
  }

  //When user selects someone 
  async function handleSelectUser(id: number, name: string) {
    setActiveChatUserId(id);
    setActiveChatUserName(name);

    try {
      // fetch private history between login user and the selected one
      const { data } = await api.get(`/chat/private/${id}`);
      const formatted = data.map((m: any) => ({
        _id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        sender: { _id: m.sender.id, username: m.sender.username },
      }));
      setMessages(formatted);
    } catch (err) {
      console.error("Failed to load private conversation:", err);
    }
  }

  //Send message
  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    if (activeChatUserId) {
      // private message
      socketRef.current?.emit("chat:private", {
        recipientId: activeChatUserId,
        content: text,
      });
    } else {
      // public message
      socketRef.current?.emit("chat:message", { content: text });
    }

    setText("");
  }

  //Logout 
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  }

  //UI Layout 
  return (
    <div className="w-screen h-screen bg-[#1E2230] flex text-gray-200 text-sm font-sans">
      {/* LEFT SIDEBAR */}
      <div className="w-72 bg-[#191C28] border-r border-gray-700 flex flex-col">
        <div className="px-4 mb-3 pt-4">
          <input
            placeholder="Search user or chat"
            className="w-full rounded-lg bg-[#2B3042] px-3 py-2 text-xs placeholder-gray-400 focus:outline-none"
          />
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="px-4 text-xs uppercase text-gray-400 mb-1">
            People
          </div>
          {users.map((u) => (
            <div
              key={u.id}
              onClick={() => handleSelectUser(u.id, u.username)}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer ${
                activeChatUserId === u.id
                  ? "bg-[#2E3348]"
                  : "hover:bg-[#2E3348]/70"
              }`}
            >
              <div className="h-9 w-9 rounded-full bg-gray-600 flex items-center justify-center text-xs uppercase">
                {u.username[0]}
              </div>
              <div>
                <div className="font-medium">{u.username}</div>
                <div className="text-xs text-gray-400">
                  {activeChatUserId === u.id ? "Active now" : ""}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 text-[11px] text-gray-400 border-t border-gray-700">
          Users {stats.totalUsers} | Msgs {stats.totalMessages} | Online{" "}
          {stats.onlineUsers}
        </div>
      </div>

      {/* CHAT PANEL */}
      <div className="flex-1 flex flex-col bg-[#232738]">
        {/* Header */}
        <div className="h-14 border-b border-gray-700 px-5 flex items-center justify-between">
          <div className="font-semibold text-gray-100">
            {activeChatUserName ? `Chat • ${activeChatUserName}` : "Public Chat"}
          </div>

          {/* Logged-in user profile */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center uppercase text-white">
                {username[0]}
              </div>
              <span className="text-gray-200 text-sm">{username}</span>
            </div>
            <button
              onClick={logout}
              className="text-xs px-3 py-1 bg-red-600 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scroll">
          {messages.map((m) => {
            const mine = m.sender.username === username;
            return (
              <div
                key={m._id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-xs ${
                    mine
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-[#2C3145] text-gray-200 rounded-bl-none"
                  }`}
                >
                  {m.content}
                  <div className="text-[10px] text-gray-400 mt-1 text-right">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <form
          onSubmit={send}
          className="h-16 border-t border-gray-700 flex items-center px-4 gap-3"
        >
          <PaperClipIcon className="h-6 w-6 text-gray-400" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              activeChatUserId
                ? `Message @${activeChatUserName}`
                : "Type a message..."
            }
            className="flex-1 bg-[#2A3043] rounded-full px-4 py-2 focus:outline-none placeholder-gray-400"
          />
          <FaceSmileIcon className="h-6 w-6 text-gray-400" />
          <button type="submit">
            <ArrowUpCircleIcon className="h-7 w-7 text-blue-500" />
          </button>
        </form>
      </div>
    </div>
  );
}