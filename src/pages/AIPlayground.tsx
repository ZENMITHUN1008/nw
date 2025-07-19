import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Mic, 
  Square, 
  Download, 
  Trash2, 
  Sparkles,
  MessageSquare,
  Bot,
  User,
  Copy,
  Check,
  ArrowLeft
} from 'lucide-react';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useVoice } from '../hooks/useVoice';
import { aiService } from '../services/aiService';

// Utility function
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Background Pattern Component
type BGVariantType = 'dots' | 'grid';
type BGMaskType = 'fade-center' | 'fade-edges' | 'none';

interface BGPatternProps extends React.ComponentProps<'div'> {
  variant?: BGVariantType;
  mask?: BGMaskType;
  size?: number;
  fill?: string;
}

const maskClasses: Record<BGMaskType, string> = {
  'fade-edges': '[mask-image:radial-gradient(ellipse_at_center,var(--background),transparent)]',
  'fade-center': '[mask-image:radial-gradient(ellipse_at_center,transparent,var(--background))]',
  'none': '',
};

function getBgImage(variant: BGVariantType, fill: string) {
  switch (variant) {
    case 'dots':
      return `radial-gradient(${fill} 1px, transparent 1px)`;
    case 'grid':
      return `linear-gradient(to right, ${fill} 1px, transparent 1px), linear-gradient(to bottom, ${fill} 1px, transparent 1px)`;
    default:
      return undefined;
  }
}

const BGPattern = ({
  variant = 'grid',
  mask = 'none',
  size = 24,
  fill = '#252525',
  className,
  style,
  ...props
}: BGPatternProps) => {
  const bgSize = `${size}px ${size}px`;
  const backgroundImage = getBgImage(variant, fill);
  
  return (
    <div
      className={cn('absolute inset-0 z-[-10] size-full', maskClasses[mask], className)}
      style={{
        backgroundImage,
        backgroundSize: bgSize,
        ...style,
      }}
      {...props}
    />
  );
};

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const AIPlayground = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isRecording, lastTranscription, startRecording, stopRecording } = useVoice();

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes aurora {
        0% {
          background-position: 0% 0%, 0% 0%;
          transform: translateX(-20px) translateY(0px);
        }
        25% {
          background-position: 25% 15%, 15% 25%;
          transform: translateX(-10px) translateY(25px);
        }
        50% {
          background-position: 50% 30%, 30% 50%;
          transform: translateX(0px) translateY(50px);
        }
        75% {
          background-position: 75% 45%, 45% 75%;
          transform: translateX(10px) translateY(75px);
        }
        100% {
          background-position: 100% 60%, 60% 100%;
          transform: translateX(20px) translateY(100px);
        }
      }
      
      @keyframes aurora-secondary {
        0% {
          background-position: 100% 0%, 0% 50%;
          transform: translateX(-15px) translateY(0px) scale(1);
        }
        33% {
          background-position: 67% 33%, 33% 83%;
          transform: translateX(-5px) translateY(35px) scale(1.01);
        }
        66% {
          background-position: 33% 66%, 66% 116%;
          transform: translateX(5px) translateY(70px) scale(0.99);
        }
        100% {
          background-position: 0% 100%, 100% 150%;
          transform: translateX(15px) translateY(105px) scale(1);
        }
      }
      
      .animate-aurora {
        animation: aurora 35s ease-in-out infinite;
      }
      
      .animate-aurora-secondary {
        animation: aurora-secondary 28s ease-in-out infinite reverse;
      }
      
      :root {
        --white: #ffffff;
        --black: #000000;
        --transparent: transparent;
        --dark-blue: #0f172a;
        --dark-gray: #1e293b;
        --charcoal: #334155;
        --dark-slate: #475569;
        --background: #000000;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (lastTranscription) {
      setInputMessage(lastTranscription);
    }
  }, [lastTranscription]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.generateWorkflow({
        description: inputMessage,
        requirements: [],
        integrations: []
      });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.workflow || 'I apologize, but I encountered an error processing your request.',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const exportChat = () => {
    const chatData = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
    }));
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Global Moving Background */}
      <div className="fixed inset-0 z-0">
        <div
          className={cn(
            `[--white-gradient:repeating-linear-gradient(165deg,var(--white)_0%,var(--white)_2%,var(--transparent)_4%,var(--transparent)_6%,var(--white)_8%)]
            [--dark-gradient:repeating-linear-gradient(165deg,var(--black)_0%,var(--black)_2%,var(--dark-gray)_4%,var(--dark-gray)_6%,var(--black)_8%)]
            [--aurora:repeating-linear-gradient(165deg,var(--dark-blue)_3%,var(--dark-gray)_6%,var(--charcoal)_9%,var(--dark-slate)_12%,var(--black)_15%)]
            [background-image:var(--dark-gradient),var(--aurora)]
            [background-size:100%_200%,100%_160%]
            [background-position:0%_0%,0%_0%]
            filter blur-[6px] invert-0
            animate-aurora
            pointer-events-none
            absolute inset-0 opacity-70 will-change-transform`
          )}
        ></div>
        <div
          className={cn(
            `[--aurora-alt:repeating-linear-gradient(170deg,var(--charcoal)_0%,var(--dark-slate)_5%,var(--dark-gray)_10%,var(--black)_15%,var(--charcoal)_20%)]
            [--dark-alt:repeating-linear-gradient(170deg,var(--black)_0%,var(--black)_3%,var(--dark-gray)_6%,var(--dark-gray)_9%,var(--black)_12%)]
            [background-image:var(--dark-alt),var(--aurora-alt)]
            [background-size:100%_180%,100%_140%]
            [background-position:0%_0%,0%_50%]
            filter blur-[8px] invert-0
            animate-aurora-secondary
            pointer-events-none
            absolute inset-0 opacity-50 will-change-transform mix-blend-multiply`
          )}
        ></div>
      </div>

      {/* Header */}
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-between w-[calc(100%-2rem)] max-w-6xl px-6 py-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-full">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AI Playground</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportChat}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Export Chat"
          >
            <Download className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={clearChat}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-32 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Chat Messages */}
          <div className="space-y-6 mb-8">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Start a Conversation</h3>
                <p className="text-white/70 max-w-md mx-auto">
                  Ask me anything about workflow automation, n8n, or how to build complex integrations.
                </p>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={cn(
                    "flex space-x-4",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-3xl relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 overflow-hidden group",
                    message.role === 'user' ? 'bg-white/10' : ''
                  )}>
                    <BGPattern variant="dots" mask="fade-edges" size={20} fill="#ffffff10" />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-white/60 text-sm font-medium">
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-white/60" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-white">
                        {message.role === 'assistant' ? (
                          <MarkdownRenderer content={message.content} />
                        ) : (
                          <p className="leading-relaxed">{message.content}</p>
                        )}
                      </div>
                      
                      <div className="text-white/40 text-xs mt-3">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </motion.div>
              ))
            )}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex space-x-4"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 overflow-hidden">
                  <BGPattern variant="dots" mask="fade-edges" size={20} fill="#ffffff10" />
                  <div className="relative z-10 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-white/60 text-sm">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl z-50">
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about workflow automation..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              {isRecording && (
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleVoiceToggle}
              className={cn(
                "p-3 rounded-xl transition-all duration-200 flex items-center justify-center",
                isRecording 
                  ? "bg-red-500/20 border-2 border-red-500 text-red-400" 
                  : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
              )}
            >
              {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlayground;
