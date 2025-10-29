// Chatbot Service - خدمة الشات بوت
const BASE_URL = 'https://api.expo-alkandari.com/api/v1';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    recommended_products?: RecommendedProduct[];
  };
  sent_at: string;
}

export interface RecommendedProduct {
  id: number;
  name: string | null;
  slug: string;
  price: string;
  image: string | null;
  url: string;
}

export interface ChatSession {
  conversation_id: number;
  session_id: string;
  welcome_message: string;
  chatbot_name: string;
}

export interface ChatSettings {
  is_active: boolean;
  welcome_message: string;
  max_conversation_length: number;
}

export interface ChatHistory {
  conversation: {
    session_id: string;
    status: string;
    message_count: number;
    created_at: string;
    last_activity_at: string;
  };
  messages: {
    session_id: string;
    status: string;
    messages: ChatMessage[];
  };
}

export interface SendMessageResponse {
  message: ChatMessage;
  conversation_status: string;
}

class ChatbotService {
  private sessionId: string | null = null;

  constructor() {
    // استرجاع session_id من localStorage عند بدء الخدمة
    this.sessionId = localStorage.getItem('chatbot_session_id');
  }

  // الحصول على إعدادات الشات بوت
  async getSettings(): Promise<ChatSettings> {
    try {
      const response = await fetch(`${BASE_URL}/chat/settings`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get settings');
      }

      return data.data;
    } catch (error) {
      console.error('Error getting chatbot settings:', error);
      throw error;
    }
  }

  // بدء محادثة جديدة
  async startChat(): Promise<ChatSession> {
    try {
      const response = await fetch(`${BASE_URL}/chat/start`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to start chat');
      }

      // حفظ session_id في localStorage وفي الخدمة
      this.sessionId = data.data.session_id;
      localStorage.setItem('chatbot_session_id', this.sessionId);

      return data.data;
    } catch (error) {
      console.error('Error starting chat:', error);
      throw error;
    }
  }

  // إرسال رسالة
  async sendMessage(message: string): Promise<SendMessageResponse> {
    if (!this.sessionId) {
      throw new Error('No active session. Please start a chat first.');
    }

    try {
      const response = await fetch(`${BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to send message');
      }

      return data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // الحصول على تاريخ المحادثة
  async getChatHistory(): Promise<ChatHistory> {
    if (!this.sessionId) {
      throw new Error('No active session. Please start a chat first.');
    }

    try {
      const response = await fetch(`${BASE_URL}/chat/history?session_id=${this.sessionId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get chat history');
      }

      return data.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  // إنهاء المحادثة
  async endChat(): Promise<void> {
    if (!this.sessionId) {
      return; // لا توجد جلسة نشطة
    }

    try {
      const response = await fetch(`${BASE_URL}/chat/end`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to end chat');
      }

      // مسح session_id من localStorage والخدمة
      this.sessionId = null;
      localStorage.removeItem('chatbot_session_id');
    } catch (error) {
      console.error('Error ending chat:', error);
      throw error;
    }
  }

  // التحقق من وجود جلسة نشطة
  hasActiveSession(): boolean {
    return this.sessionId !== null;
  }

  // الحصول على session_id الحالي
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }

  // إعادة تعيين الجلسة (في حالة انتهاء الصلاحية)
  resetSession(): void {
    this.sessionId = null;
    localStorage.removeItem('chatbot_session_id');
  }
}

// إنشاء instance واحد من الخدمة
export const chatbotService = new ChatbotService();
export default chatbotService;