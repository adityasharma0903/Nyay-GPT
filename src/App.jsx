"use client"

import { useEffect, useRef, useState } from "react"
import { FaMicrophone, FaMicrophoneSlash, FaMapMarkerAlt, FaPhone, FaTimes, FaVolumeUp } from "react-icons/fa"

const backendBaseUrl =
  window.location.hostname === "localhost" ? "http://localhost:3000" : "https://nyay-gpt.onrender.com"

// Supported Languages & Greetings
const languages = {
  english: {
    code: "en-IN",
    greeting: "Hello! I'm Nyay GPT — your AI legal assistant. Feel free to ask me any legal question.",
  },
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
  kannada: ["kannada", "ಕನ್ನಡ", "कन्नड़", "ಕನ್ನಡ"],
  malayalam: ["malayalam", "മലയാളം", "मलयालम"],
  gujarati: ["gujarati", "ગુજરાતી", "गुजराती"],
  urdu: ["urdu", "اردو", "उर्दू"],
  odia: ["odia", "odiya", "ଓଡ଼ିଆ", "ओड़िया"],
}

const initialGreeting =
  "आप कानूनी सहायता तक पहुँच चुके हैं। आपकी बेहतर मदद के लिए कृपया बताएं आपकी पसंदीदा भाषा क्या है? For example: Hindi, English, Gujrati.       You have accessed legal aid , for your better help , please tell us your preferred language for example english , hindi , gujrati"

const languageGreetings = {
  hindi:
    "नमस्ते जी, मैं नव्या swaraj ai से आपकी लीगल एजेंट। आपकी बेहतर सहायता के लिए, क्या आप बता सकते हैं आपको किस प्रकार की कानूनी सहायता चाहिए या क्या आप इमरजेंसी में हैं?",
  english:
    "Hello! I am Navya, your legal agent. For better assistance, can you tell me what help you need or if you are in an emergency?",
  punjabi:
    "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ, ਮੈਂ ਨਵਿਆ, ਤੁਹਾਡੀ ਲੀਗਲ ਏਜੰਟ ਹਾਂ। ਤੁਹਾਡੀ ਬਿਹਤਰ ਮਦਦ ਲਈ, ਕੀ ਤੁਸੀਂ ਦੱਸ ਸਕਦੇ ਹੋ ਕਿ ਤੁਹਾਨੂੰ ਕਿਸ ਕਿਸਮ ਦੀ ਕਾਨੂੰਨੀ ਮਦਦ ਚਾਹੀਦੀ ਹੈ ਜਾਂ ਤੁਸੀਂ ਐਮਰਜੈਂਸੀ ਵਿੱਚ ਹੋ?",
  tamil:
    "வணக்கம், நான் நவ்யா, உங்கள் சட்ட உதவியாளர். சிறந்த உதவிக்காக, நீங்கள் என்ன உதவி தேவை என்று அல்லது அவசர நிலைமையில் உள்ளீர்களா என்று சொல்ல முடியுமா?",
  marathi:
    "नमस्कार, मी नव्या, तुमची लीगल एजंट. तुमच्या उत्तम मदतीसाठी, कृपया सांगा तुम्हाला कोणत्या प्रकारची कायदेशीर मदत हवी आहे किंवा तुम्ही आणीबाणी स्थितीत आहात का?",
  telugu:
    "నమస్తే, నేను నవ్యా, మీ లీగల్ ఏజెంట్. మీకు మెరుగైన సహాయం అందించేందుకు, మీరు ఏ విధమైన చట్ట సహాయం కావాలో లేదా మీరు ఎమర్జెన్సీలో ఉన్నారా అని చెప్పగలరా?",
  bengali:
    "নমস্কার, আমি নব্যা, আপনার লিগ্যাল এজেন্ট। আপনার আরও ভাল সহায়তার জন্য, দয়া করে বলুন আপনি কী ধরনের আইনি সহায়তা চান বা আপনি জরুরি অবস্থায় রয়েছেন কিনা।",
  kannada:
    "ನಮಸ್ಕಾರ, ನಾನು ನವ್ಯಾ, ನಿಮ್ಮ ಲೀಗಲ್ ಏಜೆಂಟ್. ಉತ್ತಮ ಸಹಾಯಕ್ಕಾಗಿ, ನಿಮಗೆ ಯಾವ ರೀತಿಯ ಕಾನೂನು ಸಹಾಯ ಬೇಕು ಅಥವಾ ನೀವು ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಇದ್ದೀರಾ ಎಂಬುದನ್ನು ಹೇಳಿ.",
  malayalam:
    "നമസ്കാരം, ഞാൻ നവ്യ, നിങ്ങളുടെ ലീഗൽ ഏജന്റ്. മികച്ച സഹായത്തിനായി, നിങ്ങൾക്ക് എന്ത് തരത്തിലുള്ള നിയമ സഹായം വേണമെന്ന് അല്ലെങ്കിൽ നിങ്ങൾ അടിയന്തരാവസ്���യിലാണോ എന്ന് പറയാമോ?",
  gujarati:
    "નમસ્તે, હું નવ્યા, તમારી લીગલ એજન્ટ છું. તમારી વધુ સારી મદદ માટે, કૃપા કરીને કહો તમને કઈ પ્રકારની કાનૂની મદદ જોઈએ છે અથવા તમે ઇમરજન્સી માં છો?",
  urdu: "السلام علیکم، میں نویا، آپ کی قانونی ایجنٹ ہوں۔ آپ کی بہتر مدد کے لیے، کیا آپ بتا سکتے ہیں آپ کو کس چیز की قانونی مدد चاहिए یا آپ ایمرجینسی میں ہیں؟",
  odia: "ନମସ୍କାର, ମୁଁ ନବ୍ୟା, ଆପଣଙ୍କର ଲିଗାଲ୍ ଏଜେଣ୍ଟ। ଆପଣଙ୍କୁ ଭଲ ସହଯୋଗ ଦେବା ପାଇଁ, ଦୟାକରି କହନ୍ତୁ ଆପଣ କେଉଁ ପ୍ରକାରର ଆଇନିକ ସହଯୋଗ ଚାହାଁନ୍ତି କିମ୍ବା ଆପଣ ଆପାତ୍କାଳୀନ ସ୍ଥିତିରେ ଅଛନ୍ତି କି?",
}

