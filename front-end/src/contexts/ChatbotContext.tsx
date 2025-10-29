import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { chatbotService, ChatMessage, ChatSession, RecommendedProduct } from '../services/chatbotService';

// أنواع البيانات
export interface ChatbotState {
  isOpen: boolean;
  isLoading: boolean;
  isConnected: boolean;
  messages: ChatMessage[];
  session: ChatSession | null;
  error: string | null;
  isTyping: boolean;
  recommendedProducts: RecommendedProduct[];
}

// أنواع الأحداث
export type ChatbotAction =
  | { type: 'TOGGLE_CHAT' }
  | { type: 'OPEN_CHAT' }
  | { type: 'CLOSE_CHAT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'START_SESSION'; payload: ChatSession }
  | { type: 'END_SESSION' }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_RECOMMENDED_PRODUCTS'; payload: RecommendedProduct[] }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_CONNECTED'; payload: boolean };

// الحالة الأولية
const initialState: ChatbotState = {
  isOpen: false,
  isLoading: false,
  isConnected: false,
  messages: [],
  session: null,
  error: null,
  isTyping: false,
  recommendedProducts: [],
};

// Reducer لإدارة الحالة
function chatbotReducer(state: ChatbotState, action: ChatbotAction): ChatbotState {
  switch (action.type) {
    case 'TOGGLE_CHAT':
      return { ...state, isOpen: !state.isOpen };
    
    case 'OPEN_CHAT':
      return { ...state, isOpen: true };
    
    case 'CLOSE_CHAT':
      return { ...state, isOpen: false };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'START_SESSION':
      return {
        ...state,
        session: action.payload,
        isConnected: true,
        error: null,
        messages: [{
          id: Date.now(),
          role: 'assistant',
          content: action.payload.welcome_message,
          sent_at: new Date().toISOString(),
        }],
      };
    
    case 'END_SESSION':
      return {
        ...state,
        session: null,
        isConnected: false,
        messages: [],
        recommendedProducts: [],
        error: null,
      };
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        // لا نحدث recommendedProducts هنا لأننا نعرضها مع كل رسالة
      };
    
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'SET_RECOMMENDED_PRODUCTS':
      return { ...state, recommendedProducts: action.payload };
    
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [], recommendedProducts: [] };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    
    default:
      return state;
  }
}

// Context
interface ChatbotContextType {
  state: ChatbotState;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  startChat: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  endChat: () => Promise<void>;
  loadChatHistory: () => Promise<void>;
  clearError: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

// دالة مساعدة لتنظيف محتوى الرسائل
const cleanMessageContent = (message: ChatMessage): ChatMessage => {
  if (message.role === 'user') {
    // إزالة نص النظام من رسائل المستخدم
    const cleanedContent = message.content.replace(
      /معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في\s*قاعده البيانات/g,
      ''
    ).trim();
    
    return {
      ...message,
      content: cleanedContent
    };
  }
  return message;
};

// دالة لتنظيف مصفوفة من الرسائل
const cleanMessages = (messages: ChatMessage[]): ChatMessage[] => {
  return messages.map(cleanMessageContent);
};

// Provider Component
export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatbotReducer, initialState);

  // التحقق من وجود جلسة نشطة عند بدء التطبيق
  useEffect(() => {
    const checkActiveSession = async () => {
      if (chatbotService.hasActiveSession()) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const history = await chatbotService.getChatHistory();
          
          // تنظيف الرسائل قبل عرضها
          const cleanedMessages = cleanMessages(history.messages.messages);
          
          dispatch({ type: 'SET_CONNECTED', payload: true });
          dispatch({ type: 'SET_MESSAGES', payload: cleanedMessages });
        } catch (error) {
          console.error('Error loading chat history:', error);
          chatbotService.resetSession();
          dispatch({ type: 'SET_CONNECTED', payload: false });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    checkActiveSession();
  }, []);

  // فتح/إغلاق الشات
  const toggleChat = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHAT' });
  }, []);

  const openChat = useCallback(() => {
    dispatch({ type: 'OPEN_CHAT' });
  }, []);

  const closeChat = useCallback(() => {
    dispatch({ type: 'CLOSE_CHAT' });
  }, []);

  // بدء محادثة جديدة
  const startChat = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const session = await chatbotService.startChat();
      dispatch({ type: 'START_SESSION', payload: session });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في بدء المحادثة';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error starting chat:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // إرسال رسالة
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    try {
      // إضافة رسالة المستخدم فوراً
      const userMessage: ChatMessage = {
        id: Date.now(),
        role: 'user',
        content: message.trim(),
        sent_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

      // إظهار مؤشر الكتابة
      dispatch({ type: 'SET_TYPING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // إرسال الرسالة للخادم
      const response = await chatbotService.sendMessage(message.trim() +  'معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في  قاعده البيانات\n '.trim());
      
      // إضافة رد الشات بوت
      dispatch({ type: 'ADD_MESSAGE', payload: response.message });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في إرسال الرسالة';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error sending message:', error);
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  }, []);

  // إنهاء المحادثة
  const endChat = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await chatbotService.endChat();
      dispatch({ type: 'END_SESSION' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في إنهاء المحادثة';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error ending chat:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // تحميل تاريخ المحادثة
  const loadChatHistory = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const history = await chatbotService.getChatHistory();
      
      // تنظيف الرسائل قبل عرضها
      const cleanedMessages = cleanMessages(history.messages.messages);
      
      dispatch({ type: 'SET_MESSAGES', payload: cleanedMessages });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في تحميل تاريخ المحادثة';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error loading chat history:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // مسح الخطأ
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const contextValue: ChatbotContextType = {
    state,
    toggleChat,
    openChat,
    closeChat,
    startChat,
    sendMessage,
    endChat,
    loadChatHistory,
    clearError,
  };

  return (
    <ChatbotContext.Provider value={contextValue}>
      {children}
    </ChatbotContext.Provider>
  );
}

// Hook لاستخدام Context
export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}

export default ChatbotContext;