import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Install uuid: npm install uuid
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    isOpen: false,
    messages: [
      {
        id: uuidv4(),
        role: 'assistant',
        content: 'Welcome to Shangla Tourist AI Guide! 🏔️ I know everything about Shangla. Ask me anything about places, routes, weather, or let me plan your trip!',
        contentUr: 'شانگلہ ٹورسٹ AI گائیڈ میں خوش آمدید! 🏔️ میں شانگلہ کے بارے میں سب کچھ جانتا ہوں۔',
        timestamp: new Date().toISOString(),
      },
    ],
    isTyping: false,
    sessionId: localStorage.getItem('chat_session_id') || uuidv4(),
    language: 'en',
    error: null,
  },
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    addMessage: (state, action) => {
      state.messages.push({
        id: uuidv4(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    setChatLanguage: (state, action) => {
      state.language = action.payload;
    },
    clearChat: (state) => {
      state.messages = [state.messages[0]];
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  toggleChat, openChat, closeChat, addMessage,
  setTyping, setChatLanguage, clearChat, setError,
} = chatSlice.actions;
export default chatSlice.reducer;