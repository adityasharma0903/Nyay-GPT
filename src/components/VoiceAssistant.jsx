import { useState, useRef, useCallback } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaPhone, FaPhoneSlash } from 'react-icons/fa';
import './VoiceAgentUI.css';

function useSpeechRecognition() {
  const recognitionRef = useRef(null);
  const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  const getRecognition = () => {
    if (!isSupported) return null;
    if (recognitionRef.current) return recognitionRef.current;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    return recognition;
  };

  const startListening = useCallback((language, onResult, onEnd) => {
    const recognition = getRecognition();
    if (!recognition) return;

    recognition.lang = { hindi: 'hi-IN', tamil: 'ta-IN', english: 'en-US' }[language] || 'hi-IN';
    recognition.onresult = (event) => onResult(event.results[0][0].transcript);
    recognition.onend = () => onEnd?.();
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      onEnd?.();
    };

    try { recognition.start(); } catch {}
  }, [isSupported]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) { try { recognition.stop(); } catch {} }
  }, []);

  return { startListening, stopListening, isSupported };
}

export default function VoiceAssistant() {
  const [state, setState] = useState({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isMuted: true,
    selectedLanguage: null,
    sessionTimer: 0,
    conversation: [],
    status: 'प्रारंभ करने के लिए तैयार',
    statusType: 'disconnected'
  });

  const timerRef = useRef(null);
  const isSpeakingRef = useRef(false);
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

  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;

  const getStatusVariant = () => ({
    ready:'success', listening:'primary', speaking:'warning',
    processing:'info', error:'danger', disconnected:'secondary'
  }[state.statusType] || 'secondary');

  const safeStopListening = useCallback(() => {
    try { stopListening(); } catch {}
    window.speechSynthesis.cancel();
  }, [stopListening]);

  const detectLanguageFromSpeech = useCallback((text) => {
    const t = text.toLowerCase();
    if (t.includes('hindi') || t.includes('हिंदी') || t.includes('हिन्दी')) return 'hindi';
    if (t.includes('tamil') || t.includes('தமிழ்') || t.includes('तमिल')) return 'tamil';
    if (t.includes('english') || t.includes('अंग्रेजी') || t.includes('इंग्लिश')) return 'english';
    return null;
  }, []);

  const startListeningLoop = useCallback(() => {
    if (!state.isConnected || state.isMuted || state.isSpeaking || isSpeakingRef.current) return;

    setState(prev => ({ ...prev, isListening: true }));
    updateStatus('सुन रहा हूँ...', 'listening');

    startListening(state.selectedLanguage || 'hindi', async (transcript) => {
      const lang = detectLanguageFromSpeech(transcript);
      if (!state.selectedLanguage && lang) {
        speakText({
          hindi:'हिंदी चुनी गई। अब आप प्रश्न पूछें।',
          tamil:'தமிழ் தேர்ந்தெடுக்கப்பட்டது. உங்கள் கேள்வியை கேளுங்கள்.',
          english:'English selected. Please ask your question.'
        }[lang], lang);
        setState(prev => ({ ...prev, selectedLanguage: lang }));
      }
    }, () => {
      setState(prev => ({ ...prev, isListening: false }));
    });
  }, [state.isConnected, state.selectedLanguage, state.isSpeaking, state.isMuted, startListening, detectLanguageFromSpeech, updateStatus]);

  const speakText = useCallback((text, language='hindi') => {
    safeStopListening();
    setState(prev => ({ ...prev, isMuted: true, isSpeaking: true }));
    isSpeakingRef.current = true;
    updateStatus('बोल रहा हूँ...', 'speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = { hindi:'hi-IN', tamil:'ta-IN', english:'en-US' }[language] || 'hi-IN';

    utterance.onend = () => {
      isSpeakingRef.current = false;
      updateStatus('सुनने के लिए तैयार', 'ready');
      setTimeout(() => {
        setState(prev => ({ ...prev, isSpeaking: false, isMuted: false }));
        startListeningLoop(); // mic ON only after AI speech + 2 sec
      }, 2000);
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setState(prev => ({ ...prev, isSpeaking: false, isMuted: false }));
      updateStatus('बोलने में त्रुटि', 'error');
    };

    window.speechSynthesis.speak(utterance);
  }, [safeStopListening, updateStatus, startListeningLoop]);

  const startSession = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ audio:true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        setState(prev => ({ ...prev, isConnected:true }));
        updateStatus('कनेक्ट हो रहा...', 'ready');
        startTimer();
        speakText('नमस्ते! मैं न्याय GPT हूँ। कृपया भाषा चुनें - हिंदी, तमिल या अंग्रेजी कहें।', 'hindi');
      })
      .catch(err => { alert('Please allow microphone access.'); updateStatus('माइक्रोफोन की अनुमति चाहिए', 'error'); });

  }, [startTimer, speakText, updateStatus]);

  const endSession = useCallback(() => {
    stopListening();
    window.speechSynthesis.cancel();
    stopTimer();
    setState(prev => ({ ...prev, isConnected:false, isListening:false, isSpeaking:false, selectedLanguage:null, conversation:[] }));
    updateStatus('सत्र समाप्त','disconnected');
  }, [stopListening, stopTimer, updateStatus]);

  const handleMicClick = useCallback(() => {
    if (state.isSpeaking) return;
    if (state.isMuted) {
      navigator.mediaDevices.getUserMedia({ audio:true })
        .then(stream => {
          stream.getTracks().forEach(track=>track.stop());
          setState(prev=>({ ...prev, isMuted:false }));
          startListeningLoop();
        })
        .catch(err=>{ alert('Please allow microphone access.'); updateStatus('माइक्रोफोन की अनुमति चाहिए','error'); });
    } else {
      setState(prev=>({ ...prev, isMuted:true }));
      stopListening();
    }
  }, [state.isSpeaking, startListeningLoop, stopListening, updateStatus]);

  if (!isSupported) {
    return <div className="ai-agent-ui-container">
      <h4 style={{color:"#e53e3e", textAlign:"center", marginTop:120}}>
        ⚠ Speech Recognition not supported in your browser
      </h4>
    </div>;
  }

  return (
    <div className="ai-agent-ui-container">
      <div className="status-bar-ui">
        <span>2:04</span>
        <div className="status-icons">
          <span className="status-icon"/>
          <span className="status-icon"/>
          <span className="status-battery"/>
        </div>
      </div>
      <div className="ai-avatar-ui"><span>AI</span></div>
      <div className="ai-agent-title">CS AI Agent</div>
      <div className="ai-agent-subtitle">Voice-enabled AI Agent</div>
      <div style={{marginBottom:18,color:"#bdbdbd",fontSize:15}}>
        Status: <span className={`ai-agent-badge ai-agent-badge-${getStatusVariant()}`}>{state.status}</span>
        <span style={{marginLeft:10}}>Time: {formatTime(state.sessionTimer)}</span>
      </div>
      <div className="ai-agent-btn-row">
        <button className="ai-agent-btn mic" onClick={handleMicClick} title={state.isMuted?"Unmute":"Mute"} disabled={state.isSpeaking}>
          {state.isMuted?<FaMicrophoneSlash/>:<FaMicrophone/>}
        </button>
        <button className="ai-agent-btn call" onClick={state.isConnected?endSession:startSession} title={state.isConnected?"End Session":"Start Session"}>
          {state.isConnected?<FaPhoneSlash/>:<FaPhone/>}
        </button>
      </div>
    </div>
  );
}
