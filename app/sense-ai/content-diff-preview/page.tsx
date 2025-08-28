'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Layers, Users, BookOpen, Target, Lightbulb, CheckCircle, Star, Brain, Clock, Award, Atom, Microscope, FlaskConical } from 'lucide-react';
import { useRouter } from 'next/navigation';

type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

const ContentDiffPreview: React.FC = () => {
  const router = useRouter();
  const [activeLevel, setActiveLevel] = useState<LearningLevel>('beginner');

  const renderBeginnerContent = () => (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Lightbulb className="w-6 h-6" />
          <span>What is Photosynthesis? (Beginner Level)</span>
        </h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Photosynthesis is like cooking for plants! Just like you need ingredients to cook food, plants need special ingredients to make their own food.
          </p>
          <div className="bg-white rounded-lg p-4 border border-gray-300 mb-4">
            <h4 className="font-bold text-gray-700 mb-3">Plants need these ingredients:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 border border-gray-200">
                  <span className="text-2xl">☀️</span>
                </div>
                <p className="font-medium text-gray-800">Sunlight</p>
                <p className="text-sm text-gray-600">Energy from the sun</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 border border-gray-200">
                  <span className="text-2xl">💧</span>
                </div>
                <p className="font-medium text-gray-800">Water</p>
                <p className="text-sm text-gray-600">From roots</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 border border-gray-200">
                  <span className="text-2xl">🌬️</span>
                </div>
                <p className="font-medium text-gray-800">Carbon Dioxide</p>
                <p className="text-sm text-gray-600">From air</p>
              </div>
            </div>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">
            When plants mix these ingredients together in their leaves, they make sugar (their food) and oxygen (which we breathe)!
          </p>
        </div>
      </div>

      {/* Simple Process */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">How Does It Happen? (Simple Steps)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200">
              <span className="text-3xl">🌱</span>
            </div>
            <h4 className="font-bold text-gray-700 mb-2">Step 1</h4>
            <p className="text-sm text-gray-600">Plant gets sunlight on its leaves</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200">
              <span className="text-3xl">🌿</span>
            </div>
            <h4 className="font-bold text-gray-700 mb-2">Step 2</h4>
            <p className="text-sm text-gray-600">Roots drink water from soil</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200">
              <span className="text-3xl">🍃</span>
            </div>
            <h4 className="font-bold text-gray-700 mb-2">Step 3</h4>
            <p className="text-sm text-gray-600">Leaves take in air (CO₂)</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200">
              <span className="text-3xl">🍯</span>
            </div>
            <h4 className="font-bold text-gray-700 mb-2">Step 4</h4>
            <p className="text-sm text-gray-600">Plant makes sugar food!</p>
          </div>
        </div>
      </div>

      {/* Fun Facts */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Star className="w-6 h-6" />
          <span>Fun Facts About Photosynthesis!</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">🌳</span>
              <h4 className="font-bold text-gray-800">Trees are oxygen makers!</h4>
            </div>
            <p className="text-sm text-gray-600">One big tree can make oxygen for 2 people every day!</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">🍀</span>
              <h4 className="font-bold text-gray-800">Leaves are like kitchens!</h4>
            </div>
            <p className="text-sm text-gray-600">Green leaves have tiny kitchens called chloroplasts!</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">🌞</span>
              <h4 className="font-bold text-gray-800">Plants love sunny days!</h4>
            </div>
            <p className="text-sm text-gray-600">More sunlight means plants can make more food!</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">🌍</span>
              <h4 className="font-bold text-gray-800">Plants help our planet!</h4>
            </div>
            <p className="text-sm text-gray-600">They clean the air and give us fresh oxygen to breathe!</p>
          </div>
        </div>
      </div>

      {/* Simple Activity */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <CheckCircle className="w-6 h-6" />
          <span>Try This at Home!</span>
        </h3>
        <div className="bg-white rounded-lg p-4 border border-gray-300">
          <h4 className="font-bold text-gray-700 mb-3">Plant Observation Activity</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Find a green plant near your home</li>
            <li>Look at its leaves - are they green?</li>
            <li>Touch the soil - is it wet or dry?</li>
            <li>Check if the plant is in sunlight</li>
            <li>Draw a picture of your plant and label: leaves, roots, and stem</li>
          </ol>
          <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-800 font-medium">Remember: Green plants are always making food when they have sunlight, water, and air!</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntermediateContent = () => (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Brain className="w-6 h-6" />
          <span>Understanding Photosynthesis (Intermediate Level)</span>
        </h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Photosynthesis is a complex biochemical process where plants convert light energy into chemical energy. This process occurs primarily in the chloroplasts of plant cells and involves two main stages.
          </p>
          <div className="bg-white rounded-lg p-4 border border-gray-300 mb-4">
            <h4 className="font-bold text-gray-700 mb-3">The Photosynthesis Equation:</h4>
            <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
              <p className="text-lg font-mono text-gray-800">6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂</p>
              <p className="text-sm text-gray-600 mt-2">Carbon dioxide + Water + Light → Glucose + Oxygen</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Stages */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">The Two Stages of Photosynthesis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <h4 className="font-bold text-gray-700 mb-3 flex items-center space-x-2">
              <span className="text-xl">☀️</span>
              <span>Light-Dependent Reactions</span>
            </h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Occur in the thylakoid membranes</li>
              <li>• Chlorophyll absorbs light energy</li>
              <li>• Water molecules are split (photolysis)</li>
              <li>• ATP and NADPH are produced</li>
              <li>• Oxygen is released as a byproduct</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <h4 className="font-bold text-gray-700 mb-3 flex items-center space-x-2">
              <span className="text-xl">🔄</span>
              <span>Light-Independent Reactions (Calvin Cycle)</span>
            </h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Occur in the stroma of chloroplasts</li>
              <li>• CO₂ is fixed into organic molecules</li>
              <li>• Uses ATP and NADPH from light reactions</li>
              <li>• Produces glucose (C₆H₁₂O₆)</li>
              <li>• Does not directly require light</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Chloroplast Structure */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Microscope className="w-6 h-6" />
          <span>Chloroplast Structure and Function</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-300 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200">
              <span className="text-2xl">🟢</span>
            </div>
            <h4 className="font-bold text-gray-700 mb-2">Thylakoids</h4>
            <p className="text-sm text-gray-600">Membrane structures containing chlorophyll where light reactions occur</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-300 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200">
              <span className="text-2xl">💧</span>
            </div>
            <h4 className="font-bold text-gray-700 mb-2">Stroma</h4>
            <p className="text-sm text-gray-600">Fluid-filled space where the Calvin cycle takes place</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-300 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-200">
              <span className="text-2xl">🍃</span>
            </div>
            <h4 className="font-bold text-gray-700 mb-2">Chlorophyll</h4>
            <p className="text-sm text-gray-600">Green pigment that captures light energy for photosynthesis</p>
          </div>
        </div>
      </div>

      {/* Factors Affecting Photosynthesis */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Target className="w-6 h-6" />
          <span>Factors Affecting Photosynthesis Rate</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <h4 className="font-bold text-gray-700 mb-3">Limiting Factors:</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• <strong>Light Intensity:</strong> More light increases rate until saturation</li>
              <li>• <strong>CO₂ Concentration:</strong> Higher CO₂ levels boost photosynthesis</li>
              <li>• <strong>Temperature:</strong> Optimal range for enzyme activity</li>
              <li>• <strong>Water Availability:</strong> Essential for light reactions</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <h4 className="font-bold text-gray-700 mb-3">Environmental Impact:</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Seasonal variations affect photosynthesis rates</li>
              <li>• Pollution can reduce light availability</li>
              <li>• Climate change affects global photosynthesis</li>
              <li>• Deforestation reduces oxygen production</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedContent = () => (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Award className="w-6 h-6" />
          <span>Advanced Photosynthesis Mechanisms</span>
        </h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Photosynthesis represents one of the most sophisticated energy conversion processes in biology, involving intricate molecular mechanisms, electron transport chains, and regulatory systems that have evolved over billions of years.
          </p>
          <div className="bg-white rounded-lg p-4 border border-gray-300 mb-4">
            <h4 className="font-bold text-gray-700 mb-3">Quantum Efficiency and Energy Transfer:</h4>
            <p className="text-gray-600 mb-2">The photosynthetic apparatus achieves near-perfect quantum efficiency (~95%) in converting absorbed photons to chemical energy through:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>Antenna complex light-harvesting systems</li>
              <li>Excitation energy transfer via Förster resonance</li>
              <li>Charge separation in reaction centers</li>
              <li>Electron transport chain optimization</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Molecular Mechanisms */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Molecular Mechanisms and Pathways</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <h4 className="font-bold text-gray-700 mb-3 flex items-center space-x-2">
              <FlaskConical className="w-5 h-5" />
              <span>Photosystem II (P680)</span>
            </h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Water-splitting complex (Mn₄CaO₅ cluster)</li>
              <li>• Primary electron donor P680</li>
              <li>• Pheophytin as primary electron acceptor</li>
              <li>• Plastoquinone reduction and proton pumping</li>
              <li>• Oxygen evolution and proton gradient formation</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <h4 className="font-bold text-gray-700 mb-3 flex items-center space-x-2">
              <Atom className="w-5 h-5" />
              <span>Photosystem I (P700)</span>
            </h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• Iron-sulfur clusters in electron transport</li>
              <li>• Ferredoxin reduction and NADPH formation</li>
              <li>• Cyclic electron flow regulation</li>
              <li>• ATP synthesis via chemiosmotic coupling</li>
              <li>• Redox regulation of Calvin cycle enzymes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Calvin Cycle Regulation */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Target className="w-6 h-6" />
          <span>Calvin Cycle Regulation and Optimization</span>
        </h3>
        <div className="bg-white rounded-lg p-4 border border-gray-300">
          <h4 className="font-bold text-gray-700 mb-3">Key Regulatory Mechanisms:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold text-gray-700 mb-2">Enzyme Regulation:</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• RuBisCO activation by RuBisCO activase</li>
                <li>• Thioredoxin-mediated enzyme modulation</li>
                <li>• Allosteric regulation by metabolites</li>
                <li>• Post-translational modifications</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-700 mb-2">Metabolic Control:</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Feedback inhibition by end products</li>
                <li>• Substrate availability regulation</li>
                <li>• Energy charge sensing (ATP/ADP ratios)</li>
                <li>• Circadian rhythm synchronization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* C4 and CAM Photosynthesis */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <Microscope className="w-6 h-6" />
          <span>Alternative Photosynthetic Pathways</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <h4 className="font-bold text-gray-700 mb-3">C4 Photosynthesis:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Spatial separation of CO₂ fixation</li>
              <li>• PEP carboxylase in mesophyll cells</li>
              <li>• CO₂ concentration in bundle sheath cells</li>
              <li>• Reduced photorespiration losses</li>
              <li>• Enhanced efficiency in hot, dry climates</li>
              <li>• Examples: Maize, sugarcane, sorghum</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <h4 className="font-bold text-gray-700 mb-3">CAM Photosynthesis:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Temporal separation of CO₂ fixation</li>
              <li>• Nighttime CO₂ uptake and storage</li>
              <li>• Daytime stomatal closure</li>
              <li>• Malate decarboxylation for CO₂ release</li>
              <li>• Water conservation adaptation</li>
              <li>• Examples: Cacti, pineapple, agave</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Research Applications */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <FlaskConical className="w-6 h-6" />
          <span>Current Research and Applications</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <h4 className="font-bold text-gray-700 mb-3">Biotechnology Applications:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Artificial photosynthesis systems</li>
              <li>• Enhanced crop photosynthetic efficiency</li>
              <li>• Biofuel production optimization</li>
              <li>• Carbon capture and utilization</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-300">
            <h4 className="font-bold text-gray-700 mb-3">Climate Change Research:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• CO₂ fertilization effects</li>
              <li>• Temperature stress responses</li>
              <li>• Drought adaptation mechanisms</li>
              <li>• Global carbon cycle modeling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const getLevelContent = () => {
    switch (activeLevel) {
      case 'beginner':
        return renderBeginnerContent();
      case 'intermediate':
        return renderIntermediateContent();
      case 'advanced':
        return renderAdvancedContent();
      default:
        return renderBeginnerContent();
    }
  };

  const getLevelInfo = () => {
    switch (activeLevel) {
      case 'beginner':
        return {
          icon: <Star className="w-5 h-5 text-white" />,
          title: 'Beginner Level Content',
          description: 'Simple language, visual aids, basic concepts',
          readingTime: '10-15 minutes'
        };
      case 'intermediate':
        return {
          icon: <Brain className="w-5 h-5 text-white" />,
          title: 'Intermediate Level Content',
          description: 'Detailed explanations, scientific terminology, process analysis',
          readingTime: '15-20 minutes'
        };
      case 'advanced':
        return {
          icon: <Award className="w-5 h-5 text-white" />,
          title: 'Advanced Level Content',
          description: 'Complex mechanisms, molecular details, research applications',
          readingTime: '20-30 minutes'
        };
      default:
        return {
          icon: <Star className="w-5 h-5 text-white" />,
          title: 'Beginner Level Content',
          description: 'Simple language, visual aids, basic concepts',
          readingTime: '10-15 minutes'
        };
    }
  };

  return (
    <div className="min-h-screen bg-white">
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
              <h1 className="text-3xl font-bold text-gray-900">Differentiated Content Preview</h1>
              <p className="text-gray-600 mt-1">Photosynthesis - Adapted for Different Learning Levels</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-lg">
              <Download className="w-4 h-4" />
              <span>Download Content</span>
            </button>
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600">
              <Layers className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-2xl"
          >
            {/* Content Info Header */}
            <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Photosynthesis</h2>
                    <p className="text-gray-600">Class 7 Science | Chapter 1: Life Processes</p>
                    <p className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                      <Target className="w-4 h-4" />
                      <span>Differentiated for 3 Learning Levels</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">Multi-Level</div>
                  <p className="text-sm text-gray-600">Content Adaptation</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-600">All learners included</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Levels Tabs */}
            <div className="flex space-x-4 mb-8 bg-white p-2 rounded-xl border border-gray-200">
              <button
                onClick={() => setActiveLevel('beginner')}
                className={`flex-1 rounded-lg p-3 text-center font-medium transition-all duration-300 ${
                  activeLevel === 'beginner'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Beginner Level</span>
                </div>
              </button>
              <button
                onClick={() => setActiveLevel('intermediate')}
                className={`flex-1 rounded-lg p-3 text-center font-medium transition-all duration-300 ${
                  activeLevel === 'intermediate'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Intermediate Level</span>
                </div>
              </button>
              <button
                onClick={() => setActiveLevel('advanced')}
                className={`flex-1 rounded-lg p-3 text-center font-medium transition-all duration-300 ${
                  activeLevel === 'advanced'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Advanced Level</span>
                </div>
              </button>
            </div>

            {/* Dynamic Content */}
            <motion.div
              key={activeLevel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {getLevelContent()}
            </motion.div>

            {/* Level Indicator */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activeLevel === 'beginner' ? 'bg-green-500' :
                    activeLevel === 'intermediate' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    {getLevelInfo().icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{getLevelInfo().title}</h4>
                    <p className="text-sm text-gray-600">{getLevelInfo().description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Reading Time: {getLevelInfo().readingTime}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Generated by SenseAI Content Differentiator</span>
                <span>Adapted for {activeLevel.charAt(0).toUpperCase() + activeLevel.slice(1)} Level | 3 levels available</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContentDiffPreview;