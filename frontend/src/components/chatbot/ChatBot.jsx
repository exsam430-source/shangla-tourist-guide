import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { X, Send, Mic, MicOff, Trash2, Brain, Globe } from 'lucide-react';
import {
  toggleChat, addMessage, setTyping,
  setChatLanguage, clearChat,
} from '@/store/slices/chatSlice';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const QUICK_ACTIONS = [
  { label: '🏔️ Top Places', message: 'What are the top tourist places in Shangla?' },
  { label: '🌤️ Weather', message: 'What is the current weather in Shangla?' },
  { label: '🗺️ Plan Trip', message: 'Help me plan a 2-day trip to Shangla' },
  { label: '🚧 Road Alerts', message: 'Are there any road alerts or closures in Shangla?' },
  { label: '🏨 Stay Options', message: 'What are the accommodation options in Shangla?' },
  { label: '📅 Best Time', message: 'What is the best time to visit Shangla?' },
];

const ChatBot = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isOpen, messages, isTyping, language, sessionId } = useSelector((state) => state.chat);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Setup speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition error. Try again.');
      };

      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      toast.error('Voice not supported in this browser');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async (messageText = null) => {
    const text = messageText || input.trim();
    if (!text) return;

    setInput('');

    // Add user message
    dispatch(addMessage({ role: 'user', content: text, language }));
    dispatch(setTyping(true));

    try {
      const response = await api.post(
        `${import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:8000'}/ai/chat`,
        {
          message: text,
          language,
          session_id: sessionId,
        }
      );

      dispatch(addMessage({
        role: 'assistant',
        content: response.data.reply || response.data.message,
        language: response.data.language || language,
      }));
    } catch (err) {
      // Fallback response when AI server is offline
      const fallbackResponse = getFallbackResponse(text, language);
      dispatch(addMessage({
        role: 'assistant',
        content: fallbackResponse,
        language,
      }));
    } finally {
      dispatch(setTyping(false));
    }
  };

  const getFallbackResponse = (text, lang) => {
    const lowerText = text.toLowerCase();
    if (lang === 'ur') {
      if (lowerText.includes('shangla') || lowerText.includes('شانگلہ')) {
        return 'شانگلہ ضلع خیبرپختونخوا، پاکستان میں واقع ہے۔ یہ اپنی قدرتی خوبصورتی، سرسبز وادیوں اور اونچے پہاڑوں کی وجہ سے مشہور ہے۔ 🏔️ AI سرور سے جڑنے پر مزید تفصیلی معلومات حاصل ہوگی۔';
      }
      return 'معذرت، AI سرور ابھی دستیاب نہیں ہے۔ براہ کرم بعد میں کوشش کریں۔';
    }
    if (lowerText.includes('shangla top') || lowerText.includes('achar top')) {
      return '🏔️ **Shangla Top** is the highest point of Shangla Pass at approximately 2800m altitude. It offers breathtaking panoramic views of the surrounding mountains and valleys. **Achar Top** is located about 15km from Shangla Top via a link road from the check post, at 300m above Shangla Top.\n\n*Note: Connect AI server for more detailed responses.*';
    }
    if (lowerText.includes('weather')) {
      return '🌤️ Shangla has a pleasant climate. Summer (May-September): 15-25°C. Winter (December-February): -5 to 5°C with snowfall at higher altitudes.\n\n*Check the weather section for live data.*';
    }
    if (lowerText.includes('best time') || lowerText.includes('visit')) {
      return '📅 **Best time to visit Shangla:**\n- **Peak season:** May to September (lush green, perfect weather)\n- **Snow lovers:** December to February\n- **Avoid:** Heavy monsoon rains in late July-August\n\n*Connect AI server for personalized recommendations.*';
    }
    return `🤖 I'm your Shangla AI Guide! The AI server is currently offline, but I can tell you that Shangla is a beautiful district in KPK, Pakistan with amazing places like Shangla Top, Achar Top, Shahpur Valley, and many more. Start the Python AI server for full responses! 🏔️`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => dispatch(toggleChat())}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-gray-800 border border-white/10'
            : 'bg-gradient-to-br from-green-500 to-green-700 shadow-glow hover:shadow-glow-lg hover:scale-105'
        }`}
        whileHover={{ scale: isOpen ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <span className="text-2xl">🤖</span>
        )}
        {!isOpen && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full text-black text-[9px] font-black flex items-center justify-center">
            {messages.length - 1 > 9 ? '9+' : messages.length - 1}
          </span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(10, 10, 10, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(34, 197, 94, 0.15)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
                <Brain size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm leading-none">Shangla AI Guide</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs">Online</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Language Toggle */}
                <button
                  onClick={() => dispatch(setChatLanguage(language === 'en' ? 'ur' : 'en'))}
                  className="flex items-center gap-1 px-2.5 py-1.5 glass rounded-lg text-gray-400 hover:text-white text-xs transition-all"
                >
                  <Globe size={12} />
                  {language === 'en' ? 'اردو' : 'EN'}
                </button>
                <button
                  onClick={() => dispatch(clearChat())}
                  className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  title="Clear chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <span className="text-xs">🤖</span>
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'chat-bubble-user rounded-br-sm'
                        : 'chat-bubble-bot rounded-bl-sm'
                    } ${msg.language === 'ur' ? 'rtl font-urdu text-right' : ''}`}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">🤖</span>
                  </div>
                  <div className="chat-bubble-bot rounded-bl-sm flex items-center gap-1 px-4 py-3">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ACTIONS.map(({ label, message }) => (
                    <button
                      key={label}
                      onClick={() => sendMessage(message)}
                      className="px-3 py-1.5 glass border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white hover:border-green-500/30 transition-all"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={language === 'ur' ? t('chatbot.placeholderUr') : t('chatbot.placeholder')}
                    rows={1}
                    className={`w-full px-4 py-3 glass border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/50 resize-none transition-all max-h-24 ${language === 'ur' ? 'rtl font-urdu text-right' : ''}`}
                    style={{ scrollbarWidth: 'thin' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                    }}
                  />
                </div>
                <button
                  onClick={toggleVoice}
                  className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                    isListening
                      ? 'bg-red-500/20 border border-red-500/30 text-red-400 animate-pulse'
                      : 'glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim()}
                  className="p-3 bg-green-600 hover:bg-green-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-white transition-all flex-shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;