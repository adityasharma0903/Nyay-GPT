import { useState, useRef, useCallback } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaPhone, FaPhoneSlash } from 'react-icons/fa';
import './VoiceAgentUI.css';

function useSpeechRecognition() {
  const recognitionRef = useRef(null);
  const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  const startListening = useCallback((language, onResult, onEnd) => {
    if (!isSupported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = {
      hindi: 'hi-IN',
      tamil: 'ta-IN',
      english: 'en-US'
    }[language] || 'hi-IN';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      onEnd?.();
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      recognitionRef.current = null;
      onEnd?.();
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  return { startListening, stopListening, isSupported };
}

export default function VoiceAssistant() {
  const [state, setState] = useState({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isMuted: false,
    selectedLanguage: null,
    sessionTimer: 0,
    conversation: [],
    status: 'प्रारंभ करने के लिए तैयार',
    statusType: 'disconnected'
  });

  const timerRef = useRef(null);
  const { startListening, stopListening, isSupported } = useSpeechRecognition();

  const updateStatus = useCallback((status, statusType) => {
    setState(prev => ({ ...prev, status, statusType }));
  }, []);

  const startTimer = useCallback(() => {
    let seconds = 0;
    timerRef.current = setInterval(() => {
      seconds++;
      setState(prev => ({ ...prev, sessionTimer: seconds }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setState(prev => ({ ...prev, sessionTimer: 0 }));
  }, []);

  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  const getStatusVariant = () => ({
    ready: 'success',
    listening: 'primary',
    speaking: 'warning',
    processing: 'info',
    error: 'danger',
    disconnected: 'secondary'
  }[state.statusType] || 'secondary');

  const speakText = useCallback((text, language = 'hindi') => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      setState(prev => ({ ...prev, isSpeaking: true }));
      updateStatus('बोल रहा हूँ...', 'speaking');

      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = {
        hindi: 'hi-IN',
        tamil: 'ta-IN',
        english: 'en-US'
      }[language] || 'hi-IN';

      utterance.onend = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        updateStatus('सुनने के लिए तैयार', 'ready');
        resolve();
      };

      utterance.onerror = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        updateStatus('बोलने में त्रुटि', 'error');
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, [updateStatus]);

  const detectLanguageFromSpeech = useCallback((text) => {
    const t = text.toLowerCase();
    if (t.includes('hindi') || t.includes('हिंदी') || t.includes('हिन्दी')) return 'hindi';
    if (t.includes('tamil') || t.includes('தமிழ்') || t.includes('तमिल')) return 'tamil';
    if (t.includes('english') || t.includes('अंग्रेजी') || t.includes('इंग्लिश')) return 'english';
    return null;
  }, []);

  const startListeningLoop = useCallback(() => {
    if (!state.isConnected || state.isMuted || state.isSpeaking) return;
    setState(prev => ({ ...prev, isListening: true }));
    updateStatus('सुन रहा हूँ...', 'listening');

    startListening(state.selectedLanguage || 'hindi', async (transcript) => {
      const lang = detectLanguageFromSpeech(transcript);
      if (!state.selectedLanguage && lang) {
        await speakText({
          hindi: 'हिंदी चुनी गई। अब आप प्रश्न पूछें।',
          tamil: 'தமிழ் தேர்ந்தெடுக்கப்பட்டது. உங்கள் கேள்வியை கேளுங்கள்.',
          english: 'English selected. Please ask your question.'
        }[lang], lang);
        setState(prev => ({ ...prev, selectedLanguage: lang }));
        setTimeout(() => startListeningLoop(), 500);
        return;
      }
    }, () => {
      setState(prev => ({ ...prev, isListening: false }));
      if (state.isConnected && !state.isSpeaking) {
        setTimeout(() => startListeningLoop(), 1000);
      }
    });
  }, [state.isConnected, state.selectedLanguage, state.isSpeaking, state.isMuted, startListening, detectLanguageFromSpeech, speakText, updateStatus]);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      updateStatus('माइक्रोफोन की अनुमति चाहिए', 'error');
      return false;
    }
  }, [updateStatus]);

  const startSession = useCallback(async () => {
    if (!(await requestMicrophonePermission())) {
      alert('Please allow microphone access.');
      return;
    }
    setState(prev => ({ ...prev, isConnected: true }));
    updateStatus('कनेक्ट हो रहा...', 'ready');
    startTimer();
    await speakText('नमस्ते! मैं न्याय GPT हूँ। कृपया भाषा चुनें - हिंदी, तमिल या अंग्रेजी कहें।', 'hindi');
    setTimeout(() => startListeningLoop(), 1000);
  }, [requestMicrophonePermission, updateStatus, startTimer, speakText, startListeningLoop]);

  const endSession = useCallback(() => {
    stopListening();
    window.speechSynthesis.cancel();
    stopTimer();
    setState(prev => ({ ...prev, isConnected: false, isListening: false, isSpeaking: false, selectedLanguage: null, conversation: [] }));
    updateStatus('सत्र समाप्त', 'disconnected');
  }, [stopListening, stopTimer, updateStatus]);

  if (!isSupported) {
    return (
      <div className="ai-agent-ui-container">
        <h4 style={{ color: "#e53e3e", textAlign: "center", marginTop: "120px" }}>
          ⚠ Speech Recognition not supported in your browser
        </h4>
      </div>
    );
  }

  return (
    <div className="ai-agent-ui-container">
      <div className="status-bar-ui">
        <span>2:04</span>
        <div className="status-icons">
          <span className="status-icon" />
          <span className="status-icon" />
          <span className="status-battery" />
        </div>
      </div>
      <div className="ai-avatar-ui">
        <span>AI</span>
      </div>
      <div className="ai-agent-title">CS AI Agent</div>
      <div className="ai-agent-subtitle">Voice-enabled AI Agent</div>
      <div style={{ marginBottom: 18, color: "#bdbdbd", fontSize: 15 }}>
        Status: <span className={`ai-agent-badge ai-agent-badge-${getStatusVariant()}`}>{state.status}</span>
        <span style={{ marginLeft: 10 }}>Time: {formatTime(state.sessionTimer)}</span>
      </div>
      <div className="ai-agent-btn-row">
        <button
          className="ai-agent-btn mic"
          onClick={() => setState(p => ({ ...p, isMuted: !p.isMuted }))}
          title={state.isMuted ? "Unmute" : "Mute"}
        >
          {state.isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
        </button>
        <button
          className="ai-agent-btn call"
          onClick={state.isConnected ? endSession : startSession}
          title={state.isConnected ? "End Session" : "Start Session"}
        >
          {state.isConnected ? <FaPhoneSlash /> : <FaPhone />}
        </button>
      </div>
    </div>
  );
}