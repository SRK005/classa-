'use client';

import { motion } from 'framer-motion';
import { 
  PaperAirplaneIcon, 
  SparklesIcon, 
  ArrowLeftIcon,
  LightBulbIcon,
  AcademicCapIcon,
  BookOpenIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import Link from 'next/link';
import { useOpenAIChat } from '@/app/hooks/useOpenAIChat';
import MessageRenderer from '@/components/MessageRenderer';

export default function QuestionToClarityPage() {
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    clearChat, 
    retryLastMessage, 
    cancelRequest 
  } = useOpenAIChat();
  
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const messageToSend = inputMessage;
    setInputMessage('');
    await sendMessage(messageToSend, true); // Enable streaming
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (query: string) => {
    setInputMessage(query);
  };

  const suggestionQueries = [
    "Explain Newton's laws of motion with examples",
    "How to solve quadratic equations step by step?",
    "What is the photosynthesis process in plants?",
    "Explain the basics of organic chemistry"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Orbs and Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Glowing Orb */}
        <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-gradient-radial from-purple-500/30 via-purple-600/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/6 w-80 h-80 bg-gradient-radial from-violet-500/25 via-purple-500/8 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-20 w-2 h-2 bg-purple-300 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-violet-300 rounded-full animate-ping delay-1000" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-pink-300 rounded-full animate-ping delay-2000" style={{ animationDuration: '5s' }}></div>
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/student/sense-ai" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <LightBulbIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Question to Clarity</h1>
                  <p className="text-sm text-gray-400">AI-powered doubt resolution</p>
                </div>
              </div>
            </div>
            
            {/* Status and Actions */}
            <div className="flex items-center space-x-4">
              {/* Status Indicator */}
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  isLoading ? 'bg-yellow-400' : error ? 'bg-red-400' : 'bg-green-400'
                }`}></div>
                <span className={
                  isLoading ? 'text-yellow-400' : error ? 'text-red-400' : 'text-green-400'
                }>
                  {isLoading ? 'Thinking...' : error ? 'Error' : 'AI Online'}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {isLoading && (
                  <button
                    onClick={cancelRequest}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400"
                    title="Cancel request"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
                {error && (
                  <button
                    onClick={retryLastMessage}
                    className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors text-blue-400"
                    title="Retry last message"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={clearChat}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-gray-400"
                  title="Clear chat"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Hero Section - Only show when no conversation has started */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-16 px-6"
            >
              <div className="max-w-2xl mx-auto">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-8"
                >
                  <SparklesIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Optimized for <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Thought</span>
                </h2>
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Built for <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Action</span>
                </h3>
                
                <p className="text-lg text-gray-300 mb-12">
                  Think smarter and act faster, from idea to execution in seconds.
                </p>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mb-4"
            >
              <div className="max-w-4xl mx-auto">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <XMarkIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-red-400 font-medium">Error occurred</p>
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={retryLastMessage}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-3xl ${message.isUser ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start space-x-3 ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isUser 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}>
                        {message.isUser ? (
                          <AcademicCapIcon className="w-4 h-4 text-white" />
                        ) : (
                          <SparklesIcon className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      {/* Message Bubble / Card */}
                      <div className={`${
                        message.isUser
                          ? 'px-4 py-3 rounded-2xl bg-purple-600/80 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm'
                          : 'px-6 py-5 rounded-2xl text-white bg-transparent border border-white/10 ring-1 ring-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm'
                      }`}>
                        <MessageRenderer 
                          content={message.content}
                          isStreaming={message.isStreaming}
                          className={`${message.isUser ? '' : 'text-[15px] leading-7'}`}
                        />
                        <div className="text-xs opacity-60 mt-3 text-right">
                          {message.timestamp.toTimeString().slice(0, 5)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Suggestion Queries - Only show for initial state */}
          {messages.length === 1 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="px-6 mb-6"
            >
              <div className="max-w-4xl mx-auto">
                <p className="text-gray-400 text-sm mb-4 text-center">Try asking about:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestionQueries.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(query)}
                      className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-3">
                        <BookOpenIcon className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                        <span className="text-gray-300 group-hover:text-white text-sm">{query}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-white/10 backdrop-blur-lg">
            <div className="max-w-4xl mx-auto">
              <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 p-4">
                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask for anything or use a command..."
                      className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none min-h-[60px] max-h-32"
                      rows={2}
                      disabled={isLoading}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <PaperAirplaneIcon className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </div>
              
              {/* Footer Info */}
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  SenseAI can make mistakes. Consider checking important information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 