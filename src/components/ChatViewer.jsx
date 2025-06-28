import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ChatViewer() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token;

        const res = await fetch(`https://nyay-gpt.onrender.com/history/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch chat");
        const data = await res.json();
        setMessages(data.chat?.messages || []);
      } catch (error) {
        console.error("Chat load error:", error.message);
        setMessages([]);
      } finally {
        setLoading(false);
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    fetchChat();
  }, [chatId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-slate-700 bg-[#111827] shadow-md sticky top-0 z-10">
        <button
          onClick={() => navigate("/")}
          className="mr-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold tracking-wide">Chat Viewer</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {loading ? (
          <p className="text-center text-slate-400">Fetching messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-slate-400">No messages found in this chat.</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[80%] px-5 py-3 text-sm rounded-2xl shadow-sm whitespace-pre-wrap leading-relaxed tracking-wide ${
                msg.role === "user"
                  ? "bg-blue-600 ml-auto text-white rounded-br-none"
                  : "bg-[#1e293b] mr-auto text-slate-100 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}
