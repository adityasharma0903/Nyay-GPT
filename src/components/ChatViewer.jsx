"use client"
import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Mic, MicOff, Volume2 } from "lucide-react"

const backendBaseUrl =
  window.location.hostname === "localhost" ? "http://localhost:3000" : "https://nyay-gpt.onrender.com"

// Same language configurations as MainLanding
const languages = {
  english: { code: "en-IN" },
  hindi: { code: "hi-IN" },
  punjabi: { code: "pa-IN" },
  tamil: { code: "ta-IN" },
  marathi: { code: "mr-IN" },
  telugu: { code: "te-IN" },
  bengali: { code: "bn-IN" },
  kannada: { code: "kn-IN" },
  malayalam: { code: "ml-IN" },
  gujarati: { code: "gu-IN" },
  urdu: { code: "ur-IN" },
  odia: { code: "or-IN" },
}

const languageKeywords = {
  english: ["english", "इंग्लिश", "अंग्रेजी"],
  hindi: ["hindi", "हिंदी", "हिन्दी"],
  punjabi: ["punjabi", "ਪੰਜਾਬੀ", "पंजाबी"],
  tamil: ["tamil", "तमिल", "தமிழ்"],
  marathi: ["marathi", "मराठी"],
  telugu: ["telugu", "तेलुगू", "తెలుగు"],
  bengali: ["bengali", "বেঙ্গলি", "বাঙালি", "बंगाली"],
  kannada: ["kannada", "ಕನ್ನಡ", "कन्नड़"],
  malayalam: ["malayalam", "മലയാളം", "मलयालम"],
  gujarati: ["gujarati", "ગુજરાતી", "गुजराती"],
  urdu: ["urdu", "اردو", "उर्दू"],
  odia: ["odia", "odiya", "ଓଡ଼ିଆ", "ओଡ़िया"],
}

