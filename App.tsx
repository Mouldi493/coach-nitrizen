import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LiveServerMessage } from '@google/genai';
import { geminiService } from './services/geminiService';
import { Message, MealAnalysis } from './types';
import MessageBubble from './components/MessageBubble';
import { MicIcon, StopCircleIcon, TrashIcon } from './components/Icons';

type SessionState = 'idle' | 'listening' | 'processing' | 'error';
const HISTORY_KEY = 'nutrizen-conversation-history';

const getInitialMessages = (): Message[] => {
    try {
        const savedHistory = localStorage.getItem(HISTORY_KEY);
        if (savedHistory) {
            const parsedMessages = JSON.parse(savedHistory);
            if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
                return parsedMessages;
            }
        }
    } catch (error) {
        console.error("Failed to load conversation history:", error);
        localStorage.removeItem(HISTORY_KEY);
    }
    return [{ id: 'welcome', sender: 'system', text: 'Appuyez sur le micro pour commencer à décrire votre repas.' }];
};


const App: React.FC = () => {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  
  const userTranscriptionRef = useRef('');
  const coachTranscriptionRef = useRef('');
  const finalCoachMessageRef = useRef<Message | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    try {
        const messagesToSave = messages.filter(msg => msg.sender !== 'system');
        if (messagesToSave.length > 0) {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(messagesToSave));
        } else {
            localStorage.removeItem(HISTORY_KEY);
        }
    } catch (error) {
        console.error("Failed to save conversation history:", error);
    }
  }, [messages]);


  const handleMessage = useCallback((message: LiveServerMessage) => {
    let shouldUpdateState = false;

    if (message.serverContent?.inputTranscription) {
      const text = message.serverContent.inputTranscription.text;
      userTranscriptionRef.current += text;
      shouldUpdateState = true;
    }
    if (message.serverContent?.outputTranscription) {
      const text = message.serverContent.outputTranscription.text;
      coachTranscriptionRef.current += text;
      shouldUpdateState = true;
    }
    
    if (message.serverContent?.turnComplete) {
      const userMessageText = userTranscriptionRef.current.trim();
      if (userMessageText) {
          const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text: userMessageText };
          setMessages(prev => [...prev, userMessage]);
      }
      
      const fullCoachText = coachTranscriptionRef.current.trim();
      if (fullCoachText) {
          const jsonMatch = fullCoachText.match(/```json\s*([\s\S]*?)\s*```/);
          let mealAnalysis: MealAnalysis | undefined = undefined;
          let coachMessageText = fullCoachText;

          if (jsonMatch && jsonMatch[1]) {
              try {
                  mealAnalysis = JSON.parse(jsonMatch[1]);
                  coachMessageText = fullCoachText.replace(jsonMatch[0], '').trim();
              } catch (e) {
                  console.error("Failed to parse JSON from model response:", e);
              }
          }
          
          const coachMessage: Message = { id: `coach-${Date.now()}`, sender: 'coach', text: coachMessageText, analysis: mealAnalysis };
          finalCoachMessageRef.current = coachMessage;
      }
      
      userTranscriptionRef.current = '';
      coachTranscriptionRef.current = '';
    }
    
    // Only after the audio is done playing do we add the final message
    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (!audioData && finalCoachMessageRef.current) {
        setMessages(prev => [...prev, finalCoachMessageRef.current!]);
        finalCoachMessageRef.current = null;
        shouldUpdateState = false; // We just updated
    }
    
    if (shouldUpdateState) {
      setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];

          // Update or add user transcription
          const userText = userTranscriptionRef.current.trim();
          if (userText) {
              if (lastMsg?.sender === 'user') {
                  lastMsg.text = userText;
              } else {
                  newMessages.push({ id: `user-${Date.now()}`, sender: 'user', text: userText });
              }
          }

          // Update or add coach transcription
          const coachText = coachTranscriptionRef.current.trim();
          if (coachText) {
              const lastUserMsgIndex = newMessages.map(m => m.sender).lastIndexOf('user');
              const lastCoachMsg = newMessages[newMessages.length - 1];
              if (lastCoachMsg?.sender === 'coach' && newMessages.length - 1 > lastUserMsgIndex) {
                  lastCoachMsg.text = coachText;
              } else {
                  newMessages.push({ id: `coach-${Date.now()}`, sender: 'coach', text: coachText });
              }
          }
          return newMessages;
      });
    }

  }, []);

  const startSession = async () => {
    try {
      setSessionState('listening');
      setMessages(prev => [...prev.filter(m => m.id !== 'welcome' && m.id !== 'error'), {id: 'system-listening', sender: 'system', text: 'Je vous écoute...'}]);
      await geminiService.startSession({
        onMessage: handleMessage,
        onError: () => {
          setSessionState('error');
          setMessages(prev => [...prev, {id: 'error', sender: 'system', text: 'Une erreur est survenue. Veuillez réessayer.'}])
        },
        onClose: () => {
          setSessionState('idle');
          if (finalCoachMessageRef.current) {
            setMessages(prev => [...prev.filter(m => m.sender !== 'system'), finalCoachMessageRef.current!]);
            finalCoachMessageRef.current = null;
          } else {
             setMessages(prev => [...prev.filter(m => m.sender !== 'system')]);
          }
        },
      });
    } catch (error) {
      console.error("Failed to start session:", error);
      setSessionState('error');
      setMessages(prev => [...prev, {id: 'error', sender: 'system', text: 'Impossible de démarrer la session. Vérifiez votre clé API et les permissions du micro.'}])
    }
  };

  const stopSession = async () => {
    setSessionState('processing');
    setMessages(prev => [...prev.filter(m => m.sender !== 'system'), { id: 'system-processing', sender: 'system', text: 'Le coach analyse votre repas...' }]);
    await geminiService.stopSession();
  };

  const clearHistory = () => {
    geminiService.stopSession();
    localStorage.removeItem(HISTORY_KEY);
    setSessionState('idle');
    setMessages([{ id: 'welcome', sender: 'system', text: 'Appuyez sur le micro pour commencer à décrire votre repas.' }]);
  };

  const MicButton = () => (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-28 h-28 flex items-center justify-center">
        {sessionState === 'listening' && (
            <div className="absolute w-full h-full animate-wave" style={{ border: '3px solid #60a5fa' }}></div>
        )}
        <button
            onClick={sessionState === 'listening' ? stopSession : startSession}
            disabled={sessionState === 'processing'}
            className={`relative flex items-center justify-center w-20 h-20 rounded-full text-white shadow-2xl transition-colors duration-300
                ${sessionState === 'listening' ? 'bg-red-500' : 'bg-green-500 hover:bg-green-600'}
                ${sessionState === 'processing' ? 'bg-gray-400 cursor-not-allowed' : ''}
            `}
            aria-label={sessionState === 'listening' ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
        >
            {sessionState === 'listening' ? <StopCircleIcon className="w-10 h-10" /> : <MicIcon className="w-10 h-10" />}
        </button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="text-left">
            <h1 className="text-2xl font-bold text-green-600">NutriZen – Coach Vocal</h1>
            <p className="text-sm text-gray-500">Votre partenaire nutritionnel au quotidien</p>
        </div>
        <button
            onClick={clearHistory}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Effacer l'historique"
            title="Effacer l'historique"
        >
            <TrashIcon className="w-6 h-6" />
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
          <div ref={conversationEndRef} />
        </div>
      </main>
      <MicButton />
    </div>
  );
};

export default App;