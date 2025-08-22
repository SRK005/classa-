'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, User, Calendar, Download, Share2, FileText } from 'lucide-react';
import Link from 'next/link';

interface LessonPlanData {
  content: string;
  metadata: {
    subject?: string;
    chapter?: string;
    lesson?: string;
    duration?: string;
    pace?: string;
    input?: string;
    generatedAt: string;
    method?: string;
  };
}

export default function LessonPlanDisplay() {
  const [lessonPlan, setLessonPlan] = useState<LessonPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve lesson plan from localStorage
    const storedPlan = localStorage.getItem('generatedLessonPlan');
    if (storedPlan) {
      try {
        const parsedPlan = JSON.parse(storedPlan);
        setLessonPlan(parsedPlan);
      } catch (error) {
        console.error('Error parsing lesson plan data:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleDownload = () => {
    if (!lessonPlan) return;
    
    const element = document.createElement('a');
    const file = new Blob([lessonPlan.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `lesson-plan-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = async () => {
    if (!lessonPlan) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Generated Lesson Plan',
          text: lessonPlan.content,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(lessonPlan.content);
      alert('Lesson plan copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!lessonPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">No Lesson Plan Found</h1>
          <p className="text-slate-600 mb-6">Please generate a lesson plan first.</p>
          <Link 
            href="/senseai/lesson-planner"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-sky-500 hover:to-blue-600 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Lesson Planner</span>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link 
              href="/senseai/lesson-planner"
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Planner</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-slate-700 px-4 py-2 rounded-xl hover:bg-white transition-all duration-200 border border-slate-200"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-sky-500 hover:to-blue-600 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </motion.div>

        {/* Lesson Plan Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200 mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-sky-400 to-blue-500 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Generated Lesson Plan</h1>
              <p className="text-slate-600 mt-1">Created on {formatDate(lessonPlan.metadata.generatedAt)}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lessonPlan.metadata.subject && (
              <div className="flex items-center space-x-2 bg-slate-50 rounded-xl p-3">
                <BookOpen className="w-5 h-5 text-sky-500" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Subject</p>
                  <p className="text-slate-800 font-medium">{lessonPlan.metadata.subject}</p>
                </div>
              </div>
            )}
            
            {lessonPlan.metadata.duration && (
              <div className="flex items-center space-x-2 bg-slate-50 rounded-xl p-3">
                <Clock className="w-5 h-5 text-sky-500" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Duration</p>
                  <p className="text-slate-800 font-medium">{lessonPlan.metadata.duration} min</p>
                </div>
              </div>
            )}
            
            {lessonPlan.metadata.pace && (
              <div className="flex items-center space-x-2 bg-slate-50 rounded-xl p-3">
                <User className="w-5 h-5 text-sky-500" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Pace</p>
                  <p className="text-slate-800 font-medium">{lessonPlan.metadata.pace}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 bg-slate-50 rounded-xl p-3">
              <Calendar className="w-5 h-5 text-sky-500" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Method</p>
                <p className="text-slate-800 font-medium capitalize">{lessonPlan.metadata.method || 'Form'}</p>
              </div>
            </div>
          </div>

          {lessonPlan.metadata.chapter && lessonPlan.metadata.lesson && (
            <div className="mt-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-100">
              <p className="text-slate-700">
                <span className="font-medium">Chapter:</span> {lessonPlan.metadata.chapter} • 
                <span className="font-medium">Lesson:</span> {lessonPlan.metadata.lesson}
              </p>
            </div>
          )}

          {lessonPlan.metadata.input && (
            <div className="mt-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-100">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Original Request</p>
              <p className="text-slate-700 italic">"{lessonPlan.metadata.input}"</p>
            </div>
          )}
        </motion.div>

        {/* Lesson Plan Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200"
        >
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-base">
              {lessonPlan.content}
            </div>
          </div>
        </motion.div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex justify-center space-x-4"
        >
          <Link 
            href="/senseai/lesson-planner"
            className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm text-slate-700 px-6 py-3 rounded-xl hover:bg-white transition-all duration-200 border border-slate-200"
          >
            <span>Create Another Plan</span>
          </Link>
          <Link 
            href="/senseai"
            className="flex items-center space-x-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-sky-500 hover:to-blue-600 transition-all duration-200"
          >
            <span>Back to Dashboard</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}