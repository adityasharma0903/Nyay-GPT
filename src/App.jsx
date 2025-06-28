import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { getAuth, onIdTokenChanged } from "firebase/auth";

// Pages / Components
import MainLanding from "./components/MainLanding";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import ChatHistorySidebar from "./ChatHistorySidebar";
import ChatViewer from "./components/ChatViewer"; // ⬅️ New component for clean chat display

export default function App() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const location = useLocation();

  // 🔐 Firebase ID Token Listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem("user", JSON.stringify({ token, uid: user.uid }));
      } else {
        localStorage.removeItem("user");
      }
    });
    return () => unsubscribe();
  }, []);

  // 📌 Show sidebar only on homepage
  const showSidebar = location.pathname === "/";

  // 📌 Handle chat selection from sidebar
  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    console.log("Selected Chat ID:", chatId);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {showSidebar && <ChatHistorySidebar onSelectChat={handleSelectChat} />}
      <div style={{ flex: 1, overflow: "auto" }}>
        <Routes>
          <Route path="/" element={<MainLanding chatId={selectedChatId} />} />
          <Route path="/chat/:chatId" element={<ChatViewer />} /> {/* 💬 Full-page chat view */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </div>
  );
}
