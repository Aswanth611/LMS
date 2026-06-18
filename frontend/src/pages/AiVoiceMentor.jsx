import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  Code2, 
  Cpu, 
  Zap, 
  MessageSquareQuote,
  AlertCircle,
  Send
} from 'lucide-react';

const AiVoiceMentor = () => {
  const { user } = useContext(AuthContext);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [textInput, setTextInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        // Show transcript in real time
        setTranscript(finalTranscript || interimTranscript);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please enable microphone permissions in your browser.');
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
    }
  }, []);

  // Fetch available voices for Speech Synthesis
  useEffect(() => {
    if (synthRef.current) {
      const updateVoices = () => {
        const availableVoices = synthRef.current.getVoices();
        setVoices(availableVoices);
        
        // Auto-select a nice english voice
        const defaultVoice = availableVoices.find(v => v.lang.includes('en-US') && v.name.toLowerCase().includes('google')) ||
                             availableVoices.find(v => v.lang.includes('en-US')) ||
                             availableVoices[0];
        if (defaultVoice) {
          setSelectedVoiceName(defaultVoice.name);
        }
      };

      updateVoices();
      if (synthRef.current.addEventListener) {
        synthRef.current.addEventListener('voiceschanged', updateVoices);
      }
      return () => {
        if (synthRef.current?.removeEventListener) {
          synthRef.current.removeEventListener('voiceschanged', updateVoices);
        }
      };
    }
  }, []);

  // Groq integration function (Required name: sendToGroq)
  const sendToGroq = async (text) => {
    try {
      const response = await axios.post('/ai/voice-mentor', { text });
      if (response.data && response.data.success) {
        return response.data.reply;
      }
      throw new Error(response.data.message || 'Failed to get a response from EduFlick AI Mentor.');
    } catch (err) {
      console.error('sendToGroq function error:', err);
      throw err;
    }
  };

  // Speaks response aloud using SpeechSynthesis
  const speakResponse = (text) => {
    if (!synthRef.current) return;

    // Cancel any current speech
    synthRef.current.cancel();

    // Clean markdown notation out of read text
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/`/g, '')
      .replace(/_/g, '')
      .replace(/-/g, ' ');
      
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (selectedVoiceName) {
      const voice = voices.find(v => v.name === selectedVoiceName);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      setErrorMessage('Speech recognition is not initialized or supported in this browser.');
      return;
    }

    // Stop speaking if currently reading out
    handleStopSpeaking();
    
    setTranscript('');
    setAiResponse('');
    setErrorMessage('');
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setErrorMessage('Failed to start voice capture. Please refresh and try again.');
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Submits the transcript to Groq when recording completes or stops
  useEffect(() => {
    const processUserSpeech = async () => {
      // Trigger only when user stops speaking, and there is actual text captured
      if (!isListening && transcript.trim().length > 0 && !aiResponse && !isLoading && !textInput) {
        setIsLoading(true);
        setErrorMessage('');
        try {
          const answer = await sendToGroq(transcript);
          setAiResponse(answer);
          speakResponse(answer);
        } catch (err) {
          console.error(err);
          setErrorMessage(
            err.response?.data?.message || 
            err.message || 
            'Could not fetch mentor response. Make sure the backend is running and GROQ_API_KEY is set.'
          );
        } finally {
          setIsLoading(false);
        }
      }
    };
    processUserSpeech();
  }, [isListening]);

  // Handles typed text submission
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || isLoading) return;

    const query = textInput.trim();
    setTextInput('');
    setTranscript(query);
    setAiResponse('');
    setErrorMessage('');
    setIsLoading(true);
    
    // Stop listening if active
    if (isListening) {
      handleStopListening();
    }

    // Cancel any current readout
    handleStopSpeaking();

    try {
      const answer = await sendToGroq(query);
      setAiResponse(answer);
      speakResponse(answer);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.message || 
        err.message || 
        'Could not fetch mentor response. Make sure the backend is running and GROQ_API_KEY is set.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  const handleReset = () => {
    handleStopListening();
    handleStopSpeaking();
    setTranscript('');
    setAiResponse('');
    setTextInput('');
    setErrorMessage('');
    setIsLoading(false);
  };

  return (
    <div className="pl-0 min-h-screen bg-slate-900 grid-bg pb-16">
      <Navbar title="AI Voice Mentor" />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-8 relative z-10 space-y-8">
        
        {/* Mentor Overview Card */}
        <section className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-purple flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-500/20">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-xl font-black text-white flex items-center justify-center md:justify-start gap-2">
              Meet EduFlick AI Voice Mentor
              <span className="px-2 py-0.5 text-[9px] bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-md uppercase font-bold tracking-wider">
                Llama 3.3 Active
              </span>
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
              Learn Software Development, Prompt Engineering, AI, Content Creation, and Agentic Automation in real-time. Simply click <strong>Start Talking</strong>, speak your question, and click <strong>Stop Talking</strong> when you're done. Your AI Mentor will respond verbally!
            </p>
          </div>
        </section>

        {errorMessage && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Controls Column */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-between text-center min-h-[300px]">
              <div className="w-full">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 mb-4">
                  Voice Controller
                </h4>
                
                {/* Voice Status Badge */}
                <div className="mb-6">
                  {isListening ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      Listening...
                    </span>
                  ) : isLoading ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold border border-brand-500/20">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping" />
                      Mentor Thinking...
                    </span>
                  ) : isSpeaking ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-purple/10 text-accent-purple text-xs font-bold border border-accent-purple/20">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent-purple animate-ping" />
                      Speaking...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                      Mentor Ready
                    </span>
                  )}
                </div>

                {/* Voice Visualizer Animation */}
                <div className="h-16 flex items-center justify-center gap-1 mb-6">
                  {isListening ? (
                    <>
                      <div className="w-1 bg-red-500 rounded-full h-4 animate-voice-bar-1" />
                      <div className="w-1 bg-brand-500 rounded-full h-8 animate-voice-bar-2" />
                      <div className="w-1 bg-accent-purple rounded-full h-10 animate-voice-bar-3" />
                      <div className="w-1 bg-accent-pink rounded-full h-6 animate-voice-bar-4" />
                      <div className="w-1 bg-accent-orange rounded-full h-3 animate-voice-bar-5" />
                    </>
                  ) : isSpeaking ? (
                    <>
                      <div className="w-1 bg-accent-purple rounded-full h-4 animate-voice-bar-2" />
                      <div className="w-1 bg-brand-400 rounded-full h-6 animate-voice-bar-4" />
                      <div className="w-1 bg-indigo-500 rounded-full h-3 animate-voice-bar-1" />
                      <div className="w-1 bg-brand-400 rounded-full h-5 animate-voice-bar-5" />
                      <div className="w-1 bg-accent-purple rounded-full h-2 animate-voice-bar-3" />
                    </>
                  ) : (
                    <>
                      <div className="w-1 bg-slate-700 rounded-full h-2" />
                      <div className="w-1 bg-slate-700 rounded-full h-2" />
                      <div className="w-1 bg-slate-700 rounded-full h-2" />
                      <div className="w-1 bg-slate-700 rounded-full h-2" />
                      <div className="w-1 bg-slate-700 rounded-full h-2" />
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 w-full">
                {!isListening ? (
                  <button
                    onClick={handleStartListening}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-lg shadow-brand-500/10 active:scale-95"
                  >
                    <Mic className="w-4 h-4" />
                    Start Talking
                  </button>
                ) : (
                  <button
                    onClick={handleStopListening}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/10 active:scale-95 animate-pulse"
                  >
                    <MicOff className="w-4 h-4" />
                    Stop Talking
                  </button>
                )}

                {isSpeaking && (
                  <button
                    onClick={handleStopSpeaking}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-white border border-slate-700/80 transition-all duration-200 cursor-pointer"
                  >
                    <VolumeX className="w-4 h-4" />
                    Stop Reading
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/40 border border-slate-800/85 transition-all duration-200 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Session
                </button>
              </div>
            </div>

            {/* Voice Selection Helper */}
            {voices.length > 0 && (
              <div className="glass-card p-4 rounded-xl border border-slate-800/60 space-y-3">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">
                  Select Mentor Voice
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-[11px] text-slate-300 focus:outline-none focus:border-brand-500"
                >
                  {voices
                    .filter(v => v.lang.startsWith('en'))
                    .map((v, i) => (
                      <option key={i} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Transcripts and Response Cards Column */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Transcript & Text Input Card */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b border-slate-850 pb-2">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 flex items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-brand-400" />
                  Your Speech & Text Input
                </h4>
                {isListening && (
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider animate-pulse">
                    Live Recording
                  </span>
                )}
              </div>
              
              {/* Box has min-h and max-h with scrolling so it never stretches abnormally */}
              <div className="bg-slate-950/30 border border-slate-850 rounded-xl p-4 min-h-[70px] max-h-[120px] overflow-y-auto scrollbar-thin">
                {transcript ? (
                  <p className="text-sm text-slate-200 leading-relaxed font-medium break-words">
                    "{transcript}"
                  </p>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[38px]">
                    <p className="text-xs text-slate-500 italic">
                      {isListening ? 'Speak now, transcript will update here in real time...' : 'Your spoken words or typed question will appear here...'}
                    </p>
                  </div>
                )}
              </div>

              {/* Text Input Form */}
              <form onSubmit={handleTextSubmit} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={isLoading || isListening}
                  placeholder={isListening ? "Stop listening to type..." : "Or type your question here..."}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || isListening || !textInput.trim()}
                  className="bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-500/10 active:scale-95 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </div>

            {/* Response Card */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b border-slate-850 pb-2">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-purple" />
                  AI Mentor Response
                </h4>
                {aiResponse && (
                  <button
                    onClick={() => speakResponse(aiResponse)}
                    disabled={isSpeaking}
                    className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 font-bold uppercase cursor-pointer disabled:text-slate-500"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Speak Response
                  </button>
                )}
              </div>
              
              {/* Box has overflow-y-auto so text inside can never spread outside the box */}
              <div className="bg-slate-950/30 border border-slate-850 rounded-xl p-4 min-h-[120px] max-h-[300px] overflow-y-auto scrollbar-thin">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
                    <span className="text-xs text-slate-400 font-medium">Mentor is formulating a response...</span>
                  </div>
                ) : aiResponse ? (
                  <div className="text-sm text-slate-300 space-y-3 leading-relaxed whitespace-pre-wrap font-sans break-words">
                    {aiResponse}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[88px]">
                    <p className="text-xs text-slate-500 italic">
                      Waiting for your input to analyze...
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* System Prompt & Subject Scope Guide Card */}
        <section className="glass-card p-6 rounded-2xl border border-slate-800/60">
          <h4 className="text-xs uppercase font-extrabold tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-400" />
            Mentor Specialized Subjects
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-xl text-center flex flex-col items-center justify-center gap-1.5">
              <Cpu className="w-4 h-4 text-brand-400" />
              <span className="text-[10px] font-bold text-slate-300">Artificial Intelligence</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-xl text-center flex flex-col items-center justify-center gap-1.5">
              <Zap className="w-4 h-4 text-accent-purple" />
              <span className="text-[10px] font-bold text-slate-300">Prompt Engineering</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-xl text-center flex flex-col items-center justify-center gap-1.5">
              <Code2 className="w-4 h-4 text-accent-teal" />
              <span className="text-[10px] font-bold text-slate-300">Software Dev</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-xl text-center flex flex-col items-center justify-center gap-1.5">
              <MessageSquareQuote className="w-4 h-4 text-accent-pink" />
              <span className="text-[10px] font-bold text-slate-300">Content Creation</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-xl text-center flex flex-col items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-orange" />
              <span className="text-[10px] font-bold text-slate-300">Agentic Automation</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AiVoiceMentor;
