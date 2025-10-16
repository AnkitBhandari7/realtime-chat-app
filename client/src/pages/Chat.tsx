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
  recipient?: Sender | null;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load users + stats
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

  // Socket connection
  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001", {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected")
    });

    socket.on("chat:history", (history) => {
      console.log(" Received chat history:", history);
      const formatted = history.map((m: any) => ({
        _id: String(m.id),
        content: m.content,
        createdAt: m.createdAt,
        sender: { _id: String(m.sender.id), username: m.sender.username },
        recipient: m.recipient
          ? { _id: String(m.recipient.id), username: m.recipient.username }
          : null,
      }));
      setMessages(formatted);
    });

    socket.on("chat:message", (msg: any) => {
      console.log("New public message:", msg);
      appendMessage(msg);
    });

    socket.on("chat:private", (msg: any) => {
      console.log("New private message:", msg);
      appendMessage(msg);
    });

    socket.on("stats:update", (s: Stats) => setStats(s));

    return () => {
      console.log("Disconnecting socket");
      socket.disconnect();
    };
  }, [token]);

  function appendMessage(msg: any) {
    const formatted: Message = {
      _id: String(msg.id),
      content: msg.content,
      createdAt: msg.createdAt,
      sender: { _id: String(msg.sender.id), username: msg.sender.username },
      recipient: msg.recipient
        ? { _id: String(msg.recipient.id), username: msg.recipient.username }
        : null,
    };

    // Avoid duplicate messages
    setMessages((prev) => {
      const exists = prev.some((m) => m._id === formatted._id);
      if (exists) {
        console.log("Duplicate message detected, skipping:", formatted._id);
        return prev;
      }
      return [...prev, formatted];
    });
  }

  // When user selects someone for private chat
  async function handleSelectUser(id: number, name: string) {
    setActiveChatUserId(id);
    setActiveChatUserName(name);

    try {
      const { data } = await api.get(`/chat/private/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formatted = data.map((m: any) => ({
        _id: String(m.id),
        content: m.content,
        createdAt: m.createdAt,
        sender: { _id: String(m.sender.id), username: m.sender.username },
        recipient: m.recipient
          ? { _id: String(m.recipient.id), username: m.recipient.username }
          : null,
      }));
      setMessages(formatted);
    } catch (err) {
      console.error("Failed to load private conversation:", err);
    }
  }

  //  Back to public chat
  function backToPublicChat() {
    setActiveChatUserId(null);
    setActiveChatUserName(null);
    // Reload public chat history
    socketRef.current?.emit("get:history");
  }

  // Send message
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    const content = text.trim();

    if (activeChatUserId) {
      // Private message
      socketRef.current?.emit("chat:private", {
        recipientId: activeChatUserId,
        content,
      });
    } else {
      // Public message
      socketRef.current?.emit("chat:message", {
        content,
      });
    }

    setText("");
  }

  // Logout
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  }

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
          {/*  Public Chat Option */}
          <div className="px-4 text-xs uppercase text-gray-400 mb-1">
            Chats
          </div>
          <div
            onClick={backToPublicChat}
            className={`flex items-center gap-3 px-4 py-2 cursor-pointer ${activeChatUserId === null
              ? "bg-[#2E3348]"
              : "hover:bg-[#2E3348]/70"
              }`}
          >
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-xs">
              #
            </div>
            <div>
              <div className="font-medium">Public Chat</div>
              <div className="text-xs text-gray-400">Everyone can see</div>
            </div>
          </div>

          <div className="px-4 text-xs uppercase text-gray-400 mb-1 mt-4">
            People
          </div>
          {users.map((u) => (
            <div
              key={u.id}
              onClick={() => handleSelectUser(u.id, u.username)}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer ${activeChatUserId === u.id
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
            {activeChatUserName ? (
              <>
                <span className="text-gray-400">Chat with</span> @{activeChatUserName}
              </>
            ) : (
              <>
                <span className="text-blue-400">#</span> Public Chat
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center uppercase text-white text-xs">
                {username[0]}
              </div>
              <span className="text-gray-200 text-sm">{username}</span>
            </div>
            <button
              onClick={logout}
              className="text-xs px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scroll">
          {messages.map((m) => {
            const mine = m.sender.username === username;
            const isPrivate = m.recipient !== null;

            return (
              <div
                key={m._id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div className="flex flex-col max-w-xs">
                  {/* Show username for other users' messages */}
                  {!mine && (
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <div className="h-6 w-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px] uppercase">
                        {m.sender.username[0]}
                      </div>
                      <span className="text-xs font-medium text-blue-400">
                        {m.sender.username}
                      </span>
                      {isPrivate && (
                        <span className="text-[9px] bg-purple-600 px-1.5 py-0.5 rounded text-white">
                          Private
                        </span>
                      )}
                    </div>
                  )}

                  {/* Show "You" badge for own messages */}
                  {mine && isPrivate && (
                    <div className="flex items-center gap-2 mb-1 px-1 justify-end">
                      <span className="text-[9px] bg-purple-600 px-1.5 py-0.5 rounded text-white">
                        Private
                      </span>
                      <span className="text-xs font-medium text-gray-400">
                        You
                      </span>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`px-3 py-2 rounded-lg ${mine
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-[#2C3145] text-gray-200 rounded-bl-none"
                      }`}
                  >
                    <div className="break-words">{m.content}</div>
                    <div
                      className={`text-[10px] mt-1 text-right ${mine ? "text-blue-200" : "text-gray-400"
                        }`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={send}
          className="h-16 border-t border-gray-700 flex items-center px-4 gap-3"
        >
          <PaperClipIcon className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-300 transition" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              activeChatUserId
                ? `Message @${activeChatUserName}...`
                : "Type a message in public chat..."
            }
            className="flex-1 bg-[#2A3043] rounded-full px-4 py-2 focus:outline-none placeholder-gray-400 text-gray-200"
          />
          <FaceSmileIcon className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-300 transition" />
          <button type="submit" disabled={!text.trim()}>
            <ArrowUpCircleIcon
              className={`h-7 w-7 transition ${text.trim()
                ? "text-blue-500 hover:text-blue-400"
                : "text-gray-600"
                }`}
            />
          </button>
        </form>
      </div>
    </div>
  );
}