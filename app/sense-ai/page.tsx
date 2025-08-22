'use client';

import { motion } from 'framer-motion';
import { 
  QuestionMarkCircleIcon, 
  CursorArrowRaysIcon, 
  DocumentTextIcon,
  SparklesIcon,
  LightBulbIcon,
  BoltIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';

const senseAIFeatures = [
  {
    id: 1,
    title: 'Question to Clarity',
    description: 'Transform your doubts into crystal-clear understanding with AI-powered explanations',
    icon: QuestionMarkCircleIcon,
    gradient: 'from-purple-500 via-violet-600 to-indigo-700',
    glowColor: 'purple',
    features: ['Instant Q&A', 'Step-by-step solutions', 'Multi-format support', 'Real-time responses'],
    stats: '1M+ Questions Solved',
    href: '/sense-ai/question-to-clarity'
  },
  {
    id: 2,
    title: 'Click to Clarify',
    description: 'Point, click, and get instant explanations for any concept or problem',
    icon: CursorArrowRaysIcon,
    gradient: 'from-blue-500 via-cyan-600 to-teal-700',
    glowColor: 'blue',
    features: ['Visual recognition', 'Smart highlighting', 'Context analysis', 'Interactive UI'],
    stats: '500K+ Clarifications',
    href: '/sense-ai/click-to-clarify'
  },
  {
    id: 3,
    title: 'Paper to Pixel',
    description: 'Digitize your handwritten notes and get AI-enhanced insights instantly',
    icon: DocumentTextIcon,
    gradient: 'from-pink-500 via-rose-600 to-red-700',
    glowColor: 'pink',
    features: ['OCR technology', 'Smart digitization', 'Content enhancement', 'Cloud sync'],
    stats: '250K+ Papers Digitized',
    href: '/sense-ai/paper-to-pixel'
  }
];

const stats = [
  { label: 'Doubts Resolved', value: '1000+', icon: LightBulbIcon },
  { label: 'Response Time', value: '<2s', icon: BoltIcon },
  { label: 'Accuracy Rate', value: '98.7%', icon: SparklesIcon }
];

export default function SenseAIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="relative z-10 p-6 pt-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl shadow-purple-500/25">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            SenseAI
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience the future of academic assistance with our cutting-edge AI technology.
            <br />
            <span className="text-purple-300">Transform doubts into clarity, instantly.</span>
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center border border-white/10 hover:border-purple-500/30 transition-all duration-300"
            >
              <stat.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {senseAIFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 50, rotateX: -15 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.8 + index * 0.2,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              {/* Glow Effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200`}></div>
              
              {/* Main Card */}
              <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 group-hover:border-white/20 transition-all duration-500 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center mb-6">
                  <div className={`p-3 bg-gradient-to-r ${feature.gradient} rounded-xl shadow-lg mr-4`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{feature.title}</h3>
                    <div className={`text-sm text-${feature.glowColor}-300 font-medium`}>{feature.stats}</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-6 leading-relaxed flex-grow">
                  {feature.description}
                </p>

                {/* Features List */}
                <div className="space-y-2 mb-8">
                  {feature.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center text-gray-400">
                      <div className={`w-2 h-2 bg-gradient-to-r ${feature.gradient} rounded-full mr-3`}></div>
                      <span className="text-sm">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Link href={feature.href} className="w-full">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-4 px-6 bg-gradient-to-r ${feature.gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
                  >
                    <span className="relative z-10">Launch {feature.title}</span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Experience the Future of Learning?
            </h2>
            <p className="text-gray-300 mb-6">
              Join thousands of students who have revolutionized their academic journey with SenseAI
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 