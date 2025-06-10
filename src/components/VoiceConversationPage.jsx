import VoiceConversation from "./VoiceConversation"
import "../styles/VoiceConversation.css"

const VoiceConversationPage = ({ language }) => {
  return (
    <div className="voice-conversation-page">
      <div className="page-header">
        <h1>AI Legal Assistant</h1>
        <p>Have a natural conversation with your AI legal advisor</p>
      </div>
      <VoiceConversation language={language} />
    </div>
  )
}

export default VoiceConversationPage
