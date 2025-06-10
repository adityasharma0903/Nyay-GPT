"use client"

import { useState, useEffect, useRef } from "react"
import { getTranscription, textToSpeech } from "../utils/voice"

const VoiceConversation = ({ language, setLanguage }) => {
  const [isConversationActive, setIsConversationActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messages, setMessages] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState(language)

  const messagesEndRef = useRef(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add a message to the conversation
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

  // Handle speaking text with visual feedback
  const speakText = async (text, lang = selectedLanguage) => {
    setIsSpeaking(true)
    try {
      await textToSpeech(text, lang)
      // Wait for speech to complete
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

  // Get legal advice from API
  const getLegalAdvice = async (question, lang) => {
    try {
      const response = await fetch("http://localhost:8000/legal_advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          language: lang,
        }),
      })

      const data = await response.json()
      return data.advice || "I apologize, but I could not process your request at the moment."
    } catch (error) {
      console.error("API Error:", error)
      return "I apologize, but there seems to be a connection issue. Please try again."
    }
  }

  // Start the conversation
  const startConversation = async () => {
    setIsConversationActive(true)
    setMessages([])

    // Initial greeting
    const greetingText =
      "Good morning! How can I help you? In which language would you like to continue - English or Hindi?"
    addMessage(greetingText, "ai")
    await speakText(greetingText, "en")

    startListening()
  }

  // Start listening for user input
  const startListening = async () => {
    if (isListening || isSpeaking) return

    setIsListening(true)
    try {
      const transcript = await getTranscription(selectedLanguage)
      if (transcript.trim()) {
        addMessage(transcript, "user")
        await handleUserInput(transcript)
      }
    } catch (error) {
      console.error("Listening error:", error)
    } finally {
      setIsListening(false)
    }
  }

  // Process user input
  const handleUserInput = async (input) => {
    setIsProcessing(true)

    try {
      const lowerInput = input.toLowerCase()

      // Check if this is language selection
      if (!selectedLanguage || selectedLanguage === language) {
        let detectedLang = ""
        let responseText = ""

        if (lowerInput.includes("english") || lowerInput.includes("अंग्रेजी")) {
          detectedLang = "en"
          responseText = "Great! I'll continue in English. Please tell me about your legal concern or question."
        } else if (lowerInput.includes("hindi") || lowerInput.includes("हिंदी")) {
          detectedLang = "hi"
          responseText = "बहुत अच्छा! मैं हिंदी में आगे बढ़ूंगा। कृपया अपनी कानूनी समस्या या प्रश्न बताएं।"
        } else {
          // If language not detected, ask again
          responseText = "I didn't understand. Please say 'English' or 'Hindi' to select your preferred language."
          addMessage(responseText, "ai")
          await speakText(responseText, "en")
          setIsProcessing(false)
          setTimeout(startListening, 1000)
          return
        }

        // Update language
        setSelectedLanguage(detectedLang)
        if (setLanguage) setLanguage(detectedLang)

        addMessage(responseText, "ai")
        await speakText(responseText, detectedLang)
      } else {
        // This is a legal question
        const advice = await getLegalAdvice(input, selectedLanguage)
        addMessage(advice, "ai")
        await speakText(advice, selectedLanguage)
      }

      // Continue listening
      setTimeout(startListening, 1000)
    } catch (error) {
      console.error("Error handling input:", error)
      const errorMsg =
        selectedLanguage === "hi"
          ? "क्षमा करें, कुछ त्रुटि हुई है। कृपया दोबारा कोशिश करें।"
          : "I'm sorry, there was an error. Please try again."
      addMessage(errorMsg, "ai")
      await speakText(errorMsg, selectedLanguage)
      setTimeout(startListening, 1000)
    } finally {
      setIsProcessing(false)
    }
  }

  // End the conversation
  const endConversation = () => {
    setIsConversationActive(false)
    setIsListening(false)
    setIsSpeaking(false)
    setIsProcessing(false)

    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    const endMessage =
      selectedLanguage === "hi"
        ? "धन्यवाद! आपका दिन शुभ हो।"
        : "Thank you for using our legal assistance service. Have a great day!"
    addMessage(endMessage, "ai")
  }

  return (
    <div className="voice-conversation-container">
      <div className="conversation-header">
        <h2>Legal Voice Assistant</h2>
        {selectedLanguage && (
          <span className="selected-language">{selectedLanguage === "en" ? "English" : "हिंदी"}</span>
        )}
      </div>

      {!isConversationActive ? (
        <div className="start-conversation">
          <button className="start-btn" onClick={startConversation}>
            <span className="mic-icon">🎤</span>
            Start Voice Conversation
          </button>
          <p className="instruction-text">Click to start a voice conversation with our legal assistant</p>
        </div>
      ) : (
        <div className="active-conversation">
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}-message`}>
                <div className="message-content">
                  <span className="message-text">{message.text}</span>
                  <span className="message-time">{message.timestamp}</span>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="message ai-message">
                <div className="message-content">
                  <span className="processing-indicator">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="conversation-controls">
            <button
              className={`mic-button ${isListening ? "listening" : ""}`}
              onClick={startListening}
              disabled={isListening || isSpeaking || isProcessing}
            >
              {isListening ? "Listening..." : "Speak"}
            </button>

            <button className="end-conversation-btn" onClick={endConversation}>
              End Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceConversation
