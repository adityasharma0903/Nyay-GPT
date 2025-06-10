"use client"

const MicButton = ({ onClick, listening, speaking, active }) => {
  const getButtonText = () => {
    if (speaking) return "AI बोल रहा है..."
    if (listening) return "सुन रहा हूं..."
    if (active) return "बोलें"
    return "बात करना शुरू करें"
  }

  const getButtonClass = () => {
    let baseClass = "mic-btn"
    if (speaking) baseClass += " speaking"
    else if (listening) baseClass += " listening"
    else if (active) baseClass += " active"
    return baseClass
  }

  return (
    <button className={getButtonClass()} onClick={onClick} disabled={speaking}>
      <div className="mic-icon-container">
        <span className="mic-icon" role="img" aria-label="Mic">
          🎤
        </span>
        {listening && <div className="pulse-ring"></div>}
      </div>
      <span className="mic-label">{getButtonText()}</span>
    </button>
  )
}

export default MicButton
