import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../api';
import MessageList, { Message } from '../components/MessageList';
import UserInfo from '../components/UserInfo';

type Stats = { totalMessages: number; totalUsers: number; onlineUsers: number };

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [stats, setStats] = useState<Stats>({ totalMessages: 0, totalUsers: 0, onlineUsers: 0 });
  const username = localStorage.getItem('username') || 'user';
  const token = localStorage.getItem('token') || '';
  const socketRef = useRef<Socket | null>(null);

  // Load initial messages + stats from REST API
  useEffect(() => {
    async function load() {
      try {
        const [msgsRes, statsRes] = await Promise.all([
          api.get<Message[]>('/chat/messages?limit=50'),
          api.get<Stats>('/chat/stats'),
        ]);
        setMessages(msgsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }
    load();
  }, []);

  // Socket.io connection
  useEffect(() => {
    if (!token) {
      console.warn('No token found. Redirect user to login.');
      return;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001', {
      auth: { token },
      transports: ['websocket'], // helps avoid polling delay
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to socket server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });

    socket.on('chat:message', (msg: Message) => {
      console.log('📩 New message received:', msg);
      setMessages(prev => [...prev, msg]);
    });

    socket.on('user:join', (payload) => {
      console.log('👋 User joined:', payload);
    });

    socket.on('user:left', (payload) => {
      console.log('👋 User left:', payload);
    });

    socket.on('stats:update', (s: Stats) => {
      console.log('📊 Stats updated:', s);
      setStats(s);
    });

    return () => {
      socket.disconnect();
      console.log('🔌 Socket disconnected');
    };
  }, [token]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current?.emit('chat:message', { content: text });
    setText('');
  }

  return (
    <div className="max-w-3xl mx-auto">
      <UserInfo
        username={username}
        totalMessages={stats.totalMessages}
        totalUsers={stats.totalUsers}
        onlineUsers={stats.onlineUsers}
      />
      <div className="h-[65vh] flex flex-col">
        <MessageList messages={messages} />
        <form onSubmit={send} className="mt-3 flex gap-2">
          <input
            className="flex-1 border rounded p-2"
            placeholder="Type a message..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button className="bg-black text-white rounded px-4">Send</button>
        </form>
      </div>
    </div>
  );
}
