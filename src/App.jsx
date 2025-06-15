"use client"

import { useEffect, useRef, useState } from "react"
import "./AppUI.css"

// Supported Languages & Greetings
const languages = {
  english: { code: "en-IN", greeting: "Hello! I'm Nyay GPT — your AI legal assistant. Feel free to ask me any legal question." },
  hindi: { code: "hi-IN", greeting: "नमस्ते! मैं न्याय GPT हूँ। आप मुझसे कोई भी कानूनी सवाल पूछ सकते हैं।" },
  punjabi: { code: "pa-IN", greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਨਿਆਂ GPT ਹਾਂ। ਤੁਸੀਂ ਮੈਨੂੰ ਕੋਈ ਵੀ ਕਾਨੂੰਨੀ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ।" },
  tamil: { code: "ta-IN", greeting: "வணக்கம்! நான் நியாய GPT. நீங்கள் என்னிடம் எந்தவொரு சட்டக் கேள்வியையும் கேட்கலாம்." },
  marathi: { code: "mr-IN", greeting: "नमस्कार! मी न्याय GPT आहे. तुम्ही मला कोणताही कायदेशीर प्रश्न विचारू शकता." },
  telugu: { code: "te-IN", greeting: "నమస్తే! నేను న్యాయ GPT. మీరు నన్ను ఎలాంటి చట్ట సంబంధిత ప్రశ్నలు అడగవచ్చు." },
  bengali: { code: "bn-IN", greeting: "নমস্কার! আমি ন্যায় GPT। আপনি আমাকে যেকোনো আইনি প্রশ্ন করতে পারেন।" },
  kannada: { code: "kn-IN", greeting: "ನಮಸ್ಕಾರ! ನಾನು ನ್ಯಾಯ GPT. ನೀವು ನನಗೆ ಯಾವುದೇ ಕಾನೂನು ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು." },
  malayalam: { code: "ml-IN", greeting: "നമസ്കാരം! ഞാൻ ന്യായ GPT. നിങ്ങൾക്ക് എനിക്ക് നിയമപരമായ ചോദ്യങ്ങൾ ചോദിക്കാം." },
  gujarati: { code: "gu-IN", greeting: "નમસ્તે! હું ન્યાય GPT છું. તમે મને કોઈ પણ કાનૂની પ્રશ્ન પૂછો." },
  urdu: { code: "ur-IN", greeting: "السلام علیکم! میں نیاۓ GPT ہوں، آپ مجھ سے کوئی بھی قانونی سوال پوچھ سکتے ہیں۔" },
  odia: { code: "or-IN", greeting: "ନମସ୍କାର! ମୁଁ ନ୍ୟାୟ GPT। ଆପଣ ମୋତେ କୌଣସି ଆଇନିକ ପ୍ରଶ୍ନ ପଚାରିପାରିବେ।" },
}

const languageKeywords = {
  english: ["english", "इंग्लिश", "अंग्रेजी"],
  hindi: ["hindi", "हिंदी"],
  punjabi: ["punjabi", "ਪੰਜਾਬੀ", "पंजाबी"],
  tamil: ["tamil", "तमिल"],
  marathi: ["marathi", "मराठी"],
  telugu: ["telugu", "तेलुगू"],
  bengali: ["bengali", "বেঙ্গলি", "বাঙালি", "बंगाली"],
  kannada: ["kannada", "ಕನ್ನಡ", "कन्नड़", "कನ್ನಡ"],
  malayalam: ["malayalam", "മലയാളം", "मलयालम"],
  gujarati: ["gujarati", "ગુજરાતી", "गुजराती"],
  urdu: ["urdu", "اردو", "उर्दू"],
  odia: ["odia", "odiya", "ଓଡ଼ିଆ", "ओड़िया"],
}

const initialGreeting = "आप कानूनी सहायता तक पहुँच चुके हैं। आपकी बेहतर मदद के लिए कृपया बताएं आपकी पसंदीदा भाषा क्या है? For example: Hindi, English, Gujrati.       You have accessed legal aid , for your better help , please tell us your preferred language for example english , hindi , gujrati"

const languageGreetings = {
  hindi: "नमस्ते जी, मैं नव्या swaraj ai से आपकी लीगल एजेंट। आपकी बेहतर सहायता के लिए, क्या आप बता सकते हैं आपको किस प्रकार की कानूनी सहायता चाहिए या क्या आप इमरजेंसी में हैं?",
  english: "Hello! I am Navya, your legal agent. For better assistance, can you tell me what help you need or if you are in an emergency?",
  punjabi: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ, ਮੈਂ ਨਵਿਆ, ਤੁਹਾਡੀ ਲੀਗਲ ਏਜੰਟ ਹਾਂ। ਤੁਹਾਡੀ ਬਿਹਤਰ ਮਦਦ ਲਈ, ਕੀ ਤੁਸੀਂ ਦੱਸ ਸਕਦੇ ਹੋ ਕਿ ਤੁਹਾਨੂੰ ਕਿਸ ਕਿਸਮ ਦੀ ਕਾਨੂੰਨੀ ਮਦਦ ਚਾਹੀਦੀ ਹੈ ਜਾਂ ਤੁਸੀਂ ਐਮਰਜੈਂਸੀ ਵਿੱਚ ਹੋ?",
  tamil: "வணக்கம், நான் நவ்யா, உங்கள் சட்ட உதவியாளர். சிறந்த உதவிக்காக, நீங்கள் என்ன உதவி தேவை என்று அல்லது அவசர நிலைமையில் உள்ளீர்களா என்று சொல்ல முடியுமா?",
  marathi: "नमस्कार, मी नव्या, तुमची लीगल एजंट. तुमच्या उत्तम मदतीसाठी, कृपया सांगा तुम्हाला कोणत्या प्रकारची कायदेशीर मदत हवी आहे किंवा तुम्ही आणीबाणी स्थितीत आहात का?",
  telugu: "నమస్తే, నేను నవ్యా, మీ లీగల్ ఏజెంట్. మీకు మెరుగైన సహాయం అందించేందుకు, మీరు ఏ విధమైన చట్ట సహాయం కావాలో లేదా మీరు ఎమర్జెన్సీలో ఉన్నారా అని చెప్పగలరా?",
  bengali: "নমস্কার, আমি নব্যা, আপনার লিগ্যাল এজেন্ট। আপনার আরও ভাল সহায়তার জন্য, দয়া করে বলুন আপনি কী ধরনের আইনি সহায়তা চান বা আপনি জরুরি অবস্থায় রয়েছেন কিনা।",
  kannada: "ನಮಸ್ಕಾರ, ನಾನು ನವ್ಯಾ, ನಿಮ್ಮ ಲೀಗಲ್ ಏಜೆಂಟ್. ಉತ್ತಮ ಸಹಾಯಕ್ಕಾಗಿ, ನಿಮಗೆ ಯಾವ ರೀತಿಯ ಕಾನೂನು ಸಹಾಯ ಬೇಕು ಅಥವಾ ನೀವು ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಇದ್ದೀರಾ ಎಂಬುದನ್ನು ಹೇಳಿ.",
  malayalam: "നമസ്കാരം, ഞാൻ നവ്യ, നിങ്ങളുടെ ലീഗൽ ഏജന്റ്. മികച്ച സഹായത്തിനായി, നിങ്ങൾക്ക് എന്ത് തരത്തിലുള്ള നിയമ സഹായം വേണമെന്ന് അല്ലെങ്കിൽ നിങ്ങൾ അടിയന്തരാവസ്ഥയിലാണോ എന്ന് പറയാമോ?",
  gujarati: "નમસ્તે, હું નવ્યા, તમારી લીગલ એજન્ટ છું. તમારી વધુ સારી મદદ માટે, કૃપા કરીને કહો તમને કઈ પ્રકારની કાનૂની મદદ જોઈએ છે અથવા તમે ઇમરજન્સી માં છો?",
  urdu: "السلام علیکم، میں نویا، آپ کی قانونی ایجنٹ ہوں۔ آپ کی بہتر مدد کے لیے، کیا آپ بتا سکتے ہیں آپ کو کس چیز کی قانونی مدد چاہیے یا آپ ایمرجنسی میں ہیں؟",
  odia: "ନମସ୍କାର, ମୁଁ ନବ୍ୟା, ଆପଣଙ୍କର ଲିଗାଲ୍ ଏଜେଣ୍ଟ। ଆପଣଙ୍କୁ ଭଲ ସହଯୋଗ ଦେବା ପାଇଁ, ଦୟାକରି କହନ୍ତୁ ଆପଣ କେଉଁ ପ୍ରକାରର ଆଇନିକ ସହଯୋଗ ଚାହାଁନ୍ତି କିମ୍ବା ଆପଣ ଆପାତ୍କାଳୀନ ସ୍ଥିତିରେ ଅଛନ୍ତି କି?",
}

export default function App() {
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const apiCallInProgressRef = useRef(false)

  const [connected, setConnected] = useState(false)
  const [muted, setMuted] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [timer, setTimer] = useState(0)
  const [currentLang, setCurrentLang] = useState("")
  const [langSelected, setLangSelected] = useState(false)
  const [recognitionKey, setRecognitionKey] = useState(0)
  const [history, setHistory] = useState([])
  const [policeStations, setPoliceStations] = useState([])
  const [userPos, setUserPos] = useState(null)
  const [showStations, setShowStations] = useState(false)
  const [selectedStation, setSelectedStation] = useState(null)
  const [phase, setPhase] = useState("init") // "init", "askLang", "normal"

  const timerRef = useRef(null)
  const utteranceIdRef = useRef(0)

  // API key from vite .env file
  const MAPS_EMBED_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // MAIN SEAMLESS VOICE EFFECT
  useEffect(() => {
    if (!connected) return
    // Only run the effect when the assistant is not speaking and not muted
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
      setTimeout(() => setUserSpeaking(false), 1200)
      recognition.stop() // Stop listening as soon as we get input

      utteranceIdRef.current += 1
      const thisUtterance = utteranceIdRef.current
      const userSpeech = event.results[event.results.length - 1][0].transcript.toLowerCase().trim()

      if (phase === "askLang") {
        let detectedLang = null
        Object.keys(languageKeywords).forEach((lang) => {
          languageKeywords[lang].forEach((keyword) => {
            if (userSpeech.includes(keyword)) {
              detectedLang = lang
            }
          })
        })
        if (detectedLang) {
          setCurrentLang(detectedLang)
          setLangSelected(true)
          setRecognitionKey((k) => k + 1)
          setHistory([])
          setPhase("normal") // Now ready for main conversation
          await speakText(languageGreetings[detectedLang], detectedLang)
          return
        } else {
          await speakText("कृपया अपनी पसंदीदा भाषा का नाम दोबारा बताएं। For example: Hindi, English, Tamil, etc.", "hindi")
          setRecognitionKey((k) => k + 1) // Force restart recognition after TTS
          return
        }
      }

      // Normal phase - with API call protection
      if (phase === "normal" && !apiCallInProgressRef.current) {
        apiCallInProgressRef.current = true // Set flag to prevent multiple calls
        setSpeaking(true)
        const newHistory = [...history, { role: "user", content: userSpeech }]
        setHistory(newHistory)
        try {
          const res = await fetch("http://localhost:3000/ask-context", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              history: newHistory,
              language: currentLang,
            }),
          })
          if (!res.ok) throw new Error(`Server responded with ${res.status}`)
          const data = await res.json()
          if (utteranceIdRef.current === thisUtterance && apiCallInProgressRef.current) {
            setHistory((h) => [...h, { role: "assistant", content: data.reply }])
            await speakText(data.reply, currentLang)
            setRecognitionKey((k) => k + 1) // Restart recognition after TTS
          }
        } catch (err) {
          console.error("API Error:", err)
          setSpeaking(false)
          setRecognitionKey((k) => k + 1)
        } finally {
          apiCallInProgressRef.current = false // Always reset the flag
        }
      }
    }

    recognition.onend = () => {
      if (connected && !muted && !stoppedByApp && !speaking) {
        try {
          recognition.start()
        } catch (e) {}
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch (e) {}

    return () => {
      stoppedByApp = true
      recognition.stop()
    }
  // Include recognitionKey and speaking in deps so we restart after TTS
  }, [connected, muted, recognitionKey, speaking, phase, currentLang])

  useEffect(() => {
    if (connected) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
    } else {
      setTimer(0)
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [connected])

  const handleMute = () => {
    setMuted((m) => !m)
    if (!muted) {
      recognitionRef.current?.stop()
      // Stop any current audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      setSpeaking(false)
    } else {
      setRecognitionKey((k) => k + 1)
    }
  }

  const handleEnd = () => {
    setConnected(false)
    setMuted(false)
    setLangSelected(false)
    setCurrentLang("")
    setHistory([])
    setPoliceStations([])
    setUserPos(null)
    setShowStations(false)
    setSelectedStation(null)
    setPhase("init")
    recognitionRef.current?.stop()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }
    setSpeaking(false)
    apiCallInProgressRef.current = false // Reset API call flag
  }

  // The new, robust speakText function
  const speakText = async (text, langKey = currentLang || "hindi") => {
    // STOP RECOGNITION FIRST (prevents loops)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }

    // STOP ANY CURRENT AUDIO
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }

    setSpeaking(true)

    try {
      const res = await fetch("http://localhost:3000/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: langKey }),
      })
      const blob = await res.blob()
      const audioUrl = URL.createObjectURL(blob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setSpeaking(false)
        // Recognition will restart via useEffect (speaking now false)
      }
      audio.onerror = () => {
        setSpeaking(false)
      }
      await audio.play()
    } catch (error) {
      setSpeaking(false)
    }
  }

  const handleConnect = async () => {
    setConnected(true)
    setMuted(false)
    setLangSelected(false)
    setCurrentLang("")
    setRecognitionKey((k) => k + 1)
    setHistory([])
    setPoliceStations([])
    setUserPos(null)
    setSelectedStation(null)
    setPhase("askLang")
    await speakText(initialGreeting, "hindi")
    setRecognitionKey((k) => k + 1) // Ensure recognition is ready after TTS
  }

  const handleNearbyPolice = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setUserPos({ lat: latitude, lng: longitude })
        try {
          const res = await fetch(`http://localhost:3000/nearby-police?lat=${latitude}&lng=${longitude}`)
          const data = await res.json()
          setPoliceStations(data.stations || [])
          setShowStations(true)
          setSelectedStation(null)
        } catch (e) {
          alert("Failed to fetch police stations.")
        }
      },
      (err) => {
        alert("Location permission denied or unavailable")
      },
    )
  }

  const formatTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`

  return (
    <div className="ai-agent-ui-container premium-bg">
      <div className="ai-status-bar">
        <span>{formatTime(timer)} • Voice</span>
        <div className="ai-status-icons">
          <span className="ai-status-icon" />
          <span className="ai-status-icon" />
          <span className="ai-status-battery" />
        </div>
      </div>
      <div className="ai-avatar-ui-premium">
        <span>AI</span>
      </div>
      <div className="ai-agent-title-premium">Navya Legal Agent</div>
      <div className="ai-agent-subtitle-premium">{connected ? "Connected" : "Tap to connect"}</div>
      {connected && (
        <div className={`ai-agent-waves${(speaking || userSpeaking) && !muted ? " speaking" : ""}`}>
          {[...Array(10)].map((_, i) => (
            <div className="ai-wave-bar" key={i} />
          ))}
        </div>
      )}

      {!connected ? (
        <div className="ai-start-btn-row">
          <button className="ai-premium-call-btn" onClick={handleConnect}>
            <span className="ai-call-icon" />
          </button>
          <button className="ai-nearby-btn" onClick={handleNearbyPolice}>
            <span className="ai-location-icon" />
            <div>Nearby Police</div>
          </button>
        </div>
      ) : (
        <div className="ai-agent-btn-row-premium">
          <button className={`ai-mute-btn${muted ? " muted" : ""}`} onClick={handleMute}>
            <span className={`ai-mic-icon${muted ? " off" : ""}`} />
            <div>Mute</div>
          </button>
          <button className="ai-nearby-btn" onClick={handleNearbyPolice}>
            <span className="ai-location-icon" />
            <div>Nearby Police</div>
          </button>
          <button className="ai-end-btn" onClick={handleEnd}>
            <span className="ai-end-icon" />
            <div>End</div>
          </button>
        </div>
      )}

      {/* ---- MODAL for police stations ---- */}
      {showStations && (
        <div className="stations-modal-bg" onClick={() => { setShowStations(false); setSelectedStation(null) }}>
          <div className="stations-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => { setShowStations(false); setSelectedStation(null) }} aria-label="Close">
              &times;
            </button>
            <h3>Nearby Police Stations</h3>
            {policeStations.length ? (
              <ul>
                {policeStations.map((s, i) => (
                  <li key={i} style={{ cursor: "pointer" }} onClick={() => setSelectedStation(s)} title="Show directions on map">
                    <b>{s.name}</b>
                    <span>{s.vicinity}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div>No nearby police stations found.</div>
            )}
          </div>
        </div>
      )}

      {/* ---- DIRECTIONS MAP MODAL ---- */}
      {selectedStation && userPos && (
        <div className="directions-modal-bg" onClick={() => setSelectedStation(null)}>
          <div className="directions-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedStation(null)} aria-label="Close">
              &times;
            </button>
            <h3>
              Directions to <span style={{ color: "#29489c" }}>{selectedStation.name}</span>
            </h3>
            <iframe
              width="100%"
              height="380"
              frameBorder="0"
              style={{ border: 0, borderRadius: "12px" }}
              allowFullScreen
              loading="lazy"
              src={
                MAPS_EMBED_API_KEY
                  ? `https://www.google.com/maps/embed/v1/directions?key=${MAPS_EMBED_API_KEY}` +
                    `&origin=${userPos.lat},${userPos.lng}` +
                    `&destination=${selectedStation.lat},${selectedStation.lng}` +
                    `&mode=driving`
                  : undefined
              }
              title="Directions Map"
            />
            {!MAPS_EMBED_API_KEY && (
              <div style={{ color: "red", marginTop: 16 }}>
                API Key missing. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}