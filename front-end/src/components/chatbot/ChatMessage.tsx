import React from 'react';
import { motion } from 'framer-motion';
import { User, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage as ChatMessageType } from '../../services/chatbotService';
import { ProductRecommendations } from './ProductRecommendations';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 mb-6 ${
        isUser ? 'flex-row ltr' : 'flex-row-reverse '
      }`}
      dir="rtl"
    >
      {/* أيقونة المرسل */}
      <div className="flex-shrink-0">
        <div 
          className={`w-9 h-9 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gray-700' 
              : 'bg-white border-2 border-gray-200 p-1'
          }`}
        >
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <img 
              src="/logo.png" 
              alt="Soapy Bubbles" 
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </div>

      {/* محتوى الرسالة */}
      <div className="flex-1 max-w-[80%]">
        <div 
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gray-700 text-white rtl'
              : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:mb-2 prose-p:mb-2 prose-ul:mb-2 prose-ol:mb-2 prose-li:mb-1 prose-headings:font-semibold">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      className="text-gray-700 hover:text-gray-900 underline inline-flex items-center gap-1 font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {props.children}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ),
                  code: ({ node, inline, ...props }: any) => (
                    inline ? (
                      <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                    ) : (
                      <code className="block bg-gray-50 text-gray-800 p-3 rounded-lg text-xs font-mono overflow-x-auto border border-gray-200" {...props} />
                    )
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-gray-900" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic text-gray-700" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside space-y-1.5 text-sm mr-4" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside space-y-1.5 text-sm mr-4" {...props} />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1 className="text-base font-semibold text-gray-900 mb-2 mt-2" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-sm font-semibold text-gray-900 mb-2 mt-2" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-sm font-semibold text-gray-800 mb-1 mt-1" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-r-4 border-gray-300 pr-3 italic text-gray-700 my-2 bg-gray-50 py-2 rounded" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-sm leading-relaxed text-gray-800" {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* المنتجات المقترحة - تظهر فقط مع رسائل البوت */}
        {!isUser && message.metadata?.recommended_products && message.metadata.recommended_products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3"
          >
            <ProductRecommendations products={message.metadata.recommended_products} />
          </motion.div>
        )}
        
        {/* وقت الإرسال */}
        <p className="text-xs text-gray-400 mt-2">
          {new Date(message.sent_at).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </motion.div>
  );
}