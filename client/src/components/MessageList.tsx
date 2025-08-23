type Sender = { _id: string; username: string }
export type Message = { _id: string; content: string; createdAt: string; sender: Sender }

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 overflow-y-auto space-y-2">
      {messages.map(m => (
        <div key={m._id} className="bg-white border rounded p-2 shadow-sm">
          <div className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleTimeString()} • {m.sender.username}</div>
          <div className="text-sm">{m.content}</div>
        </div>
      ))}
    </div>
  )
}
