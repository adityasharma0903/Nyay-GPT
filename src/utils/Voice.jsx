// Enhanced voice utilities for conversation flow

export const getTranscription = (language = "hi") =>
  new Promise((resolve, reject) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in your browser.")
      return resolve("")
    }

    const recognition = new SpeechRecognition()
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
                : "hi-IN"

    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    let timeoutId

    recognition.onstart = () => {
      // Set a timeout to stop recognition if no speech is detected
      timeoutId = setTimeout(() => {
        recognition.stop()
      }, 10000) // 10 seconds timeout
    }

    recognition.onresult = (event) => {
      clearTimeout(timeoutId)
      const transcript = event.results[0][0].transcript
      resolve(transcript)
    }

    recognition.onerror = (event) => {
      clearTimeout(timeoutId)
      console.error("Voice input error:", event.error)
      if (event.error === "no-speech") {
        resolve("") // Return empty string for no speech
      } else {
        reject(event.error)
      }
    }

    recognition.onend = () => {
      clearTimeout(timeoutId)
      // This will be called if no result was captured
    }

    try {
      recognition.start()
    } catch (error) {
      clearTimeout(timeoutId)
      reject(error)
    }
  })

export const textToSpeech = async (text, language = "hi") => {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis
    if (!synth) {
      resolve()
      return
    }

    // Cancel any ongoing speech
    synth.cancel()

    const utter = new window.SpeechSynthesisUtterance(text)
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
                : "hi-IN"

    utter.rate = 0.9
    utter.pitch = 1
    utter.volume = 1

    utter.onend = () => {
      resolve()
    }

    utter.onerror = () => {
      resolve()
    }

    synth.speak(utter)
  })
}

export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}
