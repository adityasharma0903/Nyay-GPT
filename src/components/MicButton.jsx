import React from "react";

const MicButton = ({ onClick, listening }) => (
  <button className={`mic-btn ${listening ? "active" : ""}`} onClick={onClick}>
    <span className="mic-icon" role="img" aria-label="Mic">
      🎤
    </span>
    <span className="mic-label">Speak Your Problem</span>
  </button>
);

export default MicButton;