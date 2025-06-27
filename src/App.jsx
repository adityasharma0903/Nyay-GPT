"use client"

import { useEffect, useRef, useState } from "react"
import { FaMicrophone, FaMicrophoneSlash, FaMapMarkerAlt, FaPhone, FaTimes, FaVolumeUp } from "react-icons/fa"
import FileUpload from "./components/FileUpload"

const backendBaseUrl =
  window.location.hostname === "localhost" ? "http://localhost:3000" : "https://nyay-gpt.onrender.com"

// Supported Languages & Greetings
         

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
  odia: ["odia", "odiya", "ଓଡ଼ିଆ", "ओड़िया"],
}

const initialGreeting =
  "आप कानूनी सहायता तक पहुँच चुके हैं। आपकी बेहतर मदद के लिए कृपया बताएं आपकी पसंदीदा भाषा क्या है? For example: Hindi, English, Gujarati."

const languageGreetings = {
  english:
    "Hello! I am Navya, your legal agent from Chanakya AI. For better assistance, can you tell me what help you need or if you are in an emergency?",
  hindi:
    "नमस्ते जी, मैं नव्या, चाणक्य एआई से आपकी लीगल एजेंट। आपकी बेहतर सहायता के लिए, क्या आप बता सकते हैं आपको किस प्रकार की कानूनी सहायता चाहिए या क्या आप इमरजेंसी में हैं?",
  punjabi:
    "ਸਤ ਸ੍ਰੀ ਅਕਾਲ ਜੀ, ਮੈਂ ਨਵਿਆ, ਚਾਣਕਯ ਏਆਈ ਤੋਂ ਤੁਹਾਡੀ ਲੀਗਲ ਏਜੰਟ ਹਾਂ। ਤੁਹਾਡੀ ਬਿਹਤਰ ਮਦਦ ਲਈ, ਕੀ ਤੁਸੀਂ ਦੱਸ ਸਕਦੇ ਹੋ ਕਿ ਤੁਹਾਨੂੰ ਕਿਸ ਕਿਸਮ ਦੀ ਕਾਨੂੰਨੀ ਮਦਦ ਚਾਹੀਦੀ ਹੈ ਜਾਂ ਤੁਸੀਂ ਐਮਰਜੈਂਸੀ ਵਿੱਚ ਹੋ?",
  tamil:
    "வணக்கம், நான் நவ்யா, சாணக்யா ஏஐயில் இருந்து உங்கள் சட்ட உதவியாளர். சிறந்த உதவிக்காக, நீங்கள் என்ன உதவி தேவை என்று அல்லது அவசர நிலைமையில் உள்ளீர்களா என்று சொல்ல முடியுமா?",
  marathi:
    "नमस्कार, मी नव्या, चाणक्य एआयमधून तुमची लीगल एजंट. तुमच्या उत्तम मदतीसाठी, कृपया सांगा तुम्हाला कोणत्या प्रकारची कायदेशीर मदत हवी आहे किंवा तुम्ही आणीबाणी स्थितीत आहात का?",
  telugu:
    "నమస్తే, నేను నవ్యా, చాణక్య ఎఐ నుండి మీ లీగల్ ఏజెంట్. మీకు మెరుగైన సహాయం అందించేందుకు, మీరు ఏ విధమైన చట్ట సహాయం కావాలో లేదా మీరు ఎమర్జెన్సీలో ఉన్నారా అని చెప్పగలరా?",
  bengali:
    "নমস্কার, আমি নব্যা, চাণক্য এআই থেকে আপনার লিগ্যাল এজেন্ট। আপনার আরও ভাল সহায়তার জন্য, দয়া করে বলুন আপনি কী ধরনের আইনি সহায়তা চান বা আপনি জরুরি অবস্থায় রয়েছেন কিনা।",
  kannada:
    "ನಮಸ್ಕಾರ, ನಾನು ನವ್ಯಾ, ಚಾಣಕ್ಯ ಎಐ ಯಿಂದ ನಿಮ್ಮ ಲೀಗಲ್ ಏಜೆಂಟ್. ಉತ್ತಮ ಸಹಾಯಕ್ಕಾಗಿ, ನಿಮಗೆ ಯಾವ ರೀತಿಯ ಕಾನೂನು ಸಹಾಯ ಬೇಕು ಅಥವಾ ನೀವು ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಇದ್ದೀರಾ ಎಂಬುದನ್ನು ಹೇಳಿ.",
  malayalam:
    "നമസ്കാരം, ഞാൻ നവ്യ, ചാണക്യ എഐയിൽ നിന്നുള്ള നിങ്ങളുടെ ലീഗൽ ഏജന്റ്. മികച്ച സഹായത്തിനായി, നിങ്ങൾക്ക് എന്ത് തരത്തിലുള്ള നിയമ സഹായം വേണമെന്ന് അല്ലെങ്കിൽ നിങ്ങൾ അടിയന്തരാവസ്ഥയിലാണോ എന്ന് പറയാമോ?",
  gujarati:
    "નમસ્તે, હું નવ્યા, ચાણક્ય એઆઈ તરફથી તમારી લીગલ એજન્ટ છું. તમારી વધુ સારી મદદ માટે, કૃપા કરીને કહો તમને કઈ પ્રકારની કાનૂની મદદ જોઈએ છે અથવા તમે ઇમરજન્સી માં છો?",
  urdu: "السلام علیکم، میں نویا، چانکیہ اے آئی سے آپ کی قانونی ایجنٹ ہوں۔ آپ کی بہتر مدد کے لیے، کیا آپ بتا سکتے ہیں آپ کو کس چیز کی قانونی مدد چاہیے یا آپ ایمرجینسی میں ہیں؟",
  odia: "ନମସ୍କାର, ମୁଁ ନବ୍ୟା, ଚାଣକ୍ୟ ଏଆଇ ରୁ ଆପଣଙ୍କର ଲିଗାଲ୍ ଏଜେଣ୍ଟ। ଆପଣଙ୍କୁ ଭଲ ସହଯୋଗ ଦେବା ପାଇଁ, ଦୟାକରି କହନ୍ତୁ ଆପଣ କେଉଁ ପ୍ରକାରର ଆଇନିକ ସହଯୋଗ ଚାହାଁନ୍ତି କିମ୍ବା ଆପଣ ଆପାତ୍କାଳୀନ ସ୍ଥିତିରେ ଅଛନ୍ତି କି?",
}

