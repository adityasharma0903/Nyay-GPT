import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Timeline from "./Timeline";
import PDFDownloadButton from "./PDFDownloadButton";
import WhatsAppButton from "./WhatsAppButton";
import PlayVoiceButton from "./PlayVoiceButton";
import { getLegalAdvice, getTimeline } from "../utils/language";
import { textToSpeech } from "../utils/voice";

const Result = ({ language }) => {
  const { state } = useLocation();
  const { transcript } = state || {};
  const [advice, setAdvice] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (transcript) {
      setAdvice(getLegalAdvice(transcript, language));
      setTimeline(getTimeline(transcript, language));
      setAudioUrl(""); // Reset audio
    }
  }, [transcript, language]);

  // Automatically speak the advice when it changes and is not empty
  useEffect(() => {
    if (advice) {
      textToSpeech(advice, language);
    }
  }, [advice, language]);

  const handlePlay = async () => {
    const url = await textToSpeech(advice, language);
    setAudioUrl(url);
  };

  if (!transcript) {
    return (
      <div>
        <h2>No problem described. Go back to Home.</h2>
        <button onClick={() => navigate("/")}>Back</button>
      </div>
    );
  }

  return (
    <div className="result-page">
      <h2>Legal Advice</h2>
      <div className="advice-box">{advice}</div>
      <Timeline steps={timeline} />
      <div className="action-buttons">
        <PDFDownloadButton transcript={transcript} advice={advice} />
        <WhatsAppButton transcript={transcript} advice={advice} />
        <PlayVoiceButton onPlay={handlePlay} audioUrl={audioUrl} />
      </div>
      <button className="back-btn" onClick={() => navigate("/")}>Back</button>
    </div>
  );
};

export default Result;