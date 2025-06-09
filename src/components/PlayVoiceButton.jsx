import React from "react";

const PlayVoiceButton = ({ onPlay, audioUrl }) => (
  <div>
    <button className="play-voice-btn" onClick={onPlay}>
      Play Voice
    </button>
    {audioUrl && (
      <audio controls src={audioUrl} autoPlay style={{ display: "block", marginTop: 8 }} />
    )}
  </div>
);

export default PlayVoiceButton;