// Document analysis prompts
const documentContextPrompts = {
  english:
    "I have analyzed your document. Please tell me what specific concerns you have about this document or what you would like to know?",
  hindi: "मैंने आपका दस्तावेज़ पढ़ लिया है। कृपया बताएं कि इस दस्तावेज़ के बारे में आपकी क्या चिंता है या आप क्या जानना चाहते हैं?",
  punjabi: "ਮੈਂ ਤੁਹਾਡਾ ਦਸਤਾਵੇਜ਼ ਪੜ੍ਹ ਲਿਆ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੱਸੋ ਕਿ ਇਸ ਦਸਤਾਵੇਜ਼ ਬਾਰੇ ਤੁਹਾਡੀ ਕੀ ਚਿੰਤਾ ਹੈ ਜਾਂ ਤੁਸੀਂ ਕੀ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ?",
  tamil:
    "நான் உங்கள் ஆவணத்தை பகுப்பாய்வு செய்துள்ளேன். இந்த ஆவணத்தைப் பற்றி உங்களுக்கு என்ன கவலைகள் உள்ளன அல்லது நீங்கள் என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள் என்று சொல்லுங்கள்?",
  marathi: "मी तुमचा दस्तावेज वाचला आहे। कृपया सांगा की या दस्तावेजाबद्दल तुमची काय चिंता आहे किंवा तुम्हाला काय जाणून घ्यायचे आहे?",
  telugu: "నేను మీ పత్రాన్ని విశ్లేషించాను। ఈ పత్రం గురించి మీకు ఏ విధమైన ఆందోళనలు ఉన్నాయి లేదా మీరు ఏమి తెలుసుకోవాలని అనుకుంటున్నారు అని దయచేసి చెప్పండి?",
  bengali: "আমি আপনার নথি বিশ্লেষণ করেছি। দয়া করে বলুন এই নথি সম্পর্কে আপনার কী উদ্বেগ রয়েছে বা আপনি কী জানতে চান?",
  kannada: "ನಾನು ನಿಮ್ಮ ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿದ್ದೇನೆ। ಈ ದಾಖಲೆಯ ಬಗ್ಗೆ ನಿಮಗೆ ಯಾವ ಕಾಳಜಿಗಳಿವೆ ಅಥವಾ ನೀವು ಏನು ತಿಳಿದುಕೊಳ್ಳಲು ಬಯಸುತ್ತೀರಿ ಎಂದು ದಯವಿಟ್ಟು ಹೇಳಿ?",
  malayalam:
    "ഞാൻ നിങ്ങളുടെ രേഖ വിശകലനം ചെയ്തിട്ടുണ്ട്. ഈ രേഖയെക്കുറിച്ച് നിങ്ങൾക്ക് എന്ത് ആശങ്കകളാണുള്ളത് അല്ലെങ്കിൽ നിങ്ങൾ എന്താണ് അറിയാൻ ആഗ്രഹിക്കുന്നത് എന്ന് ദയവായി പറയുക?",
  gujarati: "મેં તમારા દસ્તાવેજનું વિશ્લેષણ કર્યું છે. કૃપા કરીને કહો કે આ દસ્તાવેજ વિશે તમારી શું ચિંતાઓ છે અથવા તમે શું જાણવા માંગો છો?",
  urdu: "میں نے آپ کی دستاویز کا تجزیہ کر لیا ہے۔ براہ کرم بتائیں کہ اس دستاویز کے بارے میں آپ کی کیا پریشانیاں ہیں یا آپ کیا جاننا چاہتے ہیں؟",
  odia: "ମୁଁ ଆପଣଙ୍କର ଦଲିଲ ବିଶ୍ଳେଷଣ କରିଛି। ଦୟାକରି କୁହନ୍ତୁ ଏହି ଦଲିଲ ବିଷୟରେ ଆପଣଙ୍କର କ'ଣ ଚିନ୍ତା ଅଛି କିମ୍ବା ଆପଣ କ'ଣ ଜାଣିବାକୁ ଚାହାଁନ୍ତି?",
}

