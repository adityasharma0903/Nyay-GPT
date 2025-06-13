import { useEffect, useRef, useState } from "react";

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

const App = () => {
  const recognitionRef = useRef(null);
  const speakingRef = useRef(false);
  const isFirstRun = useRef(true);

  const [selectedLang, setSelectedLang] = useState("hindi");
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = languages[selectedLang].code;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onresult = async (event) => {
      const userSpeech = event.results[0][0].transcript;
      const newHistory = [...conversation, { role: "user", content: userSpeech }];
      setConversation(newHistory);

      const res = await fetch("http://localhost:3000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory, language: selectedLang }),
      });

      const data = await res.json();
      setConversation([...newHistory, { role: "ai", content: data.reply }]);

      // Speak AI reply
      speakText(data.reply);
    };

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      if (!speakingRef.current) recognition.start();
    };

    setTimeout(() => {
      if (isFirstRun.current) {
        speakText(languages[selectedLang].greeting);
        isFirstRun.current = false;
      }
    }, 500);
  }, [conversation, selectedLang]);

  const speakText = async (text) => {
    speakingRef.current = true;

    try {
      const res = await fetch("http://localhost:3000/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: selectedLang }),
      });

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        speakingRef.current = false;
        recognitionRef.current?.start();
      };

      audio.play();
    } catch (err) {
      console.error("TTS playback error:", err);
      speakingRef.current = false;
    }
  };

const start = () => {
  window.speechSynthesis.cancel();
  recognitionRef.current?.start();

  // 👇 Unlock audio playback by playing a silent audio first
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createBufferSource();
  source.buffer = audioCtx.createBuffer(1, 1, 22050);
  source.connect(audioCtx.destination);
  source.start();
};


const stop = () => {
  recognitionRef.current?.stop();
  window.speechSynthesis.cancel();

  // 👇 Stop any playing audio
  const audios = document.getElementsByTagName("audio");
  for (let audio of audios) {
    audio.pause();
    audio.src = "";
  }

  speakingRef.current = false;
};


  return (
    <div style={styles.container}>
      <h1>🧠 न्याय GPT</h1>

      <label htmlFor="lang" style={{ fontSize: "18px" }}>🌐 भाषा चुनें:</label>
      <select
        id="lang"
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
        style={styles.dropdown}
      >
        {Object.keys(languages).map((langKey) => (
          <option key={langKey} value={langKey}>
            {languages[langKey].greeting.split("!")[0]}
          </option>
        ))}
      </select>

      <div>
        <button onClick={start} style={styles.button}>🎤 Start</button>
        <button onClick={stop} style={{ ...styles.button, backgroundColor: "#ff4d4d" }}>🛑 Stop</button>
      </div>
    </div>
  );
};

const styles = {
  container: { textAlign: "center", marginTop: "40px", fontFamily: "Arial" },
  button: {
    padding: "12px 24px",
    margin: "10px",
    fontSize: "16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  dropdown: {
    margin: "10px",
    padding: "8px",
    fontSize: "16px",
    borderRadius: "6px",
  },
};

export default App;
