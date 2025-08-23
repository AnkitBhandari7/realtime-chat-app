export default function UserInfo({ username, totalMessages, totalUsers, onlineUsers }:
  { username: string; totalMessages: number; totalUsers: number; onlineUsers: number }) {
  return (
    <div className="flex items-center justify-between bg-white border rounded p-3 mb-3">
      <div className="text-sm">Logged in as <span className="font-medium">{username}</span></div>
      <div className="text-xs text-gray-600 space-x-3">
        <span>Total Users: {totalUsers}</span>
        <span>Total Messages: {totalMessages}</span>
        <span>Online: {onlineUsers}</span>
      </div>
    </div>
  )
}
