import React, { useRef, useState, useEffect } from "react"

function getOrCreateSessionId() {
  let id = localStorage.getItem("nyay_session_id")
  if (!id) {
    id = "sess-" + Date.now() + "-" + Math.random().toString(36).slice(2)
    localStorage.setItem("nyay_session_id", id)
  }
  return id
}

export default function VoiceChat() {
  const [listening, setListening] = useState(false)
  const [language, setLanguage] = useState(null)
  const [aiReply, setAiReply] = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const sessionIdRef = useRef(getOrCreateSessionId()) // persisted for whole session
  const recognitionRef = useRef(null)

  // Ensure session ID stays constant
  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId()
  }, [])

  // Speak out text, interrupt recognition if needed
  const speak = (text, lang) => {
    if (!window.speechSynthesis) return
    const utter = new window.SpeechSynthesisUtterance(text)
    utter.lang = lang === "hi" ? "hi-IN" : "en-US"
    utter.onstart = () => {
      if (recognitionRef.current) recognitionRef.current.stop()
    }
    utter.onend = () => {
      if (listening && recognitionRef.current) recognitionRef.current.start()
    }
    window.speechSynthesis.speak(utter)
  }

  // Start new conversation
  const startConversation = async () => {
    setLanguage(null)
    setAiReply("")
    setChatHistory([])

    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.")
      return
    }

    // Blank question for greeting
    const resp = await fetch("/legal_advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "",
        session_id: sessionIdRef.current,
        history: [],
      }),
    })
    const data = await resp.json()
    setAiReply(data.advice)
    speak(data.advice, "en")
    setChatHistory([])
    startListening()
  }

  // Start mic/recognition, always interrupt AI speech
  const startListening = (history = chatHistory) => {
    // Interrupt AI speech if any
    window.speechSynthesis.cancel()

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = language === "hi" ? "hi-IN" : "en-US"
    recognition.continuous = true
    recognition.interimResults = false
    recognitionRef.current = recognition

    recognition.onstart = () => {
      window.speechSynthesis.cancel() // cancel AI speech as soon as user starts speaking
    }

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim()
      if (!transcript) return

      // Language selection
      if (
        !language &&
        (transcript.toLowerCase().includes("hindi") ||
          transcript.toLowerCase().includes("हिंदी"))
      ) {
        setLanguage("hi")
        setAiReply("आपने हिंदी चुनी है। अब आप हिंदी में पूछ सकते हैं।")
        speak("आपने हिंदी चुनी है। अब आप हिंदी में पूछ सकते हैं।", "hi")
        return
      }
      if (!language && transcript.toLowerCase().includes("english")) {
        setLanguage("en")
        setAiReply("You chose English. Please continue your queries in English.")
        speak("You chose English. Please continue your queries in English.", "en")
        return
      }

      // Build new chat history
      const newHistory = [
        ...chatHistory,
        { role: "user", content: transcript },
      ]

      // Send request with context
      const resp = await fetch("/legal_advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: transcript,
          language: language,
          session_id: sessionIdRef.current,
          history: newHistory.slice(-8), // last 8 messages for context
        }),
      })
      const data = await resp.json()

      // Add assistant's reply to history
      const updatedHistory = [
        ...newHistory,
        { role: "assistant", content: data.advice },
      ]
      setChatHistory(updatedHistory)
      setAiReply(data.advice)
      speak(data.advice, language || "en")
    }

    recognition.onend = () => {
      if (listening && recognitionRef.current) recognitionRef.current.start()
    }

    recognition.start()
    setListening(true)
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setListening(false)
    setAiReply("Mic is OFF.")
  }

  return (
    <div>
      <button
        onClick={listening ? stopListening : startConversation}
        style={{ padding: "10px 20px", fontSize: "18px", margin: "10px" }}
      >
        {listening ? "Stop Mic" : "Start Conversation"}
      </button>
      <p style={{ fontWeight: "bold" }}>{aiReply}</p>
      <p>{listening ? "Mic is ON. Speak now..." : "Mic is OFF."}</p>
      {language && (
        <small>Language: {language === "hi" ? "हिंदी" : "English"}</small>
      )}
    </div>
  )
}