'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Lightbulb, BookOpen, Users, Target, Star, Heart, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TeachingAidPreview: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{
      background: `
        #ffffff,
        radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.06) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(34, 197, 94, 0.04) 0%, transparent 50%)
      `
    }}>
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
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Teaching Aid Preview</h1>
              <p className="text-white/80 mt-1">Interactive Story - The Water Cycle Adventure</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-lg">
              <Download className="w-4 h-4" />
              <span>Download Materials</span>
            </button>
            <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-2xl"
          >
            {/* Teaching Aid Header */}
            <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">The Water Cycle Adventure</h2>
              <p className="text-lg text-gray-600 mb-4">An Interactive Teaching Story for Class 5 Science</p>
              <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Class: 5th Grade</span>
                </span>
                <span className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>Subject: Science</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>Topic: Water Cycle</span>
                </span>
              </div>
            </div>

            {/* Story Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Story Text */}
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                  <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span>Chapter 1: Droppy's Journey Begins</span>
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Meet Droppy, a tiny water droplet living happily in the vast blue ocean! 
                    Droppy loves swimming with fish and playing with waves, but today something 
                    magical is about to happen...
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-blue-700 font-medium mb-2">🌊 Interactive Element:</p>
                    <p className="text-sm text-gray-600">
                      "Students, can you guess what happens when the sun shines on the ocean? 
                      Let's help Droppy discover the magic of evaporation!"
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6 border-l-4 border-yellow-500">
                  <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Chapter 2: Rising to the Sky</span>
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    As the warm sun rays touch Droppy, something amazing happens! Droppy feels 
                    lighter and lighter, and suddenly starts floating up, up, up into the sky! 
                    "Wheee!" cries Droppy, "I'm flying!"
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <p className="text-yellow-700 font-medium mb-2">☀️ Science Fact:</p>
                    <p className="text-sm text-gray-600">
                      This process is called EVAPORATION - when water changes from liquid to gas 
                      and rises into the atmosphere!
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-gray-500">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Chapter 3: Cloud Friends</span>
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    High up in the sky, Droppy meets millions of other water droplets! Together, 
                    they form beautiful, fluffy clouds. "We're a team now!" says Droppy, 
                    dancing with new friends in the cool sky.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 font-medium mb-2">☁️ Activity Time:</p>
                    <p className="text-sm text-gray-600">
                      "Let's all stand up and pretend to be water droplets forming clouds! 
                      Hold hands and sway together like Droppy and friends!"
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Elements */}
              <div className="space-y-6">
                {/* Diagram */}
                <div className="bg-gradient-to-b from-blue-100 to-green-100 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Water Cycle Diagram</h3>
                  <div className="relative h-64 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-6xl mb-2">🌊☀️☁️🌧️</div>
                      <p className="text-sm">Interactive Water Cycle Animation</p>
                      <p className="text-xs mt-1">(Click to see Droppy's journey!)</p>
                    </div>
                  </div>
                </div>

                {/* Learning Objectives */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-green-800 mb-4">Learning Objectives</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Understand the concept of evaporation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Learn about cloud formation (condensation)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Identify precipitation and collection</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Recognize the continuous nature of water cycle</span>
                    </li>
                  </ul>
                </div>

                {/* Interactive Activities */}
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-purple-800 mb-4">Classroom Activities</h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <h4 className="font-medium text-purple-700 mb-1">🎭 Role Play</h4>
                      <p className="text-xs text-gray-600">Students act as water droplets going through the cycle</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <h4 className="font-medium text-purple-700 mb-1">🎨 Draw & Label</h4>
                      <p className="text-xs text-gray-600">Create their own water cycle diagram with Droppy</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-100">
                      <h4 className="font-medium text-purple-700 mb-1">🧪 Simple Experiment</h4>
                      <p className="text-xs text-gray-600">Observe evaporation using a bowl of water</p>
                    </div>
                  </div>
                </div>

                {/* Assessment Questions */}
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <h3 className="text-lg font-bold text-orange-800 mb-4">Quick Assessment</h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white rounded-lg p-3 border border-orange-100">
                      <p className="font-medium text-gray-700 mb-2">1. What happens to Droppy when the sun shines on the ocean?</p>
                      <p className="text-xs text-gray-500">Expected: Droppy evaporates and rises to the sky</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-100">
                      <p className="font-medium text-gray-700 mb-2">2. How do clouds form in our story?</p>
                      <p className="text-xs text-gray-500">Expected: Water droplets come together in the sky</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-100">
                      <p className="font-medium text-gray-700 mb-2">3. Can you name the four stages of water cycle?</p>
                      <p className="text-xs text-gray-500">Expected: Evaporation, Condensation, Precipitation, Collection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Continuation */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Continue the Adventure...</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-700 mb-2">🌧️ Chapter 4: The Great Fall</h4>
                    <p className="text-sm text-gray-600">Droppy and friends become too heavy and start their journey back to Earth as rain!</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h4 className="font-medium text-green-700 mb-2">🏞️ Chapter 5: Back Home</h4>
                    <p className="text-sm text-gray-600">Droppy flows through rivers and streams, ready to start the cycle again!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Generated by SenseAI Teaching Aid Designer</span>
                <span>Duration: 45 minutes | Interactive Story Format</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeachingAidPreview;