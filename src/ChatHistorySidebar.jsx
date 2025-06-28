import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatHistorySidebar() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;
        const res = await fetch("https://nyay-gpt.onrender.com/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setChats(data.chats || []);
      } catch (error) {
        setChats([]);
        console.error("Chat history fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <aside className="w-72 bg-slate-900 text-white h-full flex flex-col border-r border-slate-800">
      <h2 className="text-xl font-bold p-4 border-b border-slate-800">Chat History</h2>
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 && (
          <div className="p-4 text-slate-400">No chats yet.</div>
        )}
        {chats.map((chat) => (
          <button
            key={chat.chatId}
            className="w-full text-left px-4 py-3 hover:bg-slate-800 border-b border-slate-800"
            onClick={() => navigate(`/chat/${chat.chatId}`)}
          >
            <div className="font-medium truncate">
              {chat.messages?.[chat.messages.length - 1]?.content?.slice(0, 40) ||
                "New Chat"}
            </div>
            <div className="text-xs text-slate-400">
              {new Date(chat.updatedAt).toLocaleString()}
            </div>
          </button>
        ))}
      </div>
      <button
        className="m-4 p-2 bg-blue-600 rounded text-white font-bold"
        onClick={() => navigate("/")}
      >
        + New Chat
      </button>
    </aside>
  );
}
