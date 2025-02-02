import { useState } from "react";

export default function ChatMessage({ message, currentUser, onReaction, onReply }) {
  const [showReactions, setShowReactions] = useState(false);
  const isCurrentUser = message.author === currentUser?.username;
  const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  return (
    <div className={`flex w-full mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div className={`relative flex flex-col w-[80%] max-w-3xl`}>
        <div className={`opacity-0 hover:opacity-100 transition-opacity absolute top-0 flex flex-col gap-1 ${isCurrentUser ? "-left-12" : "-right-12"}`}>
          <button onClick={onReply} className="p-2 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button onClick={() => setShowReactions(!showReactions)} className="p-2 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </button>
        </div>

        <div className={`flex items-start gap-2 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium ${isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}>
              {message.author[0].toUpperCase()}
            </div>
          </div>

          <div className={`flex flex-col w-full ${isCurrentUser ? "items-end" : "items-start"}`}>
            {message.replyTo && (
              <div className="text-xs mb-1 px-3 py-1.5 rounded-lg bg-gray-100 w-full">
                <span className="text-gray-500">Odpowiedź na: </span>
                <span className="text-gray-700">{message.replyTo.message || "Usunięta wiadomość"}</span>
              </div>
            )}

            <div className={`w-full rounded-2xl px-4 py-3 shadow-sm ${isCurrentUser ? "bg-blue-500 text-white" : "bg-white border border-gray-200"}`}>
              <div className={`flex items-center gap-2 mb-1 w-full ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <span className={`text-sm font-medium ${isCurrentUser ? "text-blue-50" : "text-blue-600"}`}>{message.author}</span>
                <span className={`text-xs ${isCurrentUser ? "text-blue-200" : "text-gray-400"}`}>{new Date(message.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm break-words whitespace-pre-wrap">{message.message}</p>
            </div>

            {message.reactions && Object.entries(message.reactions).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(message.reactions).map(([emoji, users]) => (
                  <span key={emoji} className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${isCurrentUser ? "bg-blue-400/30 text-white" : "bg-gray-100 text-gray-700"}`}>{emoji} {users.length}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {showReactions && (
          <div className={`absolute z-10 ${isCurrentUser ? "right-0" : "left-0"} top-full mt-1`}>
            <div className="bg-white rounded-lg shadow-lg border p-2 flex gap-2">
              {emojis.map((emoji) => (
                <button className="hover:bg-gray-100 p-2 rounded-full transition-colors text-lg" key={emoji} onClick={() => {
                    onReaction(message._id, emoji);
                    setShowReactions(false);
                  }}>{emoji}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};