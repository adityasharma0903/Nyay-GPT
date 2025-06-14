import { useEffect, useRef, useState } from "react";
import "./AppUI.css";

const languages = {
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

export default function App() {
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

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

  // Speech recognition logic
  useEffect(() => {
    if (!connected) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = languages.hindi.code;
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = async (event) => {
      if (muted) return;
      setSpeaking(true);

      const userSpeech = event.results[event.results.length - 1][0].transcript;
      console.log("🗣️ Detected speech:", userSpeech);

      try {
        const res = await fetch("http://localhost:3000/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: [{ role: "user", content: userSpeech }],
          }),
        });

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        const data = await res.json();
        console.log("AI Reply:", data.reply);
        speakText(data.reply);
      } catch (err) {
        console.error("Fetch error:", err.message);
      }
    };

    recognition.onend = () => {
      if (connected && !muted) recognition.start();
    };

    recognitionRef.current = recognition;
    if (!muted) recognition.start();

    return () => recognition.stop();
  }, [connected, muted]);

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
    recognitionRef.current?.stop();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  };

  // Greet and TTS logic
  const speakText = async (text) => {
    setSpeaking(true);
    recognitionRef.current?.stop();
    try {
      const res = await fetch("http://localhost:3000/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: "hindi" }),
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
    } catch {
      setSpeaking(false);
      if (connected && !muted) recognitionRef.current?.start();
    }
  };

  // Connect button
  const handleConnect = () => {
    setConnected(true);
    setMuted(false);
    speakText(languages.hindi.greeting);
  };

  // Timer formatting
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
        <div className={`ai-agent-waves${speaking && !muted ? " speaking" : ""}`}>
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