export default function App() {
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const apiCallInProgressRef = useRef(false)
  const timerRef = useRef(null)
  const utteranceIdRef = useRef(0)

  const [connected, setConnected] = useState(false)
  const [muted, setMuted] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [readyToSpeak, setReadyToSpeak] = useState(false)
  const [timer, setTimer] = useState(0)
  const [currentLang, setCurrentLang] = useState("")
  const [langSelected, setLangSelected] = useState(false)
  const [recognitionKey, setRecognitionKey] = useState(0)
  const [history, setHistory] = useState([])
  const [policeStations, setPoliceStations] = useState([])
  const [userPos, setUserPos] = useState(null)
  const [showStations, setShowStations] = useState(false)
  const [selectedStation, setSelectedStation] = useState(null)
  const [phase, setPhase] = useState("init")
  const [callRequestLoading, setCallRequestLoading] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")

  const MAPS_EMBED_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

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
          setPhase("normal")
          await speakText(languageGreetings[detectedLang], detectedLang)
          return
        } else {
          await speakText("कृपया अपनी पसंदीदा भाषा का नाम दोबारा बताएं। For example: Hindi, English, Tamil, etc.", "hindi")
          setRecognitionKey((k) => k + 1)
          return
        }
      }

      if (phase === "normal" && !apiCallInProgressRef.current) {
        apiCallInProgressRef.current = true
        setSpeaking(true)
        const newHistory = [...history, { role: "user", content: userSpeech }]
        setHistory(newHistory)
        try {
          const res = await fetch(`${backendBaseUrl}/ask-context`, {
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
    } catch (e) {
      console.log("Recognition start failed:", e)
    }

    return () => {
      stoppedByApp = true
      recognition.stop()
    }
  }, [connected, muted, recognitionKey, speaking, phase, currentLang, history])

  // Timer setup
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
    setCallRequestLoading(false)
    setReadyToSpeak(false)
    recognitionRef.current?.stop()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }
    setSpeaking(false)
    apiCallInProgressRef.current = false
  }

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
    setRecognitionKey((k) => k + 1)
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
          const res = await fetch(`${backendBaseUrl}/nearby-police?lat=${latitude}&lng=${longitude}`)
          if (!res.ok) {
            throw new Error(`Failed to fetch police stations: ${res.status}`)
          }
          const data = await res.json()
          setPoliceStations(data.stations || [])
          setShowStations(true)
          setSelectedStation(null)
        } catch (e) {
          console.error("Police stations fetch error:", e)
          alert("Failed to fetch police stations. Please try again.")
        }
      },
      (err) => {
        console.error("Geolocation error:", err)
        alert("Location permission denied or unavailable")
      },
    )
  }

  const handleRequestCall = () => {
    const savedPhone = localStorage.getItem("nyaygpt_user_phone")
    if (savedPhone) {
      setPhoneNumber(savedPhone)
    }
    setShowPhoneModal(true)
  }

  const submitCallRequest = async () => {
    if (callRequestLoading) return

    if (!phoneNumber.trim()) {
      alert("Please enter your phone number")
      return
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ""))) {
      alert("Please enter a valid phone number with country code")
      return
    }

    setCallRequestLoading(true)

    try {
      localStorage.setItem("nyaygpt_user_phone", phoneNumber)

      const requestBody = {
        phone: phoneNumber.replace(/\s+/g, ""),
        topic: "Legal Help",
        language: currentLang || "hindi",
      }

      const res = await fetch(`${backendBaseUrl}/request-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await res.text()

      if (res.ok) {
        alert("✅ Call request sent successfully. You should receive a call shortly.")
        setShowPhoneModal(false)
      } else {
        console.error("Call request failed:", res.status, responseText)
        alert(`❌ Call request failed: ${responseText || "Unknown error"}. Please try again.`)
      }
    } catch (error) {
      console.error("Call request error:", error)
      alert("❌ Network error. Please check your connection and try again.")
    } finally {
      setCallRequestLoading(false)
    }
  }

  const formatTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      {/* Glassmorphism Navbar */}
      <nav
        style={{
          background: "rgba(17, 24, 39, 0.7)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "1rem 1.5rem",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: "64rem",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", height: "3rem" }}>
  <div
    style={{
      width: "3rem",
      height: "3rem",
      borderRadius: "0.5rem",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000000", // optional
      // boxShadow: "0 4px 16px rgba(255, 255, 255, 0.1)",
    }}
  >
    <img
      src="/image.png"
      alt="Logo"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain", // ensures full image visible
      }}
    />
  </div>
  <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)", color: "#fff" }}>
    Chanakya AI
  </h1>
</div>


          <div
            style={{
              fontSize: "0.875rem",
              color: "rgba(255, 255, 255, 0.8)",
              background: "rgba(255, 255, 255, 0.1)",
              padding: "0.5rem 1rem",
              borderRadius: "1rem",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {connected ? `Connected • ${formatTime(timer)}` : "Ready to Connect"}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ width: "100%", maxWidth: "28rem", margin: "0 auto" }}>
          {/* Glassmorphism Status Card */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "4.5rem",
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div style={{ fontSize: "1.125rem", color: "#ffffff", marginBottom: "0.5rem", fontWeight: "600" }}>
              {connected ? "Connected - Ready to Help" : "Your AI Legal Assistant"}
            </div>
            <div style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.7)" }}>
              {speaking && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <FaVolumeUp style={{ color: "#60a5fa" }} />
                  <span>Chanakya AI is speaking...</span>
                </div>
              )}
              {userSpeaking && "👂 Listening..."}
              {!speaking && !userSpeaking && !readyToSpeak && connected && "Ready for your question"}
              {!connected && "Tap the microphone to start"}
            </div>
          </div>

          {/* Main Microphone */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "3rem" }}>
            <div style={{ position: "relative" }}>
              {/* Microphone Button */}
              <button
                onClick={connected ? handleEnd : handleConnect}
                style={{
                  width: "8rem",
                  height: "8rem",
                  borderRadius: "50%",
                  border: readyToSpeak ? "3px solid rgba(248, 113, 113, 0.8)" : "3px solid rgba(255, 255, 255, 0.2)",
                  background: readyToSpeak
                    ? "linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(239, 68, 68, 0.6) 100%)"
                    : "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: readyToSpeak
                    ? "0 0 40px rgba(248, 113, 113, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3)"
                    : "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
                onMouseEnter={(e) => {
                  if (!readyToSpeak) {
                    e.target.style.background = "rgba(255, 255, 255, 0.15)"
                    e.target.style.transform = "scale(1.05)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!readyToSpeak) {
                    e.target.style.background = "rgba(255, 255, 255, 0.1)"
                    e.target.style.transform = "scale(1)"
                  }
                }}
              >
                {connected ? (
                  userSpeaking ? (
                    <FaMicrophone
                      style={{
                        width: "3rem",
                        height: "3rem",
                        color: "#ffffff",
                        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                      }}
                    />
                  ) : (
                    <FaMicrophoneSlash
                      style={{
                        width: "3rem",
                        height: "3rem",
                        color: "#ffffff",
                        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                      }}
                    />
                  )
                ) : (
                  <FaMicrophone
                    style={{
                      width: "3rem",
                      height: "3rem",
                      color: "#ffffff",
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                    }}
                  />
                )}
              </button>

              {/* Speaking Animation Waves */}
              {speaking && (
                <div
                  style={{
                    position: "absolute",
                    inset: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        width: "8rem",
                        height: "8rem",
                        border: "2px solid rgba(96, 165, 250, 0.6)",
                        borderRadius: "50%",
                        animation: "ping 2s infinite",
                        animationDelay: `${i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Red Pulse when ready to speak */}
              {readyToSpeak && (
                <div
                  style={{
                    position: "absolute",
                    inset: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "9rem",
                      height: "9rem",
                      border: "2px solid rgba(248, 113, 113, 0.8)",
                      borderRadius: "50%",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Text */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            {connected ? (
              userSpeaking ? (
                <p style={{ color: "#f87171", fontWeight: "500", margin: 0 }}>
                  <FaMicrophone style={{ marginRight: "0.5rem" }} />
                  Speak now...
                </p>
              ) : speaking ? (
                <p style={{ color: "#60a5fa", fontWeight: "500", margin: 0 }}>
                  {/* <FaVolumeUp style={{ marginRight: "0.5rem" }} /> */}
                  Chanakya AI is speaking...
                </p>
              ) : readyToSpeak ? (
                <p
                  style={{
                    color: "#f87171",
                    fontWeight: "600",
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    margin: 0,
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <FaMicrophone style={{ color: "#f87171" }} />
                  SPEAK NOW
                </p>
              ) : (
                <p style={{ color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>Ask your legal question</p>
              )
            ) : (
              <p style={{ color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>Tell your legal issue</p>
            )}
          </div>

          {/* Glassmorphism Control Buttons */}
          {!connected ? (
            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem" }}>
              <button
                onClick={handleNearbyPolice}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "1rem",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.15)"
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.3)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)"
                }}
              >
                <FaMapMarkerAlt
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    color: "#60a5fa",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                  }}
                />
                <span style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.9)", fontWeight: "500" }}>
                  Nearby Police
                </span>
              </button>

              <button
                onClick={handleRequestCall}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "1rem",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.15)"
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.3)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)"
                }}
              >
                <FaPhone
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    color: "#10b981",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                  }}
                />
                <span style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.9)", fontWeight: "500" }}>
                  Request Call
                </span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem" }}>
              <button
                onClick={handleMute}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  borderRadius: "1rem",
                  transition: "all 0.3s ease",
                  background: muted
                    ? "linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(239, 68, 68, 0.6) 100%)"
                    : "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  border: muted ? "1px solid rgba(248, 113, 113, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.3)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)"
                }}
              >
                {muted ? (
                  <FaMicrophoneSlash
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      color: "#ffffff",
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                    }}
                  />
                ) : (
                  <FaMicrophone
                    style={{
                      width: "1.5rem",
                      height: "1.5rem",
                      color: "#ffffff",
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                    }}
                  />
                )}
                <span style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: "500" }}>
                  {muted ? "Unmute" : "Mute"}
                </span>
              </button>

              <button
                onClick={handleNearbyPolice}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "1rem",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.15)"
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.3)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)"
                }}
              >
                <FaMapMarkerAlt
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    color: "#60a5fa",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                  }}
                />
                <span style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: "500" }}>Police</span>
              </button>

              <button
                onClick={handleEnd}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem",
                  background: "linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(239, 68, 68, 0.6) 100%)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "1rem",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(248, 113, 113, 0.3)",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 8px 32px rgba(220, 38, 38, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, rgba(185, 28, 28, 0.9) 0%, rgba(220, 38, 38, 0.7) 100%)"
                  e.target.style.transform = "translateY(-2px)"
                  e.target.style.boxShadow = "0 12px 40px rgba(220, 38, 38, 0.4)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    "linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(239, 68, 68, 0.6) 100%)"
                  e.target.style.transform = "translateY(0)"
                  e.target.style.boxShadow = "0 8px 32px rgba(220, 38, 38, 0.3)"
                }}
              >
                <FaPhone
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    color: "#ffffff",
                    transform: "rotate(225deg)",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                  }}
                />
                <span style={{ fontSize: "0.875rem", color: "#ffffff", fontWeight: "500" }}>End</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Glassmorphism Phone Number Modal */}
      {showPhoneModal && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: "50",
          }}
        >
          <div
            style={{
              background: "rgba(17, 24, 39, 0.9)",
              backdropFilter: "blur(30px)",
              borderRadius: "1.5rem",
              padding: "2rem",
              width: "100%",
              maxWidth: "24rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#ffffff", margin: 0 }}>Request Call</h3>
              <button
                onClick={() => setShowPhoneModal(false)}
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  outline: "none",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#ffffff"
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(255, 255, 255, 0.6)"
                  e.target.style.background = "transparent"
                }}
              >
                <FaTimes style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  color: "rgba(255, 255, 255, 0.8)",
                  marginBottom: "0.5rem",
                }}
              >
                Phone Number (with country code)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91XXXXXXXXXX"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "0.75rem",
                  color: "#ffffff",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(96, 165, 250, 0.5)"
                  e.target.style.background = "rgba(255, 255, 255, 0.15)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setShowPhoneModal(false)}
                style={{
                  flex: "1",
                  padding: "0.75rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "0.75rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.15)"
                  e.target.style.transform = "translateY(-1px)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                  e.target.style.transform = "translateY(0)"
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitCallRequest}
                disabled={callRequestLoading}
                style={{
                  flex: "1",
                  padding: "0.75rem",
                  background: callRequestLoading
                    ? "rgba(75, 85, 99, 0.8)"
                    : "linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.9) 100%)",
                  backdropFilter: "blur(10px)",
                  color: "#ffffff",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "0.75rem",
                  cursor: callRequestLoading ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  outline: "none",
                  opacity: callRequestLoading ? 0.6 : 1,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!callRequestLoading) {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(5, 150, 105, 0.9) 0%, rgba(4, 120, 87, 1) 100%)"
                    e.target.style.transform = "translateY(-1px)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!callRequestLoading) {
                    e.target.style.background =
                      "linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.9) 100%)"
                    e.target.style.transform = "translateY(0)"
                  }
                }}
              >
                {callRequestLoading ? "Requesting..." : "Request Call"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glassmorphism Police Stations Modal */}
      {showStations && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: "50",
          }}
        >
          <div
            style={{
              background: "rgba(17, 24, 39, 0.9)",
              backdropFilter: "blur(30px)",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "28rem",
              maxHeight: "24rem",
              overflowY: "auto",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#ffffff", margin: 0 }}>
                Nearby Police Stations
              </h3>
              <button
                onClick={() => {
                  setShowStations(false)
                  setSelectedStation(null)
                }}
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  outline: "none",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#ffffff"
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(255, 255, 255, 0.6)"
                  e.target.style.background = "transparent"
                }}
              >
                <FaTimes style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
            </div>

            {policeStations.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {policeStations.map((station, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedStation(station)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.75rem",
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "0.75rem",
                      transition: "all 0.3s ease",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      cursor: "pointer",
                      outline: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(255, 255, 255, 0.1)"
                      e.target.style.transform = "translateY(-1px)"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(255, 255, 255, 0.05)"
                      e.target.style.transform = "translateY(0)"
                    }}
                  >
                    <div style={{ fontWeight: "500", color: "#ffffff", marginBottom: "0.25rem" }}>{station.name}</div>
                    <div style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.7)" }}>{station.vicinity}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.6)", padding: "2rem 0" }}>
                No nearby police stations found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Glassmorphism Directions Modal */}
      {selectedStation && userPos && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: "50",
          }}
        >
          <div
            style={{
              background: "rgba(17, 24, 39, 0.9)",
              backdropFilter: "blur(30px)",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "48rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#ffffff", margin: 0 }}>
                Directions to <span style={{ color: "#60a5fa" }}>{selectedStation.name}</span>
              </h3>
              <button
                onClick={() => setSelectedStation(null)}
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  outline: "none",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#ffffff"
                  e.target.style.background = "rgba(255, 255, 255, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(255, 255, 255, 0.6)"
                  e.target.style.background = "transparent"
                }}
              >
                <FaTimes style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
            </div>

            {MAPS_EMBED_API_KEY ? (
              <iframe
                width="100%"
                height="400"
                frameBorder="0"
                style={{ border: 0, borderRadius: "1rem" }}
                allowFullScreen
                loading="lazy"
                src={`https://www.google.com/maps/embed/v1/directions?key=${MAPS_EMBED_API_KEY}&origin=${userPos.lat},${userPos.lng}&destination=${selectedStation.lat},${selectedStation.lng}&mode=driving`}
                title="Directions Map"
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#f87171",
                  padding: "2rem 0",
                  background: "rgba(248, 113, 113, 0.1)",
                  borderRadius: "1rem",
                  border: "1px solid rgba(248, 113, 113, 0.2)",
                }}
              >
                API Key missing. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
