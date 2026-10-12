import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Brain, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatMessage = ({ message, language }) => {
  const isBot = message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
        isBot
          ? 'bg-gradient-to-br from-green-600 to-green-800'
          : 'bg-gradient-to-br from-blue-600 to-blue-800'
      }`}>
        {isBot ? <Brain size={14} className="text-white" /> : <User size={14} className="text-white" />}
      </div>

      {/* Message Content */}
      <div className={`max-w-[80%] space-y-2 ${isBot ? '' : 'items-end flex flex-col'}`}>
        <div className={`${isBot ? 'chat-bubble-bot' : 'chat-bubble-user'} ${language === 'ur' ? 'font-urdu rtl text-right' : ''}`}>
          {isBot ? 