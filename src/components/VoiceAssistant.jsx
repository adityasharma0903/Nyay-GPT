import { useState, useRef, useCallback } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaPhone, FaPhoneSlash } from 'react-icons/fa';
import './VoiceAgentUI.css';

function useSpeechRecognition() {
  const recognitionRef = useRef<any>(null);
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

  const startListening = useCallback((language: string, onResult: (text: string) => void, onEnd?: () => void) => {
    const recognition = getRecognition();
    if (!recognition) return;

    recognition.lang = {
      hindi: 'hi-IN',
      tamil: 'ta-IN',
      english: 'en-US'
    }[language] || 'hi-IN';

    recognition.onresult = (event: any) => onResult(event.results[0][0].transcript);
    recognition.onend = () => onEnd?.();
    recognition.onerror = (event: any) => {
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
    selectedLanguage: null as null | string,
    sessionTimer: 0,
    conversation: [] as Array<{ sender: string, text: string }>,
    status: 'प्रारंभ करने के लिए तैयार',
    statusType: 'disconnected',
    micForceHoldOff: false // <--- NEW STATE to strictly enforce mic-off
  });

  const timerRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);
  const { startListening, stopListening, isSupported } = useSpeechRecognition();

  const updateStatus = useCallback((status: string, statusType: string) => {
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

  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;

  const getStatusVariant = () => ({
    ready:'success', listening:'primary', speaking:'warning',
    processing:'info', error:'danger', disconnected:'secondary'
  }[state.statusType] || 'secondary');

  const safeStopListening = useCallback(() => {
    try { stopListening(); } catch {}
    window.speechSynthesis.cancel();
  }, [stopListening]);

  // --- MAIN LOGIC: Mic OFF during AI speech + hard lock ---
  const speakText = useCallback((text: string, language: string = 'hindi') => {
    safeStopListening();
    setState(prev => ({
      ...prev,
      isMuted: true,
      isSpeaking: true,
      micForceHoldOff: true // <--- lock mic so gestures can't override
    }));
    isSpeakingRef.current = true;
    updateStatus('बोल रहा हूँ...', 'speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = { hindi:'hi-IN', tamil:'ta-IN', english:'en-US' }[language] || 'hi-IN';

    utterance.onend = () => {
      isSpeakingRef.current = false;
      updateStatus('सुनने के लिए तैयार', 'ready');
      // --- 2 sec delay before mic can be enabled ---
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isSpeaking: false,
          isMuted: false,
          micForceHoldOff: false // <--- release lock so mic can be triggered/listening starts
        }));
        startListeningLoop(); // mic ON after AI speech + 2s
      }, 2000);
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        isMuted: false,
        micForceHoldOff: false
      }));
      updateStatus('बोलने में त्रुटि', 'error');
    };

    window.speechSynthesis.speak(utterance);
  }, [safeStopListening, updateStatus]);

  const detectLanguageFromSpeech = useCallback((text: string) => {
    const t = text.toLowerCase();
    if (t.includes('hindi') || t.includes('हिंदी') || t.includes('हिन्दी')) return 'hindi';
    if (t.includes('tamil') || t.includes('தமிழ்') || t.includes('तमिल')) return 'tamil';
    if (t.includes('english') || t.includes('अंग्रेजी') || t.includes('इंग्लिश')) return 'english';
    return null;
  }, []);

  // --- Listen only if mic is ON and AI is NOT speaking and not force-held-off ---
  const startListeningLoop = useCallback(() => {
    if (
      !state.isConnected ||
      state.isMuted ||
      state.isSpeaking ||
      isSpeakingRef.current ||
      state.micForceHoldOff // <--- HARD BLOCK
    ) return;

    setState(prev => ({ ...prev, isListening: true }));
    updateStatus('सुन रहा हूँ...', 'listening');

    startListening(state.selectedLanguage || 'hindi', async (transcript: string) => {
      // GUARD: Ignore input if mic is off, AI is speaking, or force-hold-mic-off
      if (
        state.isMuted ||
        state.isSpeaking ||
        isSpeakingRef.current ||
        state.micForceHoldOff
      ) return;

      // Language selection
      const lang = detectLanguageFromSpeech(transcript);
      if (!state.selectedLanguage && lang) {
        speakText({
          hindi:'हिंदी चुनी गई। अब आप प्रश्न पूछें।',
          tamil:'தமிழ் தேர்ந்தெடுக்கப்பட்டது. உங்கள் கேள்வியை கேளுங்கள்.',
          english:'English selected. Please ask your question.'
        }[lang], lang);
        setState(prev => ({ ...prev, selectedLanguage: lang }));
        return;
      }
      // Add user message
      setState(prev => ({
        ...prev,
        conversation: [...prev.conversation, { sender: 'user', text: transcript }]
      }));

      // Simulate AI answer
      let aiAnswer = 'आपका सवाल मिला है: ' + transcript;
      if (state.selectedLanguage === 'english') aiAnswer = 'Received your question: ' + transcript;
      if (state.selectedLanguage === 'tamil') aiAnswer = 'உங்கள் கேள்வி கிடைத்தது: ' + transcript;

      setState(prev => ({
        ...prev,
        conversation: [...prev.conversation, { sender: 'ai', text: aiAnswer }]
      }));

      speakText(aiAnswer, state.selectedLanguage || 'hindi');
    }, () => {
      setState(prev => ({ ...prev, isListening: false }));
    });
  }, [
    state.isConnected,
    state.selectedLanguage,
    state.isSpeaking,
    state.isMuted,
    state.micForceHoldOff,
    startListening,
    detectLanguageFromSpeech,
    speakText,
    updateStatus,
  ]);

  // --- Gesture-Based Mic Permission Handling ---
  // If user tries to enable mic (via gesture/button), mic will NOT turn ON if AI is speaking or force-hold is on
  const handleMicClick = useCallback(() => {
    // Block mic ON if AI is speaking, in 2s delay, or force-hold-mic-off
    if (state.isSpeaking || isSpeakingRef.current || state.micForceHoldOff) return;

    if (state.isMuted) {
      navigator.mediaDevices.getUserMedia({ audio:true })
        .then(stream => {
          stream.getTracks().forEach(track=>track.stop());
          setState(prev=>({ ...prev, isMuted:false }));
          startListeningLoop(); // Start listening only if allowed
        })
        .catch(err=>{ alert('Please allow microphone access.'); updateStatus('माइक्रोफोन की अनुमति चाहिए','error'); });
    } else {
      setState(prev=>({ ...prev, isMuted:true }));
      stopListening();
    }
  }, [state.isSpeaking, state.micForceHoldOff, startListeningLoop, stopListening, updateStatus]);

  // --- Session start/stop (gesture required for permission) ---
  const startSession = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ audio:true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
        setState(prev => ({ ...prev, isConnected:true }));
        updateStatus('कनेक्ट हो रहा...', 'ready');
        startTimer();
        speakText('नमस्ते! मैं न्याय GPT हूँ। कृपया भाषा चुनें - हिंदी, तमिल या अंग्रेजी कहें।', 'hindi');
      })
      .catch(err => {
        console.error(err);
        alert('Please allow microphone access.');
        updateStatus('माइक्रोफोन की अनुमति चाहिए', 'error');
      });
  }, [startTimer, speakText, updateStatus]);

  const endSession = useCallback(() => {
    stopListening();
    window.speechSynthesis.cancel();
    stopTimer();
    setState(prev => ({
      ...prev,
      isConnected:false,
      isListening:false,
      isSpeaking:false,
      selectedLanguage:null,
      conversation:[],
      micForceHoldOff: false
    }));
    updateStatus('सत्र समाप्त','disconnected');
  }, [stopListening, stopTimer, updateStatus]);

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
        <button
          className="ai-agent-btn mic"
          onClick={handleMicClick}
          title={state.isMuted ? "Unmute" : "Mute"}
          disabled={state.isSpeaking || isSpeakingRef.current || state.micForceHoldOff}
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
      {/* Conversation history UI */}
      <div className="ai-conversation-ui">
        {state.conversation.map((msg, idx) =>
          <div key={idx} className={`ai-msg ai-msg-${msg.sender}`}>
            <b>{msg.sender === 'ai' ? 'AI' : 'You'}:</b> {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}