export default function ChatViewer() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)

  // Voice functionality states
  const [connected, setConnected] = useState(false)
  const [muted, setMuted] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [readyToSpeak, setReadyToSpeak] = useState(false)
  const [currentLang, setCurrentLang] = useState("hindi")
  const [recognitionKey, setRecognitionKey] = useState(0)
  const [user, setUser] = useState(null)

  // Voice refs
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const apiCallInProgressRef = useRef(false)
  const utteranceIdRef = useRef(0)

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Function to filter out AI intro/system messages - MORE AGGRESSIVE
  const filterRelevantMessages = (messages) => {
    console.log("🔍 Original messages:", messages.length)
    // More comprehensive intro keywords
    const introKeywords = [
      "नमस्ते",
      "hello",
      "मैं न्याय",
      "i'm nyay",
      "i am nyay",
      "legal assistant",
      "कानूनी सहायक",
      "chanakya ai",
      "चाणक्य",
      "आपकी बेहतर मदद",
      "for better assistance",
      "preferred language",
      "पसंदीदा भाषा",
      "मैं एक भारत का",
      "कानूनी न्याय",
      "न्याय जीपीटी",
      "आपका पहला सवाल",
      "your first question",
      "मुझे जवाब हिंदी में",
      "निर्देशों की स्वीकार",
      "आपके निर्देशों को स्वीकार कर लिया",
      "आप अपना अगला सवाल पूछ सकते हैं",
    ]

    const filtered = messages.filter((msg, index) => {
      const content = msg.content.toLowerCase()
      // Skip first 2 messages if they look like system messages
      if (index < 2) {
        const isSystemMessage =
          introKeywords.some((keyword) => content.includes(keyword.toLowerCase())) || content.length < 100 // Very short messages are likely intros
        if (isSystemMessage) {
          console.log(`🚫 Skipping message ${index + 1} (system/intro):`, msg.content.substring(0, 50))
          return false
        }
      }

      // For assistant messages, be more strict
      if (msg.role === "assistant") {
        const isIntroMessage = introKeywords.some((keyword) => content.includes(keyword.toLowerCase()))
        // Skip if it contains intro keywords OR is very generic
        if (isIntroMessage || content.includes("कृपया अपना") || content.includes("please ask")) {
          console.log(`🚫 Filtering assistant intro:`, msg.content.substring(0, 50))
          return false
        }
      }

      // Always keep user messages (they are genuine questions)
      if (msg.role === "user") {
        console.log(`✅ Keeping user message:`, msg.content.substring(0, 50))
        return true
      }

      // Keep assistant messages that seem like real responses
      console.log(`✅ Keeping assistant response:`, msg.content.substring(0, 50))
      return true
    })

    console.log("🔍 Filtered messages:", filtered.length)
    console.log("🔍 Final filtered messages:")
    filtered.forEach((msg, i) => {
      console.log(`${i + 1}. ${msg.role}: ${msg.content.substring(0, 80)}...`)
    })

    return filtered
  }

  // Fetch chat messages
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"))
        const token = user?.token
        const res = await fetch(`https://nyay-gpt.onrender.com/history/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) throw new Error("Failed to fetch chat")
        const data = await res.json()
        const chatMessages = data.chat?.messages || []
        // Filter out intro messages for better context
        const filteredMessages = filterRelevantMessages(chatMessages)
        setMessages(chatMessages) // Keep all messages for UI
        console.log("📚 Total messages loaded:", chatMessages.length)
        console.log("📚 Relevant messages for AI:", filteredMessages.length)
        // Auto-detect language from chat history
        detectLanguageFromHistory(filteredMessages)
      } catch (error) {
        console.error("Chat load error:", error.message)
        setMessages([])
      } finally {
        setLoading(false)
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      }
    }
    fetchChat()
  }, [chatId])

  // Auto-detect language from chat history
  const detectLanguageFromHistory = (chatMessages) => {
    if (chatMessages.length === 0) return
    // Check last few messages for language patterns
    const recentMessages = chatMessages.slice(-5)
    const combinedText = recentMessages
      .map((msg) => msg.content)
      .join(" ")
      .toLowerCase()

    // Simple language detection based on keywords
    for (const [lang, keywords] of Object.entries(languageKeywords)) {
      if (keywords.some((keyword) => combinedText.includes(keyword.toLowerCase()))) {
        setCurrentLang(lang)
        console.log("🌐 Detected language:", lang)
        return
      }
    }

    // Check for Hindi/Devanagari script
    if (/[\u0900-\u097F]/.test(combinedText)) {
      setCurrentLang("hindi")
      console.log("🌐 Detected Hindi script")
    } else if (/[a-zA-Z]/.test(combinedText)) {
      setCurrentLang("english")
      console.log("🌐 Detected English")
    }
  }

  // Audio unlock for mobile devices
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const buffer = new AudioContext().createBuffer(1, 1, 22050)
        const source = new AudioContext().createBufferSource()
        source.buffer = buffer
        source.connect(new AudioContext().destination)
        source.start(0)
      } catch (e) {
        console.log("Audio unlock failed:", e)
      }
      document.removeEventListener("touchend", unlockAudio, true)
      document.removeEventListener("click", unlockAudio, true)
    }
    document.addEventListener("touchend", unlockAudio, true)
    document.addEventListener("click", unlockAudio, true)
    return () => {
      document.removeEventListener("touchend", unlockAudio, true)
      document.removeEventListener("click", unlockAudio, true)
    }
  }, [])

  // Speech recognition setup
  useEffect(() => {
    if (!connected) return
    if (muted || speaking) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Use the latest Chrome.")
      return
    }

    const langToUse = currentLang && languages[currentLang] ? languages[currentLang].code : "hi-IN"
    const recognition = new SpeechRecognition()
    recognition.lang = langToUse
    recognition.continuous = true
    recognition.interimResults = false

    let stoppedByApp = false

    recognition.onresult = async (event) => {
      if (muted || speaking || apiCallInProgressRef.current) return

      setUserSpeaking(true)
      setReadyToSpeak(false)
      setTimeout(() => setUserSpeaking(false), 1200)

      recognition.stop()
      utteranceIdRef.current += 1
      const thisUtterance = utteranceIdRef.current

      const userSpeech = event.results[event.results.length - 1][0].transcript.trim()
      console.log("🎤 User said:", userSpeech)

      if (!apiCallInProgressRef.current) {
        apiCallInProgressRef.current = true
        setSpeaking(true)

        // ✅ AGGRESSIVE filtering to exclude ALL intro messages
        console.log("📊 BEFORE filtering - Total messages:", messages.length)
        const relevantHistory = filterRelevantMessages(messages)
        console.log("📊 AFTER filtering - Relevant messages:", relevantHistory.length)

        const newUserMessage = { role: "user", content: userSpeech }
        const fullChatHistory = [...relevantHistory, newUserMessage]

        console.log("📤 FINAL PAYLOAD TO AI:")
        console.log("📤 Total messages being sent:", fullChatHistory.length)
        fullChatHistory.forEach((msg, i) => {
          console.log(`📤 ${i + 1}. [${msg.role.toUpperCase()}]: ${msg.content}`)
        })

        // Update UI with all messages (including new user message)
        setMessages((prev) => [...prev, newUserMessage])

        // Save user message to backend
        await saveUserChat(newUserMessage, chatId)

        try {
          // ✅ Call assistant API with HEAVILY FILTERED chat history
          const res = await fetch(`${backendBaseUrl}/ask-context`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              history: fullChatHistory, // ✅ This now excludes ALL intro messages
              language: currentLang,
            }),
          })

          if (!res.ok) throw new Error(`Server responded with ${res.status}`)
          const data = await res.json()
          console.log("📥 AI Response received:", data.reply.substring(0, 100))

          // If this is still the latest utterance, process reply
          if (utteranceIdRef.current === thisUtterance && apiCallInProgressRef.current) {
            const assistantMessage = { role: "assistant", content: data.reply }

            // Add assistant reply to UI
            setMessages((prev) => [...prev, assistantMessage])

            // Save assistant reply to backend
            await saveUserChat(assistantMessage, chatId)

            // Speak reply and prepare for next
            await speakText(data.reply, currentLang)
            setRecognitionKey((k) => k + 1)
          }
        } catch (err) {
          console.error("API Error:", err)
          setSpeaking(false)
          setRecognitionKey((k) => k + 1)
        } finally {
          apiCallInProgressRef.current = false
        }
      }
    }

    recognition.onend = () => {
      if (connected && !muted && !stoppedByApp && !speaking) {
        try {
          recognition.start()
        } catch (e) {
          console.log("Recognition restart failed:", e)
        }
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      console.log("🎤 Speech recognition started")
    } catch (e) {
      console.log("Recognition start failed:", e)
    }

    return () => {
      stoppedByApp = true
      recognition.stop()
    }
  }, [connected, muted, recognitionKey, speaking, currentLang, messages, chatId])

  // Save chat function
  const saveUserChat = async (messageObj, existingChatId) => {
    if (!user?.token) {
      console.log("No user token available")
      return
    }

    try {
      const res = await fetch(`${backendBaseUrl}/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          chatId: existingChatId,
          message: messageObj,
        }),
      })

      const data = await res.json()
      console.log("💾 Saved message to backend:", messageObj.role)
      return data.chatId
    } catch (err) {
      console.error("Failed to save chat:", err)
    }
  }

  // Text to speech function
  const speakText = async (text, langKey = currentLang || "hindi") => {
    console.log("🎤 Starting speech:", text.substring(0, 50) + "...")

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }

    try {
      const res = await fetch(`${backendBaseUrl}/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: langKey }),
      })

      if (!res.ok) {
        throw new Error(`TTS request failed: ${res.status}`)
      }

      const blob = await res.blob()
      const audioUrl = URL.createObjectURL(blob)
      const audio = new window.Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setSpeaking(false)
        setReadyToSpeak(true)
        console.log("🔊 Speech ended, ready for next input")
      }

      audio.onerror = (e) => {
        console.error("Audio playback error:", e)
        setSpeaking(false)
        setReadyToSpeak(true)
      }

      setSpeaking(true)
      setReadyToSpeak(false)

      try {
        await audio.play()
      } catch (err) {
        console.error("Audio play failed:", err)
        alert("Please tap anywhere on the screen to enable audio, then try again.")
        setSpeaking(false)
        setReadyToSpeak(false)
      }
    } catch (error) {
      console.error("TTS error:", error)
      setSpeaking(false)
      setReadyToSpeak(false)
    }
  }

  // Handle microphone toggle
  const handleMicToggle = () => {
    if (!connected) {
      // Start voice conversation
      setConnected(true)
      setMuted(false)
      setRecognitionKey((k) => k + 1)
      const relevantMessages = filterRelevantMessages(messages)
      console.log("🎤 Voice chat started with", relevantMessages.length, "relevant messages")

      // Welcome message for continuing conversation
      const welcomeMessage =
        currentLang === "hindi"
          ? "मैं आपके पिछले सवालों को समझ गया हूं। आप अपना अगला सवाल पूछ सकते हैं।"
          : "I understand your previous questions. You can ask your next question."

      speakText(welcomeMessage, currentLang)
    } else {
      // End voice conversation
      setConnected(false)
      setMuted(false)
      setSpeaking(false)
      setReadyToSpeak(false)
      recognitionRef.current?.stop()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      apiCallInProgressRef.current = false
      console.log("🎤 Voice chat ended")
    }
  }

  // Handle mute toggle
  const handleMute = () => {
    setMuted((m) => !m)
    if (!muted) {
      recognitionRef.current?.stop()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      setSpeaking(false)
      setReadyToSpeak(false)
    } else {
      setRecognitionKey((k) => k + 1)
    }
  }

  // Calculate relevant message count for display
  const relevantMessageCount = filterRelevantMessages(messages).length

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1d2e 0%, #252845 100%)",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Glassmorphism Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
          background: "rgba(52, 55, 74, 0.3)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          style={{
            maxWidth: "56rem",
            margin: "0 auto",
            padding: "1rem 1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <button
                onClick={() => navigate("/")}
                style={{
                  padding: "0.75rem",
                  borderRadius: "50%",
                  background: "rgba(52, 55, 74, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.2)"
                  e.target.style.transform = "scale(1.05)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(52, 55, 74, 0.4)"
                  e.target.style.transform = "scale(1)"
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    background: "linear-gradient(to right, #60a5fa, #a78bfa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    margin: 0,
                  }}
                >
                  Chanakya AI
                </h1>
                {messages.length > 0 && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(255, 255, 255, 0.6)",
                      margin: 0,
                    }}
                  >
                    {relevantMessageCount} relevant messages
                  </p>
                )}
              </div>
            </div>

            {/* Voice Controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              {/* Voice Status Indicator */}
              <div
                style={{
                  display: window.innerWidth >= 640 ? "flex" : "none",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "50px",
                  background: "rgba(52, 55, 74, 0.4)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                {speaking && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Volume2
                      size={16}
                      style={{
                        color: "#60a5fa",
                        animation: "pulse 2s infinite",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: "#60a5fa",
                      }}
                    >
                      AI Speaking
                    </span>
                  </div>
                )}
                {userSpeaking && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        background: "#4ade80",
                        borderRadius: "50%",
                        animation: "pulse 2s infinite",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: "#4ade80",
                      }}
                    >
                      Listening
                    </span>
                  </div>
                )}
                {readyToSpeak && !speaking && !userSpeaking && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        background: "#f87171",
                        borderRadius: "50%",
                        animation: "pulse 2s infinite",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: "#f87171",
                        fontWeight: "600",
                      }}
                    >
                      Ready!
                    </span>
                  </div>
                )}
                {connected && !speaking && !userSpeaking && !readyToSpeak && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        background: "#4ade80",
                        borderRadius: "50%",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: "#4ade80",
                      }}
                    >
                      Voice Active
                    </span>
                  </div>
                )}
                {!connected && (
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    Voice Inactive
                  </span>
                )}
              </div>

              {/* Mute Button */}
              {connected && (
                <button
                  onClick={handleMute}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "50%",
                    background: muted ? "rgba(239, 68, 68, 0.2)" : "rgba(52, 55, 74, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: muted ? "#f87171" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = muted ? "rgba(239, 68, 68, 0.3)" : "rgba(255, 255, 255, 0.2)"
                    e.target.style.transform = "scale(1.05)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = muted ? "rgba(239, 68, 68, 0.2)" : "rgba(52, 55, 74, 0.4)"
                    e.target.style.transform = "scale(1)"
                  }}
                  title={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}

              {/* Main Mic Button */}
              <button
                onClick={handleMicToggle}
                style={{
                  padding: "1rem",
                  borderRadius: "50%",
                  background: connected
                    ? readyToSpeak
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(34, 197, 94, 0.2)"
                    : "rgba(59, 130, 246, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: connected ? (readyToSpeak ? "#f87171" : "#4ade80") : "#60a5fa",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(4px)",
                  boxShadow: connected
                    ? readyToSpeak
                      ? "0 0 20px rgba(248, 113, 113, 0.25)"
                      : "0 0 20px rgba(74, 222, 128, 0.25)"
                    : "0 0 20px rgba(96, 165, 250, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  if (connected) {
                    e.target.style.background = readyToSpeak ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)"
                  } else {
                    e.target.style.background = "rgba(59, 130, 246, 0.3)"
                  }
                  e.target.style.transform = "scale(1.05)"
                }}
                onMouseLeave={(e) => {
                  if (connected) {
                    e.target.style.background = readyToSpeak ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)"
                  } else {
                    e.target.style.background = "rgba(59, 130, 246, 0.2)"
                  }
                  e.target.style.transform = "scale(1)"
                }}
                title={connected ? "End Voice Chat" : "Start Voice Chat"}
              >
                {connected ? userSpeaking ? <Mic size={22} /> : <MicOff size={22} /> : <Mic size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Status Bar */}
      {connected && (
        <div
          style={{
            backdropFilter: "blur(16px)",
            background: "rgba(37, 40, 69, 0.6)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              maxWidth: "56rem",
              margin: "0 auto",
              padding: "0.75rem 1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1.5rem",
                fontSize: "0.875rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "#4ade80",
                    borderRadius: "50%",
                    animation: "pulse 2s infinite",
                  }}
                />
                <span
                  style={{
                    color: "#4ade80",
                    fontWeight: "500",
                  }}
                >
                  Voice Chat Active
                </span>
              </div>
              <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Language:{" "}
                <span
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    textTransform: "capitalize",
                  }}
                >
                  {currentLang}
                </span>
              </div>
              <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Context: <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>{relevantMessageCount} messages</span>
              </div>
              {speaking && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      background: "#60a5fa",
                      borderRadius: "50%",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  <span style={{ color: "#60a5fa" }}>AI responding...</span>
                </div>
              )}
              {readyToSpeak && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      background: "#f87171",
                      borderRadius: "50%",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  <span
                    style={{
                      color: "#f87171",
                      fontWeight: "600",
                    }}
                  >
                    Speak now!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        style={{
          maxWidth: "56rem",
          margin: "0 auto",
          padding: "2rem 1.5rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 0",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "2px solid #60a5fa",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 1rem",
                  }}
                />
                <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>Loading conversation...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 0",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "rgba(52, 55, 74, 0.4)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Mic size={24} style={{ color: "#60a5fa" }} />
              </div>
              <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>No messages found in this conversation.</p>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.4)",
                  fontSize: "0.875rem",
                  marginTop: "0.5rem",
                }}
              >
                Start a voice chat to continue.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "1rem",
                    borderRadius: "1rem",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))"
                        : "rgba(52, 55, 74, 0.4)",
                    borderBottomRightRadius: msg.role === "user" ? "4px" : "1rem",
                    borderBottomLeftRadius: msg.role === "user" ? "1rem" : "4px",
                    color: msg.role === "user" ? "#ffffff" : "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {msg.content}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Voice Instructions */}
      {connected && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backdropFilter: "blur(16px)",
            background: "rgba(37, 40, 69, 0.6)",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div
            style={{
              maxWidth: "56rem",
              margin: "0 auto",
              padding: "1rem 1.5rem",
              textAlign: "center",
            }}
          >
            {userSpeaking ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "#4ade80",
                    borderRadius: "50%",
                    animation: "pulse 2s infinite",
                  }}
                />
                <span
                  style={{
                    color: "#4ade80",
                    fontWeight: "500",
                  }}
                >
                  Listening to your question...
                </span>
              </div>
            ) : speaking ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Volume2
                  size={16}
                  style={{
                    color: "#60a5fa",
                    animation: "pulse 2s infinite",
                  }}
                />
                <span
                  style={{
                    color: "#60a5fa",
                    fontWeight: "500",
                  }}
                >
                  AI is responding...
                </span>
              </div>
            ) : readyToSpeak ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "#f87171",
                    borderRadius: "50%",
                    animation: "pulse 2s infinite",
                  }}
                />
                <span
                  style={{
                    color: "#f87171",
                    fontWeight: "600",
                  }}
                >
                  SPEAK NOW - I understand your previous questions
                </span>
              </div>
            ) : (
              <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Voice chat is active. I understand your {relevantMessageCount} previous questions.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(52, 55, 74, 0.3);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(52, 55, 74, 0.6);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(52, 55, 74, 0.8);
        }
      `}</style>
    </div>
  )
}
