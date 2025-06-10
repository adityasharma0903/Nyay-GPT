import VoiceConversation from "./VoiceConversation"

const MikeChat = ({ language, setLanguage }) => {
  return (
    <div className="mike-chat-container">
      <div className="mike-chat-header">
        <h1>Mike - Legal Voice Assistant</h1>
        <p>Get legal advice through natural voice conversation</p>
      </div>
      <VoiceConversation language={language} setLanguage={setLanguage} />
    </div>
  )
}

export default MikeChat
