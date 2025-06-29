"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { MessageSquare, Plus, X, Clock } from "lucide-react"

// Accept isOpen and setIsOpen as props
export default function ChatHistorySidebar({ isOpen, setIsOpen }) {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Hide sidebar on auth routes
  const hideSidebar = ["/login", "/signup"].includes(location.pathname)

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true)
      try {
        const user = JSON.parse(localStorage.getItem("user"))
        const token = user?.token

        const res = await fetch("https://nyay-gpt.onrender.com/history", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setChats(data.chats || [])
      } catch (error) {
        setChats([])
        console.error("Chat history fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [])

  if (hideSidebar) return null
  if (!isOpen) return null

  // Helper style objects
  const flexBetween = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  }

  const chatHistoryHeader = {
    background: "linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "24px",
    ...flexBetween
  }

  const chatHistoryTitle = {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "white"
  }

  const closeBtnStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "12px",
    padding: "8px",
    transition: "all 0.2s",
    cursor: "pointer"
  }

  const newChatBtnStyle = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)",
    transition: "all 0.3s",
    fontWeight: 500,
    color: "white",
    fontSize: "1.125rem"
  }

  const chatListWrapStyle = {
    flex: 1,
    overflowY: "auto",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingBottom: "16px",
    maxHeight: "calc(100vh - 200px)"
  }

  const chatListBtnStyle = {
    width: "100%",
    textAlign: "left",
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s",
    
  }

  const chatListIconStyle = {
    padding: "8px",
    borderRadius: "12px",
    marginTop: "4px",
    flexShrink: 0,
    background: "linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)",
    border: "1px solid rgba(96, 165, 250, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }

  const chatListMsgStyle = {
    fontWeight: 500,
    color: "white",
    fontSize: "1rem",
    marginBottom: "8px",
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  }

  const chatMetaWrap = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "0.875rem",
    color: "#9ca3af"
  }

  const chatMetaGray = {
    color: "#4b5563"
  }

  const sidebarFooterStyle = {
    padding: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.02)",
    textAlign: "center"
  }

  const footerTitleStyle = {
    fontSize: "0.875rem",
    color: "#9ca3af",
    fontWeight: 500,
    marginBottom: 0
  }

  const footerSubStyle = {
    fontSize: "0.75rem",
    color: "#6b7280",
    marginTop: "4px"
  }

  const loaderBoxStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "16px",
    borderRadius: "18px",
    marginBottom: "16px"
  }

  const loaderBar1 = {
    height: "16px",
    background: "#4b5563",
    borderRadius: "8px",
    marginBottom: "12px",
    opacity: 0.5,
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
  }
  const loaderBar2 = {
    height: "12px",
    background: "#374151",
    borderRadius: "8px",
    width: "75%",
    opacity: 0.5,
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
  }

  const noChatIconWrap = {
    width: "80px",
    height: "80px",
    margin: "0 auto 24px auto",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%)",
    border: "1px solid rgba(156, 163, 175, 0.2)"
  }

  const noChatsTitle = {
    color: "#d1d5db",
    fontSize: "1.125rem",
    fontWeight: 500,
    marginBottom: "8px"
  }

  const noChatsSub = {
    color: "#6b7280",
    fontSize: "0.875rem"
  }

  const asideBaseStyle = {
    position: "relative", // not fixed!
    top: 0,
    left: 0,
    height: "100vh",
    zIndex: 50,
    width: "320px",
    background: "linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)",
    backdropFilter: "blur(24px)",
    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    minWidth: "220px",
    maxWidth: "95vw",
    transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
  }

  // Responsive width (optional for mobile)
  if (window.innerWidth <= 480) {
    asideBaseStyle.width = "100vw"
  } else if (window.innerWidth <= 768) {
    asideBaseStyle.width = "260px"
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return "New Chat"
    return message.length > maxLength ? message.substring(0, maxLength) + "..." : message
  }

  return (
    <>
      <aside style={asideBaseStyle}>
        {/* Header */}
        <div style={chatHistoryHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "#1e293b",
                padding: "8px",
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(96, 165, 250, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare size={18} color="#60a5fa" />
            </div>
            <h2 style={chatHistoryTitle}>Chat History</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={closeBtnStyle}
            aria-label="Close sidebar"
          >
            <X size={18} color="white" />
          </button>
        </div>
        {/* New Chat Button */}
        <div style={{ padding: "16px" }}>
          <button
            style={newChatBtnStyle}
            onClick={() => {
              navigate("/")
              setIsOpen(false)
            }}
          >
            <Plus size={20} color="#10b981" />
            <span style={{ color: "white", fontWeight: 500, fontSize: "1.125rem" }}>New Chat</span>
          </button>
        </div>

        {/* Chat List */}
        <div style={chatListWrapStyle}>
          {loading ? (
            <div>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={loaderBoxStyle}>
                  <div style={loaderBar1}></div>
                  <div style={loaderBar2}></div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: "64px", paddingBottom: "64px" }}>
              <div style={noChatIconWrap}>
                <MessageSquare size={32} color="#9ca3af" />
              </div>
              <p style={noChatsTitle}>No conversations yet</p>
              <p style={noChatsSub}>Start a new chat to see your history</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {chats.map((chat) => (
                <button
                  key={chat.chatId}
                  style={chatListBtnStyle}
                  onClick={() => {
                    navigate(`/chat/${chat.chatId}`)
                    setIsOpen(false)
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    <div style={chatListIconStyle}>
                      <MessageSquare size={16} color="#60a5fa" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={chatListMsgStyle}>
                        {truncateMessage(chat.messages?.[chat.messages.length - 1]?.content)}
                      </div>
                      <div style={chatMetaWrap}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} />
                          <span>{formatTime(chat.updatedAt)}</span>
                        </div>
                        <span style={chatMetaGray}>•</span>
                        <span>{chat.messages?.length || 0} messages</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Footer */}
        <div style={sidebarFooterStyle}>
          <div>
            <div style={footerTitleStyle}>Chanakya AI</div>
            <div style={footerSubStyle}>Legal Assistant</div>
          </div>
        </div>
      </aside>
      {/* Custom Styles */}
      <style>{`
          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
          aside::-webkit-scrollbar {
            width: 6px;
          }
          aside::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
          }
          aside::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, rgba(96, 165, 250, 0.3) 0%, rgba(168, 85, 247, 0.2) 100%);
            border-radius: 8px;
          }
          aside::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, rgba(96, 165, 250, 0.5) 0%, rgba(168, 85, 247, 0.3) 100%);
          }
        `}
      </style>
    </>
  )
}