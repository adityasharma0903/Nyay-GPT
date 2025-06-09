// Use Web Speech API for real voice input and output

export const getTranscription = (language = "hi") =>
  new Promise((resolve, reject) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in your browser.");
      return resolve(""); // fallback
    }

    const recognition = new SpeechRecognition();
    recognition.lang =
      language === "hi"
        ? "hi-IN"
        : language === "en"
        ? "en-US"
        : language === "ta"
        ? "ta-IN"
        : language === "bn"
        ? "bn-IN"
        : language === "mr"
        ? "mr-IN"
        : "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = function (event) {
      alert("Voice input error: " + event.error);
      reject(event.error);
    };

    recognition.onend = function () {
      // If nothing recognized, resolve empty
      resolve("");
    };

    recognition.start();
  });

// Voice output (Speech Synthesis)
export const textToSpeech = async (text, language = "hi") => {
  const synth = window.speechSynthesis;
  if (!synth) return;
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.lang =
    language === "hi"
      ? "hi-IN"
      : language === "en"
      ? "en-US"
      : language === "ta"
      ? "ta-IN"
      : language === "bn"
      ? "bn-IN"
      : language === "mr"
      ? "mr-IN"
      : "hi-IN";
  synth.speak(utter);
};