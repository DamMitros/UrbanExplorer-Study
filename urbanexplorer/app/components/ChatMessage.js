// app/components/ChatMessage.js
export default function ChatMessage({ message, currentUser }) {
  return (
    <div className={`p-2 mb-2 rounded ${
      message.author === currentUser?.username ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
    }`}>
      <p className="font-semibold">{message.author}</p>
      <p>{message.message}</p>
      <p className="text-xs text-gray-500">
        {new Date(message.timestamp).toLocaleTimeString()}
      </p>
      {message.reactions?.length > 0 && (
        <div className="flex gap-1 mt-1">
          {message.reactions.map((reaction, i) => (
            <span key={i} className="text-sm">{reaction}</span>
          ))}
        </div>
      )}
    </div>
  );
}