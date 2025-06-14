import { useEffect, useRef, useState } from "react";
import "./AppUI.css";

// 1. Supported Languages & Greetings
const languages = {
  english:   { code: "en-IN", greeting: "Hello! I’m Nyay GPT — your AI legal assistant. Feel free to ask me any legal question." },
  hindi:     { code: "hi-IN", greeting: "नमस्ते! मैं न्याय GPT हूँ। आप मुझसे कोई भी कानूनी सवाल पूछ सकते हैं।" },
  punjabi:   { code: "pa-IN", greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਨਿਆਂ GPT ਹਾਂ। ਤੁਸੀਂ ਮੈਨੂੰ ਕੋਈ ਵੀ ਕਾਨੂੰਨੀ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ।" },
  tamil:     { code: "ta-IN", greeting: "வணக்கம்! நான் நியாய GPT. நீங்கள் என்னிடம் எந்தவொரு சட்டக் கேள்வியும் கேட்கலாம்." },
  marathi:   { code: "mr-IN", greeting: "नमस्कार! मी न्याय GPT आहे. तुम्ही मला कोणताही कायदेशीर प्रश्न विचारू शकता." },
  telugu:    { code: "te-IN", greeting: "నమస్తే! నేను న్యాయ GPT. మీరు నన్ను ఎలాంటి చట్ట సంబంధిత ప్రశ్నలైనా అడగవచ్చు." },
  bengali:   { code: "bn-IN", greeting: "নমস্কার! আমি ন্যায় GPT। আপনি আমাকে যেকোনো আইনি প্রশ্ন করতে পারেন।" },
  kannada:   { code: "kn-IN", greeting: "ನಮಸ್ಕಾರ! ನಾನು ನ್ಯಾಯ GPT. ನೀವು ನನಗೆ ಯಾವುದೇ ಕಾನೂನು ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು." },
  malayalam: { code: "ml-IN", greeting: "നമസ്കാരം! ഞാൻ ന്യായ GPT. നിങ്ങൾക്ക് എനിക്ക് നിയമപരമായ ചോദ്യങ്ങൾ ചോദിക്കാം." },
  gujarati:  { code: "gu-IN", greeting: "નમસ્તે! હું ન્યાય GPT છું. તમે મને કોઈ પણ કાનૂની પ્રશ્ન પૂછો." },
  urdu:      { code: "ur-IN", greeting: "السلام علیکم! میں نیاۓ GPT ہوں، آپ مجھ سے کوئی بھی قانونی سوال پوچھ سکتے ہیں۔" },
  odia:      { code: "or-IN", greeting: "ନମସ୍କାର! ମୁଁ ନ୍ୟାୟ GPT। ଆପଣ ମୋତେ କୌଣସି ଆଇନିକ ପ୍ରଶ୍ନ ପଚାରିପାରିବେ।" },
};

// 2. Keywords for Speech Detection in Multiple Scripts (Add as many variants as you like)
const languageKeywords = {
  english:   ["english", "इंग्लिश", "अंग्रेजी"],
  hindi:     ["hindi", "हिंदी"],
  punjabi:   ["punjabi", "ਪੰਜਾਬੀ", "पंजाबी"],
  tamil:     ["tamil", "तमिल"],
  marathi:   ["marathi", "मराठी"],
  telugu:    ["telugu", "तेलुगू"],
  bengali:   ["bengali", "বেঙ্গলি", "बंगाली"],
  kannada:   ["kannada", "ಕನ್ನಡ", "कन्नड़", "कन्नड"],
  malayalam: ["malayalam", "മലയാളം", "मलयालम"],
  gujarati:  ["gujarati", "ગુજરાતી", "गुजराती"],
  urdu:      ["urdu", "اردو", "उर्दू"],
  odia:      ["odia", "odiya", "ଓଡ଼ିଆ", "ओड़िया"],
};

export default function App() {
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false); // AI speaking
  const [userSpeaking, setUserSpeaking] = useState(false); // User speaking (for waveform)
  const [timer, setTimer] = useState(0);
  const [currentLang, setCurrentLang] = useState("hindi"); // Default: Hindi
  const [langSelected, setLangSelected] = useState(false); // LOCKED after first selection
  const [recognitionKey, setRecognitionKey] = useState(0); // for force re-creation
  const [history, setHistory] = useState([]); // To store conversation history

  const timerRef = useRef(null);
  const utteranceIdRef = useRef(0); // For reliable barge-in

  // Timer logic
  useEffect(() => {
    if (connected) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      setTimer(0);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [connected]);

  // Speech recognition & logic
  useEffect(() => {
    if (!connected) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = languages[currentLang].code;
    recognition.continuous = true;
    recognition.interimResults = false;

    let stoppedByApp = false;

    recognition.onresult = async (event) => {
      if (muted) return;
      setUserSpeaking(true);
      setTimeout(() => setUserSpeaking(false), 1200);

      // === Barge-in: Interrupt AI speaking if user starts talking ===
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setSpeaking(false);

      utteranceIdRef.current += 1;
      const thisUtterance = utteranceIdRef.current;

      const userSpeech = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("🗣️ Detected speech:", userSpeech);

      // --- Language Selection Phase (ONLY AT START) ---
      if (!langSelected) {
        let detectedLang = null;
        Object.keys(languageKeywords).forEach((lang) => {
          languageKeywords[lang].forEach(keyword => {
            if (userSpeech.includes(keyword)) {
              detectedLang = lang;
            }
          });
        });
        if (detectedLang) {
          setCurrentLang(detectedLang);
          setLangSelected(true); // LOCK language selection now!
          setRecognitionKey((k) => k + 1); // re-mount for new lang
          setHistory([]); // reset history on new language
          await speakText(languages[detectedLang].greeting, detectedLang);
          return;
        } else {
          await speakText(
            "कृपया अपनी पसंदीदा भाषा का नाम बताएं। For example: English, Hindi, Tamil, etc.",
            "hindi"
          );
          return;
        }
      }

      // --- Normal Conversation Phase ---
      setSpeaking(true);
      // Add user utterance to history
      const newHistory = [...history, { role: "user", content: userSpeech }];
      setHistory(newHistory);

      try {
        // SEND TO CONTEXTUAL ENDPOINT
        const res = await fetch("http://localhost:3000/ask-context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: newHistory,
            language: currentLang,
          }),
        });

        if (!res.ok) throw new Error(`Server responded with ${res.status}`);

        const data = await res.json();
        console.log("AI Reply:", data.reply);

        // Speak only if this is the latest user request
        if (utteranceIdRef.current === thisUtterance) {
          setHistory(h => [...h, { role: "assistant", content: data.reply }]);
          await speakText(data.reply, currentLang);
        }
      } catch (err) {
        console.error("Fetch error:", err.message);
        setSpeaking(false);
      }
    };

    recognition.onend = () => {
      if (connected && !muted && !stoppedByApp) recognition.start();
    };

    recognitionRef.current = recognition;
    if (!muted && !speaking) recognition.start();

    return () => {
      stoppedByApp = true;
      recognition.stop();
    };
    // eslint-disable-next-line
  }, [connected, muted, currentLang, langSelected, recognitionKey, speaking, history]);

  // Mute/unmute logic
  const handleMute = () => {
    setMuted((m) => !m);
    if (!muted) recognitionRef.current?.stop();
    else recognitionRef.current?.start();
  };

  // End chat logic
  const handleEnd = () => {
    setConnected(false);
    setMuted(false);
    setLangSelected(false); // Reset language selection for next session
    setCurrentLang("hindi"); // reset to Hindi on end
    setHistory([]); // clear conversation
    recognitionRef.current?.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  };

  // Greet and TTS logic with language param
  const speakText = async (text, langKey = currentLang) => {
    setSpeaking(true);
    recognitionRef.current?.stop();
    try {
      const res = await fetch("http://localhost:3000/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: langKey }),
      });
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeaking(false);
        if (connected && !muted) recognitionRef.current?.start();
      };
      audio.play();
      // Resume recognition even while TTS is playing (if browser allows)
      if (connected && !muted && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch(e) {}
      }
    } catch {
      setSpeaking(false);
      if (connected && !muted) recognitionRef.current?.start();
    }
  };

  // Connect button: Play language selection prompt
  const handleConnect = async () => {
    setConnected(true);
    setMuted(false);
    setLangSelected(false); // Always reset language selection for new session
    setCurrentLang("hindi"); // default for recognition
    setRecognitionKey((k) => k + 1);
    setHistory([]); // clear conversation
    await speakText(
      "कृपया अपनी पसंदीदा भाषा का नाम बताएं। For example: English, Hindi, Tamil, etc.",
      "hindi"
    );
  };

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

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
        <button className="ai-premium-call-btn" onClick={handleConnect}>
          <span className="ai-call-icon" />
        </button>
      ) : (
        <div className="ai-agent-btn-row-premium">
          <button className={`ai-mute-btn${muted ? " muted" : ""}`} onClick={handleMute}>
            <span className={`ai-mic-icon${muted ? " off" : ""}`} />
            <div>Mute</div>
          </button>
          <button className="ai-end-btn" onClick={handleEnd}>
            <span className="ai-end-icon" />
            <div>End</div>
          </button>
        </div>
      )}
    </div>
  );
}