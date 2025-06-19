"use client"

import { useEffect, useRef, useState } from "react"
import "./AppUI.css"
import AvatarLipsync from "./components/Avatar.jsx"

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
    "നമസ്കാരം, ഞാൻ നവ്യ, നിങ്ങളുടെ ലീഗൽ ഏജന്റ്. മികച്ച സഹായത്തിനായി, നിങ്ങൾക്ക് എന്ത് തരത്തിലുള്ള നിയമ സഹായം വേണമെന്ന് അല്ലെങ്കിൽ നിങ്ങൾ അടിയന്തരാവസ്ഥയിലാണോ എന്ന് പറയാമോ?",
  gujarati:
    "નમસ્તે, હું નવ્યા, તમારી લીગલ એજન્ટ છું. તમારી વધુ સારી મદદ માટે, કૃપા કરીને કહો તમને કઈ પ્રકારની કાનૂની મદદ જોઈએ છે અથવા તમે ઇમરજન્સી માં છો?",
  urdu: "السلام علیکم، میں نویا، آپ کی قانونی ایجنٹ ہوں۔ آپ کی بہتر مدد کے لیے، کیا آپ بتا سکتے ہیں آپ کو کس چیز की قانونی مدد चाहिए या آپ ایمرجینسی میں ہیں؟",
  odia: "ନମସ୍କାର, ମୁଁ ନବ୍ୟା, ଆପଣଙ୍କର ଲିଗାଲ୍ ଏଜେଣ୍ଟ। ଆପଣଙ୍କୁ ଭଲ ସହଯୋଗ ଦେବା ପାଇଁ, ଦୟାକରି କହନ୍ତୁ ଆପଣ କେଉଁ ପ୍ରକାରର ଆଇନିକ ସହଯୋଗ ଚାହାଁନ୍ତି କିମ୍ବା ଆପଣ ଆପାତ୍କାଳୀନ ସ୍ଥିତିରେ ଅଛନ୍ତି କି?",
}

export default function App() {
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const apiCallInProgressRef = useRef(false)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)

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
  const [phase, setPhase] = useState("init")
  const [mouthOpen, setMouthOpen] = useState(0)
  const [audioData, setAudioData] = useState(null)
  const [callRequestLoading, setCallRequestLoading] = useState(false)

  const timerRef = useRef(null)
  const utteranceIdRef = useRef(0)

  const MAPS_EMBED_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Audio unlock for mobile devices
  useEffect(() => {
    const unlockAudio = () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
        }
        if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume()
        }
        const buffer = audioContextRef.current.createBuffer(1, 1, 22050)
        const source = audioContextRef.current.createBufferSource()
        source.buffer = buffer
        source.connect(audioContextRef.current.destination)
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

  // Audio analysis for lip sync
  useEffect(() => {
    const setupHumanizedAudioAnalysis = async () => {
      if (speaking && audioRef.current) {
        try {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
          }

          if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume()
          }

          if (!analyserRef.current) {
            analyserRef.current = audioContextRef.current.createAnalyser()
            analyserRef.current.fftSize = 512
            analyserRef.current.smoothingTimeConstant = 0.2

            const source = audioContextRef.current.createMediaElementSource(audioRef.current)
            source.connect(analyserRef.current)
            analyserRef.current.connect(audioContextRef.current.destination)
          }

          const bufferLength = analyserRef.current.frequencyBinCount
          const dataArray = new Uint8Array(bufferLength)

          const analyzeHumanizedAudio = () => {
            if (speaking && analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray)

              const volume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength / 255
              const veryLowFreq = dataArray.slice(0, 16).reduce((sum, val) => sum + val, 0) / 16 / 255
              const lowFreq = dataArray.slice(16, 32).reduce((sum, val) => sum + val, 0) / 16 / 255
              const midFreq = dataArray.slice(32, 64).reduce((sum, val) => sum + val, 0) / 32 / 255
              const highFreq = dataArray.slice(64, 96).reduce((sum, val) => sum + val, 0) / 32 / 255
              const veryHighFreq = dataArray.slice(96, 128).reduce((sum, val) => sum + val, 0) / 32 / 255

              const humanizedAudioData = {
                volume: volume,
                frequencies: Array.from(dataArray),
                veryLowFreq: veryLowFreq,
                lowFreq: lowFreq,
                midFreq: midFreq,
                highFreq: highFreq,
                veryHighFreq: veryHighFreq,
                timestamp: Date.now(),
              }

              setAudioData(humanizedAudioData)
              animationFrameRef.current = requestAnimationFrame(analyzeHumanizedAudio)
            }
          }

          analyzeHumanizedAudio()
        } catch (error) {
          console.log("Audio analysis failed, using fallback:", error)
          const createRealisticFakeData = () => {
            const baseVolume = 0.4 + Math.random() * 0.4
            const time = Date.now() * 0.001

            return {
              volume: baseVolume * (0.8 + Math.sin(time * 8) * 0.2),
              frequencies: Array.from({ length: 256 }, (_, i) => Math.random() * 100 + 50),
              veryLowFreq: 0.3 + Math.sin(time * 3) * 0.2,
              lowFreq: 0.25 + Math.cos(time * 4) * 0.15,
              midFreq: 0.2 + Math.sin(time * 6) * 0.1,
              highFreq: 0.15 + Math.cos(time * 8) * 0.08,
              veryHighFreq: 0.1 + Math.sin(time * 12) * 0.05,
              timestamp: Date.now(),
            }
          }

          setAudioData(createRealisticFakeData())

          const fakeInterval = setInterval(() => {
            if (speaking) {
              setAudioData(createRealisticFakeData())
            } else {
              clearInterval(fakeInterval)
            }
          }, 50)
        }
      } else {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        setAudioData(null)
      }
    }

    setupHumanizedAudioAnalysis()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [speaking])

  const handleMute = () => {
    setMuted((m) => !m)
    if (!muted) {
      recognitionRef.current?.stop()
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
    setCallRequestLoading(false)
    recognitionRef.current?.stop()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }
    setSpeaking(false)
    apiCallInProgressRef.current = false

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
      analyserRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
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

    if (audioContextRef.current && analyserRef.current) {
      try {
        audioContextRef.current.close()
      } catch (e) {}
      audioContextRef.current = null
      analyserRef.current = null
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
        setMouthOpen(0)
        setAudioData(null)
      }
      audio.onerror = (e) => {
        console.error("Audio playback error:", e)
        setSpeaking(false)
        setMouthOpen(0)
        setAudioData(null)
      }

      setSpeaking(true)
      try {
        await audio.play()
      } catch (err) {
        console.error("Audio play failed:", err)
        alert("Please tap anywhere on the screen to enable audio, then try again.")
        setSpeaking(false)
        setMouthOpen(0)
        setAudioData(null)
      }
    } catch (error) {
      console.error("TTS error:", error)
      setSpeaking(false)
      setMouthOpen(0)
      setAudioData(null)
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

  const handleRequestCall = async () => {
    if (callRequestLoading) return

    setCallRequestLoading(true)

    try {
      let phone = localStorage.getItem("nyaygpt_user_phone")
      if (!phone) {
        phone = prompt("📲 Enter your phone number (with country code, e.g., +91XXXXXXXXXX):")
        if (!phone) {
          setCallRequestLoading(false)
          return
        }

        // Basic phone validation
        const phoneRegex = /^\+?[1-9]\d{1,14}$/
        if (!phoneRegex.test(phone.replace(/\s+/g, ""))) {
          alert("Please enter a valid phone number with country code")
          setCallRequestLoading(false)
          return
        }

        localStorage.setItem("nyaygpt_user_phone", phone)
      }

      const requestBody = {
        phone: phone.replace(/\s+/g, ""), // Remove spaces
        topic: "Legal Help",
        language: currentLang || "hindi",
      }

      console.log("Sending call request:", requestBody)

      const res = await fetch(`${backendBaseUrl}/request-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await res.text()
      console.log("Call request response:", res.status, responseText)

      if (res.ok) {
        alert("✅ Call request sent successfully. You should receive a call shortly.")
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
    <div className="ai-agent-ui-container premium-bg">
      <div className="ai-status-bar">
        <span>{formatTime(timer)} • Voice</span>
        <div className="ai-status-icons">
          <span className="ai-status-icon" />
          <span className="ai-status-icon" />
          <span className="ai-status-battery" />
        </div>
      </div>

      <div className="ai-agent-title-premium" style={{ marginTop: 65, textAlign: "center" }}>
        NyayGPT
      </div>
      <div className="ai-agent-subtitle-premium" style={{ textAlign: "center" }}>
        {connected ? "Connected" : "Tap to connect"}
      </div>

      {/* Avatar Face */}
      <div className="avatar-face-container" style={{ width: 220, height: 320, margin: "10px auto" }}>
        <AvatarLipsync
          mouthOpen={mouthOpen}
          speaking={speaking}
          cameraPosition={[0, 1.6, 1.55]}
          cameraTarget={[0, 1.8, 0]}
          audioData={audioData}
        />
      </div>

      {/* Debug Audio Info (Development Only) */}
      {process.env.NODE_ENV === "development" && audioData && (
        <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            background: "rgba(0,0,0,0.95)",
            color: "white",
            padding: 12,
            fontSize: 10,
            borderRadius: 8,
            fontFamily: "monospace",
            lineHeight: 1.4,
          }}
        >
          <div style={{ color: "#00ff00", fontWeight: "bold" }}>🗣️ AUDIO DEBUG</div>
          <div>🎤 Speaking: {speaking ? "YES" : "NO"}</div>
          <div>🔊 Volume: {(audioData.volume * 100).toFixed(0)}%</div>
          <div>🔉 VeryLow: {(audioData.veryLowFreq * 100).toFixed(0)}%</div>
          <div>🔉 Low: {(audioData.lowFreq * 100).toFixed(0)}%</div>
          <div>🔉 Mid: {(audioData.midFreq * 100).toFixed(0)}%</div>
          <div>🔉 High: {(audioData.highFreq * 100).toFixed(0)}%</div>
          <div>🔉 VHigh: {(audioData.veryHighFreq * 100).toFixed(0)}%</div>
        </div>
      )}

      {/* Audio Waves */}
      {connected && (
        <div className={`ai-agent-waves${(speaking || userSpeaking) && !muted ? " speaking" : ""}`}>
          {[...Array(10)].map((_, i) => (
            <div className="ai-wave-bar" key={i} />
          ))}
        </div>
      )}

      {/* Control Buttons */}
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
          <button
            className="ai-nearby-btn"
            onClick={handleRequestCall}
            disabled={callRequestLoading}
            style={{
              background: callRequestLoading
                ? "linear-gradient(135deg, #ccc, #999)"
                : "linear-gradient(135deg, #ff9f1a, #ff6e1a)",
              cursor: callRequestLoading ? "not-allowed" : "pointer",
            }}
          >
            <span className="ai-location-icon" />
            <div>{callRequestLoading ? "Requesting..." : "Request Call"}</div>
          </button>
        </div>
      )}

      {/* Police Stations Modal */}
      {showStations && (
        <div
          className="stations-modal-bg"
          onClick={() => {
            setShowStations(false)
            setSelectedStation(null)
          }}
        >
          <div className="stations-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => {
                setShowStations(false)
                setSelectedStation(null)
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h3>Nearby Police Stations</h3>
            {policeStations.length ? (
              <ul>
                {policeStations.map((s, i) => (
                  <li
                    key={i}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedStation(s)}
                    title="Show directions on map"
                  >
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

      {/* Directions Modal */}
      {selectedStation && userPos && (
        <div className="directions-modal-bg" onClick={() => setSelectedStation(null)}>
          <div className="directions-modal" onClick={(e) => e.stopPropagation()}>
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