export default function App() {
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const apiCallInProgressRef = useRef(false)
  const timerRef = useRef(null)
  const utteranceIdRef = useRef(0)

  // File upload states
  const [uploadedFile, setUploadedFile] = useState(null)
  const [filePreview, setFilePreview] = useState("")
  const [awaitingVoiceContext, setAwaitingVoiceContext] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const [documentText, setDocumentText] = useState("")
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState("")

  // Existing states
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
  const [advocates, setAdvocates] = useState([])
  const [showAdvocates, setShowAdvocates] = useState(false)
  const [selectedAdvocate, setSelectedAdvocate] = useState(null)

  const MAPS_EMBED_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Audio unlock for mobile devices
  useEffect(() => {
    let audioContext = null

    const unlockAudio = async () => {
      try {
        // Only create one AudioContext instance
        if (!audioContext) {
          audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }

        // Resume if suspended
        if (audioContext.state === "suspended") {
          await audioContext.resume()
        }

        // Create a short silent buffer to unlock audio
        const buffer = audioContext.createBuffer(1, 1, 22050)
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        source.connect(audioContext.destination)
        source.start(0)

        console.log("Audio unlocked successfully")
      } catch (e) {
        console.log("Audio unlock failed:", e)
      }

      // Remove listeners after first successful unlock
      document.removeEventListener("touchend", unlockAudio, true)
      document.removeEventListener("click", unlockAudio, true)
      document.removeEventListener("keydown", unlockAudio, true)
    }

    // Add multiple event listeners for better coverage
    document.addEventListener("touchend", unlockAudio, true)
    document.addEventListener("click", unlockAudio, true)
    document.addEventListener("keydown", unlockAudio, true)

    return () => {
      document.removeEventListener("touchend", unlockAudio, true)
      document.removeEventListener("click", unlockAudio, true)
      document.removeEventListener("keydown", unlockAudio, true)

      // Clean up AudioContext
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close()
      }
    }
  }, [])

  // Progress simulation for document analysis
  const simulateAnalysisProgress = () => {
    const stages = [
      { progress: 20, stage: "Reading document..." },
      { progress: 40, stage: "Extracting text..." },
      { progress: 60, stage: "Understanding content..." },
      { progress: 80, stage: "Analyzing legal aspects..." },
      { progress: 100, stage: "Preparing response..." },
    ]

    let currentStageIndex = 0
    setAnalysisProgress(0)
    setAnalysisStage("Starting analysis...")

    const progressInterval = setInterval(() => {
      if (currentStageIndex < stages.length) {
        const stage = stages[currentStageIndex]
        setAnalysisProgress(stage.progress)
        setAnalysisStage(stage.stage)
        currentStageIndex++
      } else {
        clearInterval(progressInterval)
      }
    }, 800)

    return progressInterval
  }

  // Speech recognition setup
  useEffect(() => {
    console.log(
      `Recognition useEffect triggered - Connected: ${connected}, Muted: ${muted}, Speaking: ${speaking}, Phase: ${phase}`,
    )

    // Allow recognition during documentContext phase even if not fully connected
    if (!connected && phase !== "documentContext") return
    if (muted || speaking) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser. Use the latest Chrome.")
      return
    }

    const langToUse = currentLang && languages[currentLang] ? languages[currentLang].code : "hi-IN"
    console.log(`Setting up recognition with language: ${langToUse}, Phase: ${phase}`)

    const recognition = new SpeechRecognition()
    recognition.lang = langToUse
    recognition.continuous = true
    recognition.interimResults = false

    let stoppedByApp = false
    let isProcessing = false

    recognition.onstart = () => {
      console.log(`Recognition started successfully - Phase: ${phase}`)
    }

    recognition.onerror = (event) => {
      console.error(`Recognition error: ${event.error} - Phase: ${phase}`)

      // Don't restart on abort errors - they're usually caused by rapid restarts
      if (event.error === "aborted") {
        console.log("Recognition aborted - likely due to rapid restart, waiting...")
        return
      }
    }

    recognition.onresult = async (event) => {
      console.log(`🎤 Recognition result received - Phase: ${phase}, Muted: ${muted}, Speaking: ${speaking}`)
      console.log(`📋 Document text available: ${!!documentText}, Length: ${documentText?.length || 0}`)
      console.log(`🔄 API in progress: ${apiCallInProgressRef.current}`)

      if (muted || speaking || apiCallInProgressRef.current || isProcessing) {
        console.log("⏭️ Ignoring recognition result due to state")
        return
      }

      isProcessing = true
      setUserSpeaking(true)
      setReadyToSpeak(false)
      setTimeout(() => setUserSpeaking(false), 1200)

      // Stop recognition to prevent conflicts
      stoppedByApp = true
      recognition.stop()

      utteranceIdRef.current += 1
      const thisUtterance = utteranceIdRef.current
      const userSpeech = event.results[event.results.length - 1][0].transcript.toLowerCase().trim()

      try {
        // Language selection phase
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
            await speakText(
              "कृपया अपनी पसंदीदा भाषा का नाम दोबारा बताएं। For example: Hindi, English, Tamil, etc.",
              "hindi",
            )
            setRecognitionKey((k) => k + 1)
            return
          }
        }

        // Document context collection phase
        if (phase === "documentContext" && documentText) {
          console.log("🎯 Document context phase - processing user input:", userSpeech)

          if (apiCallInProgressRef.current) {
            console.log("⚠️ API call already in progress, ignoring")
            return
          }

          apiCallInProgressRef.current = true
          setSpeaking(true)

          console.log("📤 Starting API call to backend...")

          // Start progress simulation
          const progressInterval = simulateAnalysisProgress()

          try {
            const contextText = userSpeech
            const analysisPrompt = `You are analyzing a legal document. User's situation and concerns: ${contextText}

Document content:
${documentText}

Please provide analysis focusing on:
1. What is the main purpose of this document?
2. What are the important points for the user?
3. Is any immediate action required?
4. What steps should be taken next?
5. Is expert advice needed?

Respond in ${currentLang} language in clear, practical, and understandable terms.`

            console.log("📡 Making fetch request to:", `${backendBaseUrl}/ask-context`)

            const res = await fetch(`${backendBaseUrl}/ask-context`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                history: [{ role: "user", content: analysisPrompt }],
                language: currentLang,
              }),
            })

            console.log("📥 Response status:", res.status)

            if (!res.ok) throw new Error(`Server responded with ${res.status}`)
            const data = await res.json()

            console.log("✅ Response received:", data.reply?.substring(0, 100) + "...")

            // Clear progress
            clearInterval(progressInterval)
            setAnalysisProgress(0)
            setAnalysisStage("")

            if (utteranceIdRef.current === thisUtterance && apiCallInProgressRef.current) {
              const newHistory = [
                ...history,
                { role: "user", content: `Document analysis context: ${contextText}` },
                { role: "assistant", content: data.reply },
              ]
              setHistory(newHistory)

              // Clean up document analysis state
              setDocumentText("")
              setPhase("normal")

              console.log("🎤 Starting TTS response...")
              await speakText(data.reply, currentLang)

              // Force recognition restart after speaking with delay
              setTimeout(() => {
                console.log("🔄 Restarting recognition after document analysis")
                setRecognitionKey((k) => k + 1)
              }, 2000)
            }
          } catch (err) {
            console.error("❌ Document analysis error:", err)
            clearInterval(progressInterval)
            setAnalysisProgress(0)
            setAnalysisStage("")

            const errorMessage =
              currentLang === "hindi"
                ? "दस्तावेज़ का विश्लेषण करने में समस्या हुई। कृपया दोबारा कोशिश करें।"
                : "There was an error analyzing your document. Please try again."

            console.log("🎤 Speaking error message...")
            await speakText(errorMessage, currentLang)
            setPhase("normal")

            // Force recognition restart after error
            setTimeout(() => {
              console.log("🔄 Restarting recognition after error")
              setRecognitionKey((k) => k + 1)
            }, 2000)
          } finally {
            console.log("🏁 Cleaning up API call state")
            apiCallInProgressRef.current = false
          }
          return
        }

        // Normal conversation phase
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
      } finally {
        isProcessing = false
      }
    }

    recognition.onend = () => {
      console.log("Recognition ended, connected:", connected, "muted:", muted, "speaking:", speaking)

      // Only restart if not stopped by app and conditions are right
      if (!stoppedByApp && (connected || phase === "documentContext") && !muted && !speaking && !isProcessing) {
        // Add a longer delay before restarting to avoid rapid restarts
        setTimeout(() => {
          if (!stoppedByApp && (connected || phase === "documentContext") && !muted && !speaking && !isProcessing) {
            try {
              recognition.start()
              console.log("Recognition restarted successfully")
            } catch (e) {
              console.log("Recognition restart failed:", e)
            }
          }
        }, 1000) // Increased delay to 1 second
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
      isProcessing = false
      recognition.stop()
    }
  }, [connected, muted, recognitionKey, speaking, phase, currentLang, history, documentText])

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

  // File upload handlers
  const handleFileSelected = (file) => {
    setUploadedFile(file)
    if (file.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(file))
    } else {
      setFilePreview(file.name)
    }
    setAwaitingVoiceContext(true)
  }

  const handleStartVoiceContext = async () => {
    if (!uploadedFile) return

    setFileLoading(true)
    setAwaitingVoiceContext(false)

    // Start progress simulation
    const progressInterval = simulateAnalysisProgress()

    try {
      // First, extract text from document
      const formData = new FormData()
      formData.append("file", uploadedFile)
      formData.append("context", "initial_extraction")
      formData.append("language", currentLang || "hindi")

      const res = await fetch(`${backendBaseUrl}/upload-legal-file`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`)
      }

      const data = await res.json()

      // Clear progress
      clearInterval(progressInterval)
      setAnalysisProgress(0)
      setAnalysisStage("")

      // Store the extracted text for later analysis
      setDocumentText(data.extractedText || "Document content extracted")

      // Set phase to documentContext BEFORE speaking
      setPhase("documentContext")

      // Ask for context via voice
      const contextPrompt = documentContextPrompts[currentLang] || documentContextPrompts["hindi"]
      await speakText(contextPrompt, currentLang)

      // Ensure recognition is ready after speaking
      setTimeout(() => {
        console.log("Ensuring recognition is active for document context")
        setRecognitionKey((k) => k + 1)
      }, 1500)
    } catch (error) {
      console.error("File upload error:", error)
      clearInterval(progressInterval)
      setAnalysisProgress(0)
      setAnalysisStage("")

      const errorMessage =
        currentLang === "hindi"
          ? "दस्तावेज़ का विश्लेषण करने में समस्या हुई। कृपया दोबारा कोशिश करें।"
          : "There was an error analyzing your document. Please try again."

      await speakText(errorMessage, currentLang || "hindi")
    } finally {
      setFileLoading(false)
      handleClearFile()
    }
  }

  const handleClearFile = () => {
    setUploadedFile(null)
    setFilePreview("")
    setAwaitingVoiceContext(false)
    setFileLoading(false)
    setDocumentText("")
    setAnalysisProgress(0)
    setAnalysisStage("")
    if (phase === "documentContext") {
      setPhase("normal")
    }
  }

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
    handleClearFile() // Clear file upload state
    recognitionRef.current?.stop()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }
    setSpeaking(false)
    apiCallInProgressRef.current = false
  }

  // Improved TTS function with better audio context handling
  const speakText = async (text, langKey = currentLang || "hindi") => {
    console.log("🎤 Starting speech:", text.substring(0, 50) + "...")

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.log("Recognition stop error:", e)
      }
    }

    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.src = ""
      } catch (e) {
        console.log("Audio cleanup error:", e)
      }
    }

    try {
      // Clean text for better pronunciation
      let cleanedText = text

      // Fix number pronunciation issues
      cleanedText = cleanedText.replace(/\b1\b/g, "एक")
      cleanedText = cleanedText.replace(/\b2\b/g, "दो")
      cleanedText = cleanedText.replace(/\b3\b/g, "तीन")
      cleanedText = cleanedText.replace(/\b4\b/g, "चार")
      cleanedText = cleanedText.replace(/\b5\b/g, "पांच")
      cleanedText = cleanedText.replace(/\b6\b/g, "छह")
      cleanedText = cleanedText.replace(/\b7\b/g, "सात")
      cleanedText = cleanedText.replace(/\b8\b/g, "आठ")
      cleanedText = cleanedText.replace(/\b9\b/g, "नौ")
      cleanedText = cleanedText.replace(/\b10\b/g, "दस")

      // Remove special characters that cause pronunciation issues
      cleanedText = cleanedText.replace(/[^\w\s\u0900-\u097F\u0600-\u06FF.,!?]/g, " ")
      cleanedText = cleanedText.replace(/\s+/g, " ").trim()

      const res = await fetch(`${backendBaseUrl}/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanedText, language: langKey }),
      })

      if (!res.ok) {
        throw new Error(`TTS request failed: ${res.status}`)
      }

      const blob = await res.blob()
      const audioUrl = URL.createObjectURL(blob)

      // Create new audio element with better error handling
      const audio = new Audio()
      audioRef.current = audio

      // Set up event listeners before setting src
      audio.onended = () => {
        console.log("Audio playback ended")
        setSpeaking(false)
        setReadyToSpeak(true)
        URL.revokeObjectURL(audioUrl) // Clean up blob URL

        // Ensure recognition restarts after speaking ends - with single restart attempt
        if ((connected || phase === "documentContext") && !muted && phase !== "init") {
          console.log(`Restarting recognition after speech ended - Phase: ${phase}`)

          // Single restart attempt with longer delay
          setTimeout(() => {
            console.log("Recognition restart attempt after speech")
            setRecognitionKey((k) => k + 1)
          }, 1500)
        }
      }

      audio.onerror = (e) => {
        console.error("Audio playback error:", e)
        setSpeaking(false)
        setReadyToSpeak(true)
        URL.revokeObjectURL(audioUrl) // Clean up blob URL

        // Restart recognition even on error
        if ((connected || phase === "documentContext") && !muted && phase !== "init") {
          setTimeout(() => {
            console.log("Restarting recognition after audio error")
            setRecognitionKey((k) => k + 1)
          }, 500)
        }
      }

      audio.oncanplaythrough = () => {
        console.log("Audio can play through")
      }

      // Set audio properties
      audio.preload = "auto"
      audio.src = audioUrl

      setSpeaking(true)
      setReadyToSpeak(false)

      try {
        // Try to play with user gesture handling
        const playPromise = audio.play()

        if (playPromise !== undefined) {
          await playPromise
          console.log("Audio started playing successfully")
        }
      } catch (playError) {
        console.error("Audio play failed:", playError)

        // If autoplay fails, show user-friendly message
        if (playError.name === "NotAllowedError") {
          console.log("Autoplay prevented - user interaction required")
          // Don't show alert, just log and continue
        }

        setSpeaking(false)
        setReadyToSpeak(false)
        URL.revokeObjectURL(audioUrl)

        // Restart recognition even if audio fails
        if (connected && !muted && phase !== "init") {
          setTimeout(() => {
            console.log("Restarting recognition after audio play failure")
            setRecognitionKey((k) => k + 1)
          }, 500)
        }
      }
    } catch (error) {
      console.error("TTS error:", error)
      setSpeaking(false)
      setReadyToSpeak(false)

      // Restart recognition even on TTS error
      if (connected && !muted && phase !== "init") {
        setTimeout(() => {
          console.log("Restarting recognition after TTS error")
          setRecognitionKey((k) => k + 1)
        }, 500)
      }
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
    handleClearFile() // Clear any existing file upload state
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

  const handleNearbyAdvocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(`${backendBaseUrl}/nearby-advocate?lat=${latitude}&lng=${longitude}`)
          if (!res.ok) {
            throw new Error(`Failed to fetch advocates: ${res.status}`)
          }
          const data = await res.json()
          setAdvocates(data.advocates || [])
          setShowAdvocates(true)
          setSelectedAdvocate(null)
        } catch (e) {
          console.error("Advocates fetch error:", e)
          alert("Failed to fetch advocates. Please try again.")
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
                backgroundColor: "#000000",
              }}
            >
              <img
                src="/placeholder.svg?height=48&width=48"
                alt="Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                color: "#fff",
              }}
            >
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
              marginBottom: "2rem",
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
              {phase === "documentContext" && "📄 Waiting for document context..."}
              {!speaking &&
                !userSpeaking &&
                !readyToSpeak &&
                connected &&
                phase === "normal" &&
                "Ready for your question"}
              {!connected && "Tap the microphone to start"}
            </div>
          </div>

          {/* Document Analysis Progress Bar */}
          {(fileLoading || analysisProgress > 0) && (
            <div
              style={{
                background: "rgba(96, 165, 250, 0.1)",
                backdropFilter: "blur(20px)",
                borderRadius: "1rem",
                padding: "1.5rem",
                border: "1px solid rgba(96, 165, 250, 0.2)",
                marginBottom: "2rem",
                boxShadow: "0 8px 32px rgba(96, 165, 250, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "3px solid rgba(96, 165, 250, 0.3)",
                    borderTop: "3px solid #60a5fa",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <span
                  style={{
                    color: "#60a5fa",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  Analyzing Document
                </span>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: `${analysisProgress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)",
                    borderRadius: "4px",
                    transition: "width 0.5s ease-in-out",
                    boxShadow: "0 0 10px rgba(96, 165, 250, 0.5)",
                  }}
                />
              </div>

              {/* Progress Text */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "0.875rem",
                  }}
                >
                  {analysisStage || "Processing..."}
                </span>
                <span
                  style={{
                    color: "#60a5fa",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                  }}
                >
                  {analysisProgress}%
                </span>
              </div>
            </div>
          )}

          {/* File Upload Component */}
          <FileUpload
            onFileSelected={handleFileSelected}
            uploadedFile={uploadedFile}
            filePreview={filePreview}
            loading={fileLoading}
            awaitingVoiceContext={awaitingVoiceContext}
            onClearFile={handleClearFile}
            onStartVoiceContext={handleStartVoiceContext}
          />

          {/* Main Microphone */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "3rem" }}>
            <div style={{ position: "relative" }}>
              {/* Microphone Button */}
              <button
                onClick={connected ? handleEnd : handleConnect}
                disabled={fileLoading}
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
                  cursor: fileLoading ? "not-allowed" : "pointer",
                  outline: "none",
                  opacity: fileLoading ? 0.6 : 1,
                  boxShadow: readyToSpeak
                    ? "0 0 40px rgba(248, 113, 113, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3)"
                    : "0 8px 32px rgba(0, 0, 0, 0.3)",
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
            {fileLoading || analysisProgress > 0 ? (
              <p style={{ color: "#60a5fa", fontWeight: "500", margin: 0 }}>
                {analysisStage || "Analyzing your document..."}
              </p>
            ) : phase === "documentContext" ? (
              <p style={{ color: "#fbbf24", fontWeight: "500", margin: 0 }}>
                {/* <FaMicrophone style={{ marginRight: "0.5rem" }} /> */}
                
              </p>
            ) : connected ? (
              userSpeaking ? (
                <p style={{ color: "#f87171", fontWeight: "500", margin: 0 }}>
                  <FaMicrophone style={{ marginRight: "0.5rem" }} />
                  Speak now...
                </p>
              ) : speaking ? (
                <p style={{ color: "#60a5fa", fontWeight: "500", margin: 0 }}>Chanakya AI is speaking...</p>
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

          {/* Control Buttons */}
          {!connected ? (
            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap" }}>
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

              <button
                onClick={handleNearbyAdvocate}
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
              >
                <FaMapMarkerAlt
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    color: "#fbbf24",
                    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
                  }}
                />
                <span style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.9)", fontWeight: "500" }}>
                  Nearby Advocate
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

      {/* Glassmorphism Advocates Modal */}
      {showAdvocates && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            background: "rgba(0,0,0,0.8)",
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
              background: "rgba(17,24,39,0.9)",
              borderRadius: "1.5rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "28rem",
              maxHeight: "24rem",
              overflowY: "auto",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
            >
              <h3 style={{ margin: 0, color: "#fff" }}>Nearby Advocates</h3>
              <button
                onClick={() => {
                  setShowAdvocates(false)
                  setSelectedAdvocate(null)
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                }}
              >
                <FaTimes />
              </button>
            </div>
            {advocates.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {advocates.map((advocate, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "0.75rem",
                      padding: "0.75rem",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (userPos && advocate.lat && advocate.lng) {
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${advocate.lat},${advocate.lng}&travelmode=driving`,
                          "_blank",
                        )
                      }
                    }}
                  >
                    <div style={{ fontWeight: "500", color: "#fff" }}>{advocate.name}</div>
                    <div style={{ fontSize: "0.875rem", color: "#ccc" }}>{advocate.vicinity}</div>
                    <div style={{ fontSize: "0.85rem", color: "#a7f3d0" }}>
                      📞{" "}
                      {advocate.phone && advocate.phone !== "Not available" ? (
                        <a
                          href={`tel:${advocate.phone.replace(/[^0-9+]/g, "")}`}
                          style={{ color: "#34d399", textDecoration: "underline", fontWeight: 600 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {advocate.phone}
                        </a>
                      ) : (
                        "Not available"
                      )}
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                      <button
                        style={{
                          background: "#fbbf24",
                          color: "#2d2d2d",
                          borderRadius: "0.5rem",
                          padding: "0.25rem 0.75rem",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAdvocate(advocate)
                        }}
                      >
                        Tap for Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#aaa", padding: "2rem 0" }}>No nearby advocates found.</div>
            )}
          </div>
        </div>
      )}

      {selectedAdvocate && (
        <div
          style={{
            position: "fixed",
            inset: "0",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "60",
          }}
          onClick={() => setSelectedAdvocate(null)}
        >
          <div
            style={{
              background: "#1f2937",
              borderRadius: "1rem",
              padding: "1.5rem",
              width: "98%",
              maxWidth: "500px",
              color: "#fff",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
            >
              <h4 style={{ margin: 0 }}>{selectedAdvocate.name}</h4>
              <button
                onClick={() => setSelectedAdvocate(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                  padding: "0.5rem",
                }}
              >
                <FaTimes />
              </button>
            </div>
            <p style={{ margin: "0 0 0.5rem" }}>
              📍 <strong>Address:</strong> {selectedAdvocate.vicinity}
            </p>
            <p style={{ margin: "0 0 1rem" }}>
              📞 <strong>Phone:</strong>{" "}
              {selectedAdvocate.phone && selectedAdvocate.phone !== "Not available" ? (
                <a
                  href={`tel:${selectedAdvocate.phone.replace(/[^0-9+]/g, "")}`}
                  style={{
                    color: "#34d399",
                    textDecoration: "underline",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  {selectedAdvocate.phone}
                </a>
              ) : (
                "Not available"
              )}
            </p>

            {MAPS_EMBED_API_KEY && (
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${selectedAdvocate.lat},${selectedAdvocate.lng}&zoom=17&size=1000x700&markers=color:red%7C${selectedAdvocate.lat},${selectedAdvocate.lng}&key=${MAPS_EMBED_API_KEY}`}
                alt="Map preview"
                style={{
                  borderRadius: "0.5rem",
                  width: "100%",
                  marginBottom: "1rem",
                  display: "block",
                }}
              />
            )}

            <button
              style={{
                background: "#fbbf24",
                color: "#2d2d2d",
                borderRadius: "0.5rem",
                padding: "0.5rem 1rem",
                fontWeight: "600",
                fontSize: "0.9rem",
                border: "none",
                cursor: "pointer",
                width: "100%",
              }}
              onClick={() => {
                if (selectedAdvocate.lat && selectedAdvocate.lng) {
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAdvocate.name + ", " + selectedAdvocate.vicinity)}`,
                    "_blank",
                  )
                }
              }}
            >
              Open Directions in Google Maps
            </button>
          </div>
        </div>
      )}

      {/* Fixed WhatsApp Button */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: "60",
        }}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <a
            href="https://wa.me/ais/1435183977724162?s=5"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "3.5rem",
              height: "3.5rem",
              backgroundColor: "#25D366",
              borderRadius: "50%",
              boxShadow: "0 4px 20px rgba(37, 211, 102, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3)",
              transition: "all 0.3s ease",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.106" />
            </svg>
          </a>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
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

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
