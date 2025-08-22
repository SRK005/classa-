'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Target, 
  Users, 
  BarChart3, 
  Lightbulb, 
  Sparkles,
  ArrowRight,
  Settings,
  Menu,
  X,
  BookOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '../../components/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseClient';

// AI Tools data for SenseAI - Teacher-focused Tools
const aiTools = [
  {
    key: 'lesson-planner',
    name: 'Lesson Planner',
    description: 'Creates daily/weekly lesson plans directly from NCERT chapters with activities',
    icon: BookOpen,
    stats: { plans: '2.5K+', time_saved: '80%' }
  },
  {
    key: 'worksheet-generator',
    name: 'Smart Worksheet Generator',
    description: 'Generates exercises, question papers, and homework sheets from any chapter',
    icon: Target,
    stats: { worksheets: '15K+', variety: '95%' }
  },
  {
    key: 'teaching-aid-designer',
    name: 'Teaching Aid Designer',
    description: 'Converts NCERT concepts into stories, visuals, or classroom activities',
    icon: Lightbulb,
    stats: { aids: '8K+', engagement: '+75%' }
  },
  {
    key: 'performance-analyzer',
    name: 'Student Performance Analyzer',
    description: 'Tracks student test results, highlights weak areas, and suggests NCERT-based remedial teaching',
    icon: BarChart3,
    stats: { students: '25K+', improvement: '+60%' }
  },
  {
    key: 'content-differentiator',
    name: 'Content Differentiator',
    description: 'Adjusts NCERT lessons to suit slow learners, average learners, and advanced learners',
    icon: Users,
    stats: { adaptations: '12K+', inclusion: '98%' }
  },
  {
    key: 'quiz-maker',
    name: 'Interactive Quiz & Poll Maker',
    description: 'Generates fun in-class quizzes, polls, and interactive games from NCERT chapters',
    icon: Sparkles,
    stats: { quizzes: '18K+', participation: '+85%' }
  },
  {
    key: 'homework-creator',
    name: 'Worksheet & Homework Creator',
    description: 'Easy/medium/advanced sets from the same chapter; includes remedial and enrichment variants',
    icon: Zap,
    stats: { assignments: '22K+', differentiation: '100%' }
  },
  {
    key: 'slide-maker',
    name: 'PPT/Blackboard Slide Maker',
    description: 'Produces clean slides with diagrams, key points, and short activities; exports to PPT/Google Slides',
    icon: Settings,
    stats: { slides: '35K+', time_saved: '70%' }
  },
  {
    key: 'question-bank-tagger',
    name: 'Question Bank Tagger',
    description: 'Auto-tags your items by LO, difficulty, cognitive level, and chapter; de-duplicates similar questions',
    icon: Target,
    stats: { questions: '50K+', organization: '99%' }
  }
];

const SenseAIDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const router = useRouter();
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.username || userData.name || 'User');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setUsername('');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: `
          radial-gradient(1200px 600px at 50% 6%, rgba(40,255,210,.08), rgba(0,0,0,0) 60%),
          radial-gradient(1000px 600px at 50% 100%, rgba(15, 80, 70, .85), rgba(8, 20, 18, 1) 70%),
          radial-gradient(2200px 900px at 50% -10%, rgba(10,170,150,.18), rgba(0,0,0,0) 60%),
          #061311
        `
      }}>
        <motion.div
           className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full"
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
         />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden text-white" style={{
      background: `
        radial-gradient(1200px 600px at 50% 6%, rgba(147,51,234,.08), rgba(0,0,0,0) 60%),
        radial-gradient(1000px 600px at 50% 100%, rgba(88,28,135,.85), rgba(17,12,28,1) 70%),
        radial-gradient(2200px 900px at 50% -10%, rgba(126,34,206,.18), rgba(0,0,0,0) 60%),
        #0f0a1a
      `
    }}>
      {/* Star field background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-55"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,.35) 50%, transparent 51%),
            radial-gradient(1px 1px at 30% 40%, rgba(255,255,255,.25) 50%, transparent 51%),
            radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,.35) 50%, transparent 51%),
            radial-gradient(1px 1px at 85% 60%, rgba(255,255,255,.30) 50%, transparent 51%),
            radial-gradient(1px 1px at 50% 70%, rgba(255,255,255,.22) 50%, transparent 51%),
            radial-gradient(1px 1px at 15% 80%, rgba(255,255,255,.22) 50%, transparent 51%)
          `,
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Horizon/Planet Arc Effect - Top Position */}
      <div className="absolute left-1/2 top-[+67px] transform -translate-x-1/2 w-[2000px] h-[1200px] pointer-events-none z-[1]">
        {/* Bright edge ring */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(2000px 1200px at 50% 75%, rgba(255,255,255,0) 59.5%, rgba(255,255,255,.9) 60.5%, rgba(255,255,255,0) 61.2%),
              radial-gradient(2000px 1200px at 50% 75%, rgba(168,85,247,0) 58%, rgba(168,85,247,.45) 61%, rgba(168,85,247,0) 66%)
            `,
            filter: 'blur(.5px) drop-shadow(0 0 12px rgba(147,51,234,.45)) drop-shadow(0 0 24px rgba(147,51,234,.28))'
          }}
        />
        {/* Soft atmospheric dome */}
        <div 
          className="absolute inset-0 opacity-55"
          style={{
            background: 'radial-gradient(2200px 1500px at 50% 62%, rgba(147,51,234,.18), rgba(147,51,234,0) 65%)',
            filter: 'blur(60px)'
          }}
        />
      </div>
      
      {/* Horizon caps - Top Position */}
      <div className="absolute top-[120px] left-[-60px] w-[220px] h-[220px] rounded-full pointer-events-none z-[2]" style={{
        background: 'radial-gradient(closest-side, rgba(168,85,247,.65), rgba(168,85,247,0) 65%)',
        filter: 'blur(2px)'
      }} />
      <div className="absolute top-[120px] right-[-60px] w-[220px] h-[220px] rounded-full pointer-events-none z-[2]" style={{
        background: 'radial-gradient(closest-side, rgba(168,85,247,.65), rgba(168,85,247,0) 65%)',
        filter: 'blur(2px)'
      }} />
      
      {/* Moving Beam Effect */}
      <motion.div
        className="absolute left-0 top-[120px] w-[100px] h-[2px] pointer-events-none z-[3]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)',
          boxShadow: '0 0 20px rgba(147,51,234,0.8), 0 0 40px rgba(147,51,234,0.6), 0 0 60px rgba(147,51,234,0.4)'
        }}
        animate={{
           x: [-100, windowWidth + 100],
           opacity: [0, 1, 1, 0]
         }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 2
        }}
      />
      
      {/* Secondary Beam Effect */}
      <motion.div
        className="absolute left-0 top-[140px] w-[150px] h-[1px] pointer-events-none z-[3]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.7) 50%, transparent 100%)',
          boxShadow: '0 0 15px rgba(168,85,247,0.6), 0 0 30px rgba(168,85,247,0.4)'
        }}
        animate={{
           x: [-150, windowWidth + 150],
           opacity: [0, 0.8, 0.8, 0]
         }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 3,
          delay: 1
        }}
      />
      
      {/* Aurora effect */}
       <div 
         className="absolute top-0 right-[-5%] w-[35%] h-full pointer-events-none opacity-42"
         style={{
           background: 'linear-gradient(200deg, rgba(147,51,234,.22) 10%, rgba(147,51,234,0) 70%)',
           filter: 'blur(55px)'
         }}
       />
      
      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(1200px 500px at 50% 110%, rgba(0,0,0,0), rgba(0,0,0,.65) 75%),
            radial-gradient(1400px 800px at 50% -150px, rgba(0,0,0,0), rgba(0,0,0,.5) 75%)
          `
        }}
      />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600">
             <Brain className="w-8 h-8 text-white" />
           </div>
          <span className="text-2xl font-bold text-white">SenseAI</span>
        </motion.div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => router.push('/classaScreen')}
            className="text-white/80 hover:text-white transition-colors font-medium"
          >
            Dashboard
          </button>
          <button 
            onClick={() => router.push('/analytics')}
            className="text-white/80 hover:text-white transition-colors font-medium"
          >
            Analytics
          </button>
          <button 
            onClick={() => router.push('/tools')}
            className="text-white/80 hover:text-white transition-colors font-medium"
          >
            Tools
          </button>
          <button 
            onClick={() => router.push('/settings')}
            className="text-white/80 hover:text-white transition-colors font-medium"
          >
            Settings
          </button>
        </div>
        
        {/* Get Started Button */}
        <motion.button
          onClick={() => router.push('/questionBank')}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white/90 transition-all duration-300 hover:scale-105"
          style={{
             background: 'rgba(168,85,247,.08)',
             backdropFilter: 'blur(8px)',
             border: '1px solid rgba(147,51,234,.22)',
             boxShadow: '0 6px 20px rgba(0,0,0,.35), inset 0 0 30px rgba(147,51,234,.06)'
           }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden absolute top-20 left-4 right-4 z-20 p-6 rounded-2xl"
          style={{
             background: 'rgba(168,85,247,.08)',
             backdropFilter: 'blur(8px)',
             border: '1px solid rgba(147,51,234,.22)',
             boxShadow: '0 6px 20px rgba(0,0,0,.35), inset 0 0 30px rgba(147,51,234,.06)'
           }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-4">
            <button 
              onClick={() => { router.push('/classaScreen'); setMobileMenuOpen(false); }}
              className="block w-full text-left text-white/80 hover:text-white transition-colors font-medium"
            >
              Dashboard
            </button>
            <button 
              onClick={() => { router.push('/analytics'); setMobileMenuOpen(false); }}
              className="block w-full text-left text-white/80 hover:text-white transition-colors font-medium"
            >
              Analytics
            </button>
            <button 
              onClick={() => { router.push('/tools'); setMobileMenuOpen(false); }}
              className="block w-full text-left text-white/80 hover:text-white transition-colors font-medium"
            >
              Tools
            </button>
            <button 
              onClick={() => { router.push('/questionBank'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 rounded-lg bg-purple-500/20 text-white font-medium"
            >
              Get Started
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Hero Section */}
      <section className="relative z-10 max-w-4xl mx-auto pt-32 md:pt-48 text-center px-4">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 mb-8"
          style={{
             background: 'rgba(168,85,247,.08)',
             backdropFilter: 'blur(8px)',
             border: '1px solid rgba(147,51,234,.22)',
             boxShadow: 'inset 0 0 0 1px rgba(147,51,234,.35), 0 0 0 1px rgba(126,34,206,.12)'
           }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          AI-Powered Education
        </motion.div>
        
        {/* Main Heading */}
        <motion.h1 
          className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Building the Future of
          <span className="block mt-3">Intelligent Learning</span>
        </motion.h1>
        
        {/* Description */}
        <motion.p 
          className="mt-6 text-white/80 max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          SenseAI delivers scalable and intelligent educational solutions, reshaping how students learn and teachers teach in the digital age.
        </motion.p>
        
        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <button 
            onClick={() => router.push('/questionBank')}
            className="group flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white transition-all duration-300 hover:scale-105"
            style={{
               background: 'rgba(168,85,247,.08)',
               backdropFilter: 'blur(8px)',
               border: '1px solid rgba(147,51,234,.22)',
               boxShadow: 'inset 0 0 0 1px rgba(147,51,234,.35), 0 0 0 1px rgba(126,34,206,.12)'
             }}
          >
            <span>Start Learning</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button 
            onClick={() => router.push('/demo')}
            className="px-6 py-3 rounded-full text-sm font-medium text-white/80 hover:text-white border border-white/20 hover:border-white/40 transition-all duration-300"
          >
            Watch Demo
          </button>
        </motion.div>
      </section>
      
      {/* AI Tools Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            AI-Powered Learning Tools
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Discover our comprehensive suite of artificial intelligence tools designed to enhance every aspect of the educational experience.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiTools.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <motion.div
                key={tool.key}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                  tool.key === 'lesson-planner' ? 'group' : ''
                }`}
                style={{
                   background: 'rgba(168,85,247,.08)',
                   backdropFilter: 'blur(8px)',
                   border: '1px solid rgba(147,51,234,.22)',
                   boxShadow: '0 6px 20px rgba(0,0,0,.35), inset 0 0 30px rgba(147,51,234,.06)'
                 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => {
                  if (tool.key === 'lesson-planner') {
                    router.push('/senseai/lesson-planner');
                  } else if (tool.key === 'question-bank-tagger') {
                    router.push('/senseai/question-bank-tagger');
                  } else {
                    router.push(`/tools/${tool.key}`);
                  }
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600">
                     <IconComponent className="w-6 h-6 text-white" />
                   </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{tool.name}</h3>
                    <p className="text-white/70 text-sm mb-4">{tool.description}</p>
                    <div className="flex space-x-4 text-xs text-white/60">
                      {Object.entries(tool.stats).map(([key, value]) => (
                        <span key={key} className="flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {tool.key === 'lesson-planner' && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SenseAIDashboard;