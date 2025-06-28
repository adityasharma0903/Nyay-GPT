import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function ChatHistorySidebar() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide sidebar on auth routes
  const hideSidebar = ["/login", "/signup"].includes(location.pathname);

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

  if (hideSidebar) return null;

  return (
    <>
      {/* GPT-Style Floating Hamburger Button (Top-Left Corner) */}
      {!isOpen && (
<button
  className="fixed top-25 left-3 z-50 bg-white text-slate-900 p-[10px] rounded-full shadow-md hover:bg-slate-100 focus:outline-none transition md:top-6 md:left-4"
  onClick={() => setIsOpen(true)}
  aria-label="Open sidebar"
>
  <Menu size={22} strokeWidth={2.5} />
</button>
      )}

      {/* Background Overlay (only when sidebar is open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-slate-900 text-white border-r border-slate-800 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        w-72 max-w-full`}
      >
        {/* Header with Close Button */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold">Chat History</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-slate-800 transition"
            aria-label="Close sidebar"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading && <div className="p-4">Loading...</div>}
          {!loading && chats.length === 0 && (
            <div className="p-4 text-slate-400">No chats yet.</div>
          )}
          {chats.map((chat) => (
            <button
              key={chat.chatId}
              className="w-full text-left px-4 py-3 hover:bg-slate-800 border-b border-slate-800"
              onClick={() => {
                navigate(`/chat/${chat.chatId}`);
                setIsOpen(false);
              }}
            >
              <div className="font-medium truncate">
                {chat.messages?.[chat.messages.length - 1]?.content?.slice(0, 40) || "New Chat"}
              </div>
              <div className="text-xs text-slate-400">
                {new Date(chat.updatedAt).toLocaleString()}
              </div>
            </button>
          ))}
        </div>

        <button
          className="m-4 p-2 bg-blue-600 rounded text-white font-bold w-[90%] mx-auto block"
          onClick={() => {
            navigate("/");
            setIsOpen(false);
          }}
        >
          + New Chat
        </button>
      </aside>
    </>
  );
}
