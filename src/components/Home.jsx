"use client"

import { useState, useEffect, useRef } from "react"
import { getTranscription, textToSpeech } from "../utils/voice"
import MicButton from "./MicButton"
import LanguageToggle from "./LanguageToggle"

// Utility to get or create a persistent session ID
function getOrCreateSessionId() {
  let id = localStorage.getItem("nyay_session_id")
  if (!id) {
    id = "sess-" + Date.now() + "-" + Math.random().toString(36).slice(2)
    localStorage.setItem("nyay_session_id", id)
  }
  return id
}

const Home = ({ language, setLanguage }) => {
  const [isConversationActive, setIsConversationActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversationStage, setConversationStage] = useState("idle") // idle, greeting, language-selection, chatting
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [messages, setMessages] = useState([])
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [isProcessingAPI, setIsProcessingAPI] = useState(false)

  // Session ID: only generated once per user session
  const sessionIdRef = useRef(getOrCreateSessionId())

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add message to UI conversation (NOT directly for backend history)
  const addMessage = (text, sender) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender,
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }

  // Build history with an optional pending user message
  const buildHistoryWithPending = (pendingUserText = null) => {
    let baseHistory = messages
      .filter(msg => msg.sender === "user" || msg.sender === "ai")
      .map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }))
    if (pendingUserText) {
      baseHistory.push({ role: "user", content: pendingUserText })
    }
    return baseHistory.slice(-8)
  }

  // Used to build the OpenAI-style history for API
  const getOpenAIHistory = () => {
    // Only send the last 8 exchanges (user/ai) for context
    return messages
      .filter(msg => msg.sender === "user" || msg.sender === "ai")
      .map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }))
      .slice(-8)
  }

  // Speak text, and block until speaking stops
  const speakText = async (text, lang = selectedLanguage || language) => {
    setIsSpeaking(true)
    try {
      await textToSpeech(text, lang)
      await new Promise((resolve) => {
        const checkSpeaking = () => {
          if (!window.speechSynthesis.speaking) {
            resolve()
          } else {
            setTimeout(checkSpeaking, 100)
          }
        }
        checkSpeaking()
      })
    } catch (error) {
      console.error("Speech error:", error)
    } finally {
      setIsSpeaking(false)
    }
  }

  // Get legal advice from backend, sending sessionId and history
  // Accepts an optional historyOverride for pending user input
  const getLegalAdvice = async (question, lang, historyOverride = null) => {
    setIsProcessingAPI(true)
    const session_id = sessionIdRef.current
    const history = historyOverride ?? getOpenAIHistory()
    console.log("🔥 Calling Groq API with:", { question, language: lang, session_id, history })

    try {
      const response = await fetch("http://localhost:8000/legal_advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          question: question,
          language: lang,
          session_id,
          history,
        }),
      })

      console.log("✅ API Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ API Response data:", data)

      // If the backend returns a new session_id, update localStorage (optional)
      if (data.session_id && data.session_id !== session_id) {
        sessionIdRef.current = data.session_id
        localStorage.setItem("nyay_session_id", data.session_id)
      }

      if (data.advice) {
        return data.advice
      } else {
        throw new Error("No advice received from API")
      }
    } catch (error) {
      console.error("❌ API Error:", error)
      return lang === "hi" ? `क्षमा करें, API में समस्या है: ${error.message}` : `Sorry, API error: ${error.message}`
    } finally {
      setIsProcessingAPI(false)
    }
  }

  // Start conversation (reset all state, send greeting, etc.)
  const startConversation = async () => {
    setIsConversationActive(true)
    setConversationStage("greeting")
    setMessages([])

    const greeting = "नमस्कार! मैं आपका कानूनी सहायक हूं। आप किस भाषा में बात करना चाहते हैं - हिंदी या अंग्रेजी?"
    addMessage(greeting, "ai")
    await speakText(greeting, "hi")

    setConversationStage("language-selection")
    setTimeout(() => startListening(), 1000)
  }

  // Start listening (mic) - cancel AI speech if speaking
  const startListening = async () => {
    // Interrupt AI if it's speaking!
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    if (isListening) return

    setIsListening(true)
    try {
      const recognitionLang = conversationStage === "language-selection" ? "en" : selectedLanguage || language
      const transcript = await getTranscription(recognitionLang)

      if (transcript.trim()) {
        setCurrentTranscript(transcript)
        addMessage(transcript, "user")
        await handleUserInput(transcript)
      }
    } catch (error) {
      console.error("Listening error:", error)
    } finally {
      setIsListening(false)
    }
  }

  // Handle user's input at any stage
  const handleUserInput = async (input) => {
    console.log("🎯 Handling input:", input, "Stage:", conversationStage)

    if (conversationStage === "language-selection") {
      const lowerInput = input.toLowerCase()

      // Check for English
      if (lowerInput.includes("english") || lowerInput.includes("अंग्रेजी") || lowerInput.includes("इंग्लिश")) {
        setSelectedLanguage("en")
        if (setLanguage) setLanguage("en")
        setConversationStage("chatting")

        const responseText = "Perfect! I'll help you in English. Please tell me about your legal problem."
        addMessage(responseText, "ai")
        await speakText(responseText, "en")
        setTimeout(() => startListening(), 1000)
        return
      }

      // Check for Hindi
      if (lowerInput.includes("hindi") || lowerInput.includes("हिंदी") || lowerInput.includes("हिन्दी")) {
        setSelectedLanguage("hi")
        if (setLanguage) setLanguage("hi")
        setConversationStage("chatting")

        const responseText = "बहुत अच्छा! मैं हिंदी में आपकी सहायता करूंगा। कृपया अपनी कानूनी समस्या बताएं।"
        addMessage(responseText, "ai")
        await speakText(responseText, "hi")
        setTimeout(() => startListening(), 1000)
        return
      }

      // If it's a long sentence, treat it as a legal question and auto-detect language
      if (input.length > 10) {
        const detectedLang = /[\u0900-\u097F]/.test(input) ? "hi" : "en"
        setSelectedLanguage(detectedLang)
        if (setLanguage) setLanguage(detectedLang)
        setConversationStage("chatting")

        const acknowledgment =
          detectedLang === "en"
            ? "I understand you're asking in English. Let me help you with your legal concern."
            : "मैं समझ गया कि आप हिंदी में पूछ रहे हैं। आइए आपकी कानूनी समस्या का समाधान करते हैं।"

        addMessage(acknowledgment, "ai")
        await speakText(acknowledgment, detectedLang)

        // Now process the legal question, and send context!
        console.log("🚀 Processing legal question:", input)
        // add user message above, so buildHistoryWithPending(input) includes it
        const advice = await getLegalAdvice(input, detectedLang, buildHistoryWithPending(input))
        addMessage(advice, "ai")
        await speakText(advice, detectedLang)
        setTimeout(() => startListening(), 1000)
        return
      }

      // If nothing detected, ask again
      const responseText = "कृपया स्पष्ट रूप से 'हिंदी' या 'English' कहें।"
      addMessage(responseText, "ai")
      await speakText(responseText, "hi")
      setTimeout(() => startListening(), 1500)
    } else if (conversationStage === "chatting") {
      // This is the main legal question handling
      console.log("🚀 Processing legal question in chatting stage:", input)
      console.log("🌐 Selected language:", selectedLanguage)

      // Show processing message
      addMessage("आपके सवाल का जवाब ढूंढ रहा हूं...", "ai")

      // Get legal advice from API with context (including pending user input)
      const advice = await getLegalAdvice(input, selectedLanguage, buildHistoryWithPending(input))

      // Remove processing message and add actual advice
      setMessages((prev) => prev.slice(0, -1))
      addMessage(advice, "ai")
      await speakText(advice, selectedLanguage)

      // Continue listening for more questions
      setTimeout(() => startListening(), 1000)
    }
  }

  const endConversation = () => {
    setIsConversationActive(false)
    setIsListening(false)
    setIsSpeaking(false)
    setConversationStage("idle")
    setSelectedLanguage("")
    setCurrentTranscript("")
    setIsProcessingAPI(false)
    window.speechSynthesis.cancel()

    const endMessage = selectedLanguage === "hi" ? "धन्यवाद! आपका दिन शुभ हो।" : "Thank you! Have a great day."
    addMessage(endMessage, "ai")
  }

  // Mic Button logic: Always interrupt AI speech and (re)start listening!
  const handleMicClick = () => {
    // Interrupt AI speech always
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsListening(false) // stop if already listening

    if (!isConversationActive) {
      startConversation()
    } else {
      startListening()      // always (re)start listening!
    }
  }

  // Quick language selection
  const selectLanguageDirectly = async (lang) => {
    if (conversationStage === "language-selection") {
      setSelectedLanguage(lang)
      if (setLanguage) setLanguage(lang)
      setConversationStage("chatting")

      const responseText =
        lang === "en"
          ? "Great! I'll help you in English. Please tell me about your legal problem."
          : "बहुत अच्छा! मैं हिंदी में आपकी सहायता करूंगा। कृपया अपनी कानूनी समस्या बताएं।"

      addMessage(responseText, "ai")
      await speakText(responseText, lang)
      setTimeout(() => startListening(), 1000)
    }
  }

  return (
    <div className="home-container">
      {/* Language Toggle */}
      <div className="language-section">
        <LanguageToggle language={language} setLanguage={setLanguage} />
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="hero-section">
          <h1 className="hero-title">{language === "hi" ? "अपनी समस्या बोलें" : "Speak Your Problem"}</h1>

          {selectedLanguage && (
            <div className="selected-lang-indicator">
              {selectedLanguage === "hi" ? "हिंदी में बात कर रहे हैं" : "Speaking in English"}
            </div>
          )}

          {conversationStage === "language-selection" && (
            <div className="language-help">
              <p>🗣️ Say "English" or "हिंदी" clearly</p>
              <p>Or just ask your legal question directly!</p>

              <div className="quick-lang-buttons">
                <button className="quick-lang-btn" onClick={() => selectLanguageDirectly("en")}>
                  English
                </button>
                <button className="quick-lang-btn" onClick={() => selectLanguageDirectly("hi")}>
                  हिंदी
                </button>
              </div>
            </div>
          )}

          {conversationStage === "chatting" && (
            <div className="chat-help">
              <p>💬 अब आप अपनी कानूनी समस्या पूछ सकते हैं</p>
              <p>💬 Now you can ask your legal questions</p>
            </div>
          )}

          {isProcessingAPI && (
            <div className="api-status">
              <p>🔄 Groq AI से जवाब ला रहा हूं...</p>
            </div>
          )}
        </div>

        {/* Voice Conversation Area */}
        {isConversationActive && (
          <div className="conversation-area">
            <div className="messages-container">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}-message`}>
                  <div className="message-bubble">
                    <p>{message.text}</p>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Mic Button */}
        <div className="mic-section">
          <MicButton
            onClick={handleMicClick}
            listening={isListening}
            speaking={isSpeaking}
            active={isConversationActive}
          />

          {currentTranscript && (
            <div className="transcript-display">
              <p>"{currentTranscript}"</p>
            </div>
          )}

          {isConversationActive && (
            <button className="end-conversation-btn" onClick={endConversation}>
              {language === "hi" ? "बातचीत समाप्त करें" : "End Conversation"}
            </button>
          )}
        </div>

        {/* Status Display */}
        <div className="status-section">
          {isSpeaking && (
            <div className="status-indicator speaking">
              {language === "hi" ? "AI बोल रहा है..." : "AI is speaking..."}
            </div>
          )}
          {isListening && (
            <div className="status-indicator listening">
              {conversationStage === "language-selection" ? "भाषा सुन रहा हूं..." : "आपकी समस्या सुन रहा हूं..."}
            </div>
          )}
          {isProcessingAPI && <div className="status-indicator processing">🤖 Groq AI Processing...</div>}
          {!isConversationActive && (
            <div className="status-indicator ready">
              {language === "hi" ? "माइक दबाएं और बात करना शुरू करें" : "Press mic to start conversation"}
            </div>
          )}
        </div>

        {/* Debug Info */}
        {conversationStage !== "idle" && (
          <div className="debug-info">
            <p>
              Stage: {conversationStage} | Language: {selectedLanguage || "Not selected"}
            </p>
          </div>
        )}

        {/* Other Features */}
        {!isConversationActive && (
          <div className="other-features">
            {/* <button className="feature-btn">
              {language === "hi" ? "WhatsApp Forward चेक करें" : "Check WhatsApp Forward"}
            </button>
            <button className="feature-btn">{language === "hi" ? "RTI/FIR फॉर्म भरें" : "Auto-fill RTI/FIR Form"}</button> */}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home