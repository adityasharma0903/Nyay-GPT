import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getAuth, onIdTokenChanged } from "firebase/auth";

import MainLanding from "./components/MainLanding";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import ChatHistorySidebar from "./ChatHistorySidebar";

export default function App() {
  const [selectedChatId, setSelectedChatId] = useState(null);

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    console.log("Selected Chat ID:", chatId);
  };

  // 🔐 Automatically refresh Firebase ID token and store it in localStorage
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken(); // auto-refreshes if expired
        localStorage.setItem("user", JSON.stringify({ token, uid: user.uid }));
      } else {
        localStorage.removeItem("user");
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <ChatHistorySidebar onSelectChat={handleSelectChat} />
      <div style={{ flex: 1, overflow: "auto" }}>
        <Routes>
          <Route path="/" element={<MainLanding chatId={selectedChatId} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </div>
  );
}
