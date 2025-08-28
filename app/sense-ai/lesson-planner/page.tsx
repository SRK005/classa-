'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Users, MessageSquare, Sparkles, Send, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../components/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface FormData {
  class: string;
  subject: string;
  chapter: string;
  lesson: string;
  minutes: string;
  pace: string;
}

const LessonPlanner: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'form' | 'chat'>('form');
  const [formData, setFormData] = useState<FormData>({
    class: '',
    subject: '',
    chapter: '',
    lesson: '',
    minutes: '',
    pace: 'medium'
  });
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState('');

  // Sample data - in real app, this would come from your database
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'Science', 'Biology', 'Chemistry', 'Physics', 'English', 'Hindi', 'Social Science'];
  const chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
  const lessons = ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4', 'Lesson 5'];
  const durations = ['30 minutes', '40 minutes', '45 minutes', '60 minutes', '90 minutes'];
  const paces = ['Slow', 'Medium', 'Fast'];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.chapter || !formData.lesson || !formData.minutes) {
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `Create a detailed lesson plan for:
        Subject: ${formData.subject}
        Chapter: ${formData.chapter}
        Lesson: ${formData.lesson}
        Duration: ${formData.minutes} minutes
        Learning Pace: ${formData.pace}
        
        Please include:
        1. Learning objectives
        2. Materials needed
        3. Lesson structure with time allocation
        4. Activities and teaching methods
        5. Assessment strategies
        6. Homework/follow-up activities`;

      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate lesson plan');
      }

      const data = await response.json();
      
      // Store lesson plan data and redirect to display page
      localStorage.setItem('generatedLessonPlan', JSON.stringify({
        content: data.lessonPlan,
        metadata: {
          subject: formData.subject,
          chapter: formData.chapter,
          lesson: formData.lesson,
          duration: formData.minutes,
          pace: formData.pace,
          generatedAt: new Date().toISOString()
        }
      }));
      
      // Redirect to lesson plan display page
      window.location.href = '/senseai/lesson-plan-display';
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      alert('Failed to generate lesson plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setIsGenerating(true);

    try {
      const prompt = `Based on this request: "${chatInput}"
        
        Create a comprehensive lesson plan that includes:
        1. Learning objectives
        2. Materials needed
        3. Lesson structure with time allocation
        4. Activities and teaching methods
        5. Assessment strategies
        6. Homework/follow-up activities
        
        Make sure the lesson plan is detailed, engaging, and appropriate for the specified grade level and subject.`;

      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate lesson plan');
      }

      const data = await response.json();
      
      // Store lesson plan data and redirect to display page
      localStorage.setItem('generatedLessonPlan', JSON.stringify({
        content: data.lessonPlan,
        metadata: {
          input: chatInput,
          generatedAt: new Date().toISOString(),
          method: 'chat'
        }
      }));
      
      // Redirect to lesson plan display page
      window.location.href = '/senseai/lesson-plan-display';
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      alert('Failed to generate lesson plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/senseai')}
              className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-200 hover:bg-white hover:border-blue-300 transition-all duration-300 shadow-lg text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Lesson Planner</h1>
              <p className="text-gray-600 mt-1">Create comprehensive lesson plans with AI assistance</p>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        {/* Tab Navigation - Horizontal */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white/90 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                activeTab === 'form'
                  ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Structured Form</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg transform scale-105'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-slate-200 shadow-xl mb-8"
          >
              <AnimatePresence mode="wait">
                {activeTab === 'form' ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-sky-500" />
                      <span>Create Lesson Plan</span>
                    </h2>
                    
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                      {/* Class Selection */}
                      <div className="relative">
                        <label className="block text-slate-700 text-sm font-medium mb-2">Class</label>
                        <div className="relative">
                          <select
                            value={formData.class}
                            onChange={(e) => setFormData({...formData, class: e.target.value})}
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none shadow-sm"
                            required
                          >
                            <option value="" className="bg-white text-slate-800">Select Class</option>
                            {classes.map((cls) => (
                              <option key={cls} value={cls} className="bg-white text-slate-800">{cls}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Subject Selection */}
                        <div className="relative">
                          <label className="block text-slate-700 text-sm font-medium mb-2">Subject</label>
                          <div className="relative">
                            <select
                              value={formData.subject}
                              onChange={(e) => setFormData({...formData, subject: e.target.value})}
                              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none shadow-sm"
                              required
                            >
                              <option value="" className="bg-white text-slate-800">Select Subject</option>
                              {subjects.map((subject) => (
                                <option key={subject} value={subject} className="bg-white text-slate-800">{subject}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                      {/* Chapter Selection */}
                        <div className="relative">
                          <label className="block text-slate-700 text-sm font-medium mb-2">Chapter</label>
                          <div className="relative">
                            <select
                              value={formData.chapter}
                              onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none shadow-sm"
                              required
                            >
                              <option value="" className="bg-white text-slate-800">Select Chapter</option>
                              {chapters.map((chapter) => (
                                <option key={chapter} value={chapter} className="bg-white text-slate-800">{chapter}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Lesson Selection */}
                        <div className="relative">
                          <label className="block text-slate-700 text-sm font-medium mb-2">Lesson</label>
                          <div className="relative">
                            <select
                              value={formData.lesson}
                              onChange={(e) => setFormData({...formData, lesson: e.target.value})}
                              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none shadow-sm"
                              required
                            >
                              <option value="" className="bg-white text-slate-800">Select Lesson</option>
                              {lessons.map((lesson) => (
                                <option key={lesson} value={lesson} className="bg-white text-slate-800">{lesson}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                      {/* Duration and Pace */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <label className="block text-slate-700 text-sm font-medium mb-2">Duration</label>
                            <div className="relative">
                              <select
                                value={formData.minutes}
                                onChange={(e) => setFormData({...formData, minutes: e.target.value})}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none shadow-sm"
                                required
                              >
                                <option value="" className="bg-white text-slate-800">Duration</option>
                                {durations.map((duration) => (
                                  <option key={duration} value={duration} className="bg-white text-slate-800">{duration}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <label className="block text-slate-700 text-sm font-medium mb-2">Learning Pace</label>
                            <div className="relative">
                              <select
                                value={formData.pace}
                                onChange={(e) => setFormData({...formData, pace: e.target.value})}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none shadow-sm"
                              >
                                {paces.map((pace) => (
                                  <option key={pace} value={pace.toLowerCase()} className="bg-white text-slate-800">{pace} Pace</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            <span>Generate Lesson Plan</span>
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-sky-500" />
                      <span>AI Chat Interface</span>
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-slate-700 text-sm mb-2">Example:</p>
                        <p className="text-slate-600 text-sm italic">
                          "Biology class 12, chapter 2, Lesson 1 in about 40 minutes for Medium Pace learners"
                        </p>
                      </div>
                      
                      <form onSubmit={handleChatSubmit} className="space-y-4">
                        <div className="relative">
                          <textarea
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Describe your lesson plan requirements in natural language..."
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-4 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none h-32 shadow-sm"
                            required
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isGenerating || !chatInput.trim()}
                          className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
                        >
                          {isGenerating ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              <span>Generate with AI</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          {/* Placeholder for future lesson plan display - removed inline display */}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanner;