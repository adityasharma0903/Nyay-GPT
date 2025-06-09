import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MicButton from "./MicButton";
import VoiceWaveAnimation from "./VoiceWaveAnimation";
import { getTranscription } from "../utils/voice";

const Home = ({ language }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const navigate = useNavigate();

  const handleMic = async () => {
    setListening(true);
    const text = await getTranscription(language);
    setTranscript(text);
    setListening(false);
  };

  const handleSubmit = () => {
    if (transcript.length > 0) {
      // Pass transcript to result page (use context or query)
      navigate("/result", { state: { transcript, language } });
    }
  };

  return (
    <div className="home-page">
      <h2 className="prompt-text">
        {language === "hi" ? "अपनी समस्या बोलें" : "Speak your problem"}
      </h2>
      <MicButton onClick={handleMic} listening={listening} />
      {listening && <VoiceWaveAnimation />}
      {transcript && (
        <div className="transcript-box">
          <p>{transcript}</p>
        </div>
      )}
      <button className="submit-btn" onClick={handleSubmit} disabled={!transcript}>
        {language === "hi" ? "जमा करें" : "Submit"}
      </button>
      <div className="quick-links">
        <button onClick={() => navigate("/fake-check")}>Check WhatsApp Forward</button>
        <button onClick={() => navigate("/form")}>Auto-fill RTI/FIR Form</button>
      </div>
    </div>
  );
};

export default Home;