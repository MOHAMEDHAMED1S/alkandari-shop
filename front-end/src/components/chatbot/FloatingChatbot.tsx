import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  AlertCircle,
  Minimize2,
  Maximize2,
  RotateCcw
} from 'lucide-react';
import { useChatbot } from '../../contexts/ChatbotContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { ChatMessage } from './ChatMessage';
import { ProductRecommendations } from './ProductRecommendations';

export function FloatingChatbot() {
  const {
    state,
    toggleChat,
    closeChat,
    startChat,
    sendMessage,
    endChat,
    clearError,
  } = useChatbot();

  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // التمرير التلقائي للأسفل عند إضافة رسائل جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // التركيز على حقل الإدخال عند فتح الشات
  useEffect(() => {
    if (state.isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [state.isOpen, isMinimized]);

  // معالجة إرسال الرسالة
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || state.isLoading || state.isTyping) return;

    const message = inputMessage.trim();
    setInputMessage('');
    
    // بدء محادثة جديدة إذا لم تكن موجودة
    if (!state.isConnected) {
      await startChat();
    }
    
    await sendMessage(message);
  };

  // رسوم متحركة للرسائل
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 30
      }
    }
  };

  // رسوم متحركة للكتابة
  const typingVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  // معالجة بدء محادثة جديدة
  const handleStartNewChat = async () => {
    if (state.isConnected) {
      await endChat();
    }
    await startChat();
  };

  // رسوم متحركة للزر العائم
  const floatingButtonVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20
      }
    },
    hover: { 
      scale: 1.1,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  // رسوم متحركة لنافذة الشات
  const chatWindowVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
{/* زر الشات العائم */}
<AnimatePresence>
  {!state.isOpen && (
    <motion.div
      variants={floatingButtonVariants}
      initial="initial"
      animate="animate"
      exit="initial"
      whileHover="hover"
      whileTap="tap"
      className="relative"
    >
      {/* AI Glow Effect - متوهج بشكل ذكي */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 blur-2xl"
        animate={{
          opacity: [0, 0.6, 0],
          scale: [0.9, 1.3, 0.9],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
       {/* مؤشر الرسائل الجديدة - خارج الزر */}
       {state.messages.length > 0 && (
         <motion.div
           initial={{ scale: 0, rotate: -180 }}
           animate={{ 
             scale: 1,
             rotate: 0,
             y: [0, -2, 0]
           }}
           transition={{
             scale: { type: "spring", stiffness: 500, damping: 15 },
             rotate: { duration: 0.5 },
             y: {
               duration: 1.5,
               repeat: Infinity,
               ease: "easeInOut"
             }
           }}
           className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-500 via-red-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/60 ring-2 ring-white z-20"
         >
           <span className="text-xs text-white font-bold">
             {state.messages.filter(m => m.role === 'assistant').length}
           </span>
           
           {/* Notification Pulse */}
           <motion.div
             className="absolute inset-0 rounded-full bg-red-400"
             animate={{
               scale: [1, 1.5],
               opacity: [0.7, 0],
             }}
             transition={{
               duration: 1.5,
               repeat: Infinity,
             }}
           />
         </motion.div>
       )}
      
      <Button
        onClick={toggleChat}
        size="lg"
        className="relative h-16 w-16 sm:h-20 sm:w-20 lg:h-18 lg:w-18 rounded-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 hover:from-blue-950 hover:via-purple-900 hover:to-blue-950 shadow-2xl hover:shadow-cyan-500/40 transition-all duration-500 border-2 border-cyan-500/30 hover:border-cyan-400/60 group overflow-hidden backdrop-blur-sm"
      >
        {/* Neural Network Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-cyan-400"
            animate={{
              r: [20, 25, 20],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-blue-400"
            animate={{
              r: [30, 35, 30],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </svg>
        
        {/* AI Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [0, Math.cos(i * 60 * Math.PI / 180) * 25],
              y: [0, Math.sin(i * 60 * Math.PI / 180) * 25],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.2
            }}
          />
        ))}
        
        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-1 left-1 w-10 h-10 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-xl"
          animate={{
            x: [0, 15, 0],
            y: [0, 10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1 right-1 w-10 h-10 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-xl"
          animate={{
            x: [0, -15, 0],
            y: [0, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Icon Container with Brain/AI indication */}
        <div className="relative z-10 flex items-center justify-center">
          <Bot 
            className="text-cyan-100 group-hover:text-cyan-300 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" 
            style={{ width: '2rem', height: '2rem' }}
          />
          
          {/* AI Sparkle */}
          <motion.div
            className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        {/* AI Pulse Rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
          animate={{
            scale: [1, 1.4],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-400/40"
          animate={{
            scale: [1, 1.4],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 1
          }}
        />
        
        {/* Scanning Line Effect */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent blur-sm" />
        </motion.div>
        
        {/* Hover Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-full"
          style={{ transform: 'skewX(-20deg)' }}
        />
        
        {/* Inner Glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Digital Grid Overlay */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:8px_8px] opacity-30" />
      </Button>
    </motion.div>
  )}
</AnimatePresence>

      {/* نافذة الشات */}
      <AnimatePresence>
        {state.isOpen && (
          <motion.div
            variants={chatWindowVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
            } transition-all duration-300`}
          >
            {/* شريط العنوان */}
            <div className="bg-gray-800 p-4 flex items-center justify-between" dir="rtl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-white p-1.5">
                    <img 
                      src="/logo.png" 
                      alt="Soapy Bubbles" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {state.isConnected && (
                    <div className="absolute -bottom-0.5 -left-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    {state.session?.chatbot_name || 'مساعد Soapy Bubbles'}
                  </h3>
                  <p className="text-gray-300 text-xs">
                    {state.isConnected ? 'متصل الآن' : 'غير متصل'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {/* زر بدء محادثة جديدة */}
                {state.isConnected && (
                  <Button
                    onClick={handleStartNewChat}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-gray-700 h-8 w-8 p-0"
                    disabled={state.isLoading}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                
                {/* زر تصغير/تكبير */}
                <Button
                  onClick={() => setIsMinimized(!isMinimized)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-700 h-8 w-8 p-0"
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
                
                {/* زر الإغلاق */}
                <Button
                  onClick={closeChat}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-700 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* محتوى الشات */}
            {!isMinimized && (
              <div className="flex flex-col h-[536px] bg-white p-4">
                {/* منطقة الرسائل */}
                <ScrollArea className="flex-1 p-4" dir="rtl">
                  {state.error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4"
                    >
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 flex items-center justify-between">
                          <span className="text-sm">{state.error}</span>
                          <Button
                            onClick={clearError}
                            variant="ghost"
                            size="sm"
                            className="h-6 text-red-600 hover:text-red-800 hover:bg-red-100"
                          >
                            إغلاق
                          </Button>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {/* رسالة الترحيب أو بدء المحادثة */}
                  {!state.isConnected && state.messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12 px-4"
                    >
                      <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full p-4 shadow-md border border-gray-200">
                        <img 
                          src="/logo.png" 
                          alt="Soapy Bubbles" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        مرحباً بك! 👋
                      </h4>
                      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        أنا مساعدك الذكي في متجر Soapy Bubbles
                      </p>
                      <div className="text-right mb-6 space-y-2 max-w-xs mx-auto">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-700 rounded-full mt-2"></div>
                          <p className="text-sm text-gray-700">العثور على المنتجات المناسبة</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-700 rounded-full mt-2"></div>
                          <p className="text-sm text-gray-700">الإجابة على استفساراتك</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-700 rounded-full mt-2"></div>
                          <p className="text-sm text-gray-700">تقديم اقتراحات مخصصة</p>
                        </div>
                      </div>
                      <Button
                        onClick={startChat}
                        disabled={state.isLoading}
                        className="bg-gray-800 hover:bg-gray-900 shadow-md"
                        size="default"
                      >
                        {state.isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            جاري الاتصال...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4 ml-2" />
                            ابدأ المحادثة
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}

                  {/* الرسائل */}
                  <div className="space-y-0 p-4">
                    <AnimatePresence mode="popLayout">
                      {state.messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                      ))}
                    </AnimatePresence>
                    
                    {/* مؤشر الكتابة */}
                    {state.isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-start gap-3 mb-6"
                        dir="rtl"
                      >
                        <div className="w-9 h-9 rounded-full bg-white border-2 border-gray-200 p-1 flex items-center justify-center">
                          <img 
                            src="/logo.png" 
                            alt="Soapy Bubbles" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                          <div className="flex gap-1.5">
                            <motion.div
                              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                              className="w-2 h-2 bg-gray-600 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                              className="w-2 h-2 bg-gray-600 rounded-full"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                              className="w-2 h-2 bg-gray-600 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* حقل الإدخال */}
                {state.isConnected && (
                  <div className="border-t border-gray-200 p-4 bg-white">
                    <form onSubmit={handleSendMessage} className="relative" dir="rtl">
                      <div className="relative flex items-center gap-2 bg-gray-50 rounded-full border border-gray-200 hover:border-gray-300 transition-colors px-4 py-2.5 focus-within:border-gray-400 focus-within:shadow-sm">
                        <Input
                          ref={inputRef}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="اكتب رسالتك هنا..."
                          disabled={state.isLoading || state.isTyping}
                          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-400 px-0 h-auto"
                          dir="rtl"
                        />
                        <Button
                          type="submit"
                          disabled={!inputMessage.trim() || state.isLoading || state.isTyping}
                          size="sm"
                          className="bg-gray-800 hover:bg-gray-900 rounded-full h-9 w-9 p-0 flex-shrink-0 disabled:bg-gray-300 transition-colors shadow-sm"
                        >
                          {state.isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </form>
                    <p className="text-xs text-gray-400 text-center mt-2.5">
                      اضغط Enter للإرسال
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}