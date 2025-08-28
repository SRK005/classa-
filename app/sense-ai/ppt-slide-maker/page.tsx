'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  BookOpen, 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  Users,
  Settings,
  ChevronDown,
  Plus,
  Trash2,
  Download,
  Eye,
  Target,
  Zap,
  BookMarked,
  Clock,
  BarChart3,
  CheckCircle,
  XCircle,
  Calendar,
  Home,
  Presentation,
  Image,
  Type,
  Palette
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SlideData {
  class: string;
  subject: string;
  chapter: string;
  lesson: string;
  topic: string;
  presentationType: string;
  slideCount: number;
  duration: number;
  template: string;
  colorScheme: string;
  includeImages: boolean;
  includeAnimations: boolean;
  includeNotes: boolean;
  includeQuizSlides: boolean;
  includeReferences: boolean;
  fontStyle: string;
  slideContent: string[];
  learningObjectives: string[];
  customInstructions: string;
}

const PPTSlideMaker: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [slideData, setSlideData] = useState<SlideData>({
    class: '',
    subject: '',
    chapter: '',
    lesson: '',
    topic: '',
    presentationType: 'lesson',
    slideCount: 15,
    duration: 30,
    template: 'modern',
    colorScheme: 'blue',
    includeImages: true,
    includeAnimations: false,
    includeNotes: true,
    includeQuizSlides: false,
    includeReferences: true,
    fontStyle: 'professional',
    slideContent: ['title-slide', 'objectives', 'content'],
    learningObjectives: ['understand-concepts'],
    customInstructions: ''
  });

  // Sample data for dropdowns
  const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Physics', 'Chemistry', 'Biology'];
  const chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
  const lessons = ['Lesson 1.1', 'Lesson 1.2', 'Lesson 1.3', 'Lesson 2.1', 'Lesson 2.2'];

  const presentationTypes = [
    { value: 'lesson', label: 'Lesson Presentation' },
    { value: 'review', label: 'Review Session' },
    { value: 'introduction', label: 'Topic Introduction' },
    { value: 'summary', label: 'Chapter Summary' },
    { value: 'assessment', label: 'Assessment Prep' },
    { value: 'project', label: 'Project Presentation' }
  ];

  const templates = [
    { value: 'modern', label: 'Modern', preview: 'Clean and contemporary design' },
    { value: 'academic', label: 'Academic', preview: 'Traditional educational style' },
    { value: 'creative', label: 'Creative', preview: 'Colorful and engaging' },
    { value: 'minimal', label: 'Minimal', preview: 'Simple and focused' },
    { value: 'professional', label: 'Professional', preview: 'Business-like appearance' },
    { value: 'playful', label: 'Playful', preview: 'Fun and interactive' }
  ];

  const colorSchemes = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'teal', label: 'Teal', color: 'bg-teal-500' },
    { value: 'indigo', label: 'Indigo', color: 'bg-indigo-500' },
    { value: 'gray', label: 'Gray', color: 'bg-gray-500' }
  ];

  const fontStyles = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'bold', label: 'Bold' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'modern', label: 'Modern' }
  ];

  const slideContentOptions = [
    'title-slide',
    'objectives',
    'content',
    'examples',
    'activities',
    'quiz-questions',
    'summary',
    'references',
    'thank-you',
    'discussion-points'
  ];

  const learningObjectiveOptions = [
    'understand-concepts',
    'apply-knowledge',
    'analyze-information',
    'synthesize-ideas',
    'evaluate-solutions',
    'remember-facts',
    'develop-skills',
    'critical-thinking'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideData.subject.trim() || !slideData.chapter.trim()) return;
    
    setIsLoading(true);
    try {
      // Generate sample slide presentation
      const slidePresentation = {
        ...slideData,
        generatedPresentation: {
          id: `presentation_${Date.now()}`,
          title: `${slideData.subject} - ${slideData.chapter}${slideData.topic ? ` (${slideData.topic})` : ''}`,
          description: `${slideData.presentationType.charAt(0).toUpperCase() + slideData.presentationType.slice(1)} presentation for ${slideData.chapter}`,
          slides: Array.from({ length: slideData.slideCount }, (_, index) => {
            const contentType = slideData.slideContent[index % slideData.slideContent.length];
            
            return {
              id: `slide_${index + 1}`,
              number: index + 1,
              type: contentType,
              title: `${contentType.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ${index > 0 ? index : ''}`,
              content: {
                mainText: `Sample content for ${contentType.replace('-', ' ')} slide covering ${slideData.chapter}`,
                bulletPoints: [
                  `Key point 1 about ${slideData.chapter}`,
                  `Important concept related to ${slideData.topic || 'the topic'}`,
                  `Practical application or example`,
                  `Summary or conclusion point`
                ],
                images: slideData.includeImages ? [
                  { src: 'placeholder-image-1.jpg', alt: 'Relevant diagram or illustration' },
                  { src: 'placeholder-image-2.jpg', alt: 'Supporting visual content' }
                ] : [],
                animations: slideData.includeAnimations ? [
                  'fade-in',
                  'slide-from-left',
                  'zoom-in'
                ] : []
              },
              notes: slideData.includeNotes ? `Speaker notes for slide ${index + 1}: Detailed explanation and teaching tips for this slide content.` : '',
              duration: Math.ceil(slideData.duration / slideData.slideCount)
            };
          }),
          design: {
            template: slideData.template,
            colorScheme: slideData.colorScheme,
            fontStyle: slideData.fontStyle,
            includeImages: slideData.includeImages,
            includeAnimations: slideData.includeAnimations
          },
          settings: {
            totalDuration: slideData.duration,
            includeNotes: slideData.includeNotes,
            includeQuizSlides: slideData.includeQuizSlides,
            includeReferences: slideData.includeReferences
          },
          learningObjectives: slideData.learningObjectives,
          quizSlides: slideData.includeQuizSlides ? [
            {
              question: `Sample quiz question about ${slideData.chapter}`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 0,
              explanation: 'Explanation for the correct answer'
            },
            {
              question: `Another question related to ${slideData.topic || 'the topic'}`,
              options: ['True', 'False'],
              correctAnswer: 0,
              explanation: 'Detailed explanation'
            }
          ] : [],
          references: slideData.includeReferences ? [
            'Textbook Chapter Reference',
            'Additional Reading Materials',
            'Online Resources',
            'Supplementary Videos'
          ] : []
        },
        analytics: {
          totalSlides: slideData.slideCount,
          estimatedDuration: `${slideData.duration} minutes`,
          averageTimePerSlide: `${Math.ceil(slideData.duration / slideData.slideCount)} minutes`,
          contentBreakdown: slideData.slideContent.reduce((acc, type) => {
            acc[type] = Math.floor(slideData.slideCount / slideData.slideContent.length);
            return acc;
          }, {} as Record<string, number>),
          designSpecs: {
            template: slideData.template,
            colorScheme: slideData.colorScheme,
            fontStyle: slideData.fontStyle
          }
        },
        generatedAt: new Date().toISOString(),
        exportFormats: ['PowerPoint', 'Google Slides', 'PDF', 'Keynote', 'HTML']
      };
      
      // Store slide data in localStorage
      localStorage.setItem('generatedSlides', JSON.stringify(slidePresentation));
      
      // Redirect to results page
      router.push('/sense-ai/slides-results');
    } catch (error) {
      console.error('Error generating slides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = (category: keyof SlideData, item: string) => {
    const currentItems = slideData[category] as string[];
    if (!currentItems.includes(item)) {
      setSlideData(prev => ({
        ...prev,
        [category]: [...currentItems, item]
      }));
    }
  };

  const removeItem = (category: keyof SlideData, item: string) => {
    const currentItems = slideData[category] as string[];
    if (currentItems.length > 1) {
      setSlideData(prev => ({
        ...prev,
        [category]: currentItems.filter(i => i !== item)
      }));
    }
  };

  const renderTagSection = (title: string, category: keyof SlideData, options: string[], colorClass: string) => {
    const items = slideData[category] as string[];
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {title}
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {items.map(item => (
            <span
              key={item}
              className={`inline-flex items-center space-x-2 px-3 py-1 ${colorClass} rounded-lg text-sm`}
            >
              <span>{item.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(category, item)}
                  className="text-current hover:text-opacity-80"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        <select
          onChange={(e) => {
            if (e.target.value) {
              addItem(category, e.target.value);
              e.target.value = '';
            }
          }}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Add {title.toLowerCase()}...</option>
          {options.filter(option => !items.includes(option)).map(option => (
            <option key={option} value={option}>
              {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-900" style={{
      background: `
        radial-gradient(1200px 600px at 50% 6%, rgba(147, 51, 234, 0.05), rgba(255,255,255,0) 60%),
        radial-gradient(1000px 600px at 50% 100%, rgba(124, 58, 237, 0.08), rgba(249, 250, 251, 1) 70%),
        radial-gradient(2200px 900px at 50% -10%, rgba(168, 85, 247, 0.06), rgba(255,255,255,0) 60%),
        #ffffff
      `
    }}>
      {/* Premium Color Blur Spots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-cyan-300/15 to-indigo-300/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-80 h-80 bg-gradient-to-r from-sky-300/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-gradient-to-r from-blue-300/15 to-cyan-300/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-200/10 to-cyan-200/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
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
              onClick={() => router.push('/sense-ai')}
              className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-200 hover:bg-white hover:border-blue-300 transition-all duration-300 shadow-lg text-blue-600 hover:text-blue-700"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">PPT/Blackboard Slide Maker</h1>
              <p className="text-gray-600 mt-1">Create professional presentation slides and teaching materials</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/sense-ai/ppt-preview')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Sample</span>
            </button>
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25">
              <Monitor className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100/50"
            style={{
              boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100">
                <Presentation className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Slide Configuration</h2>
                <p className="text-gray-600 text-sm">Design professional presentation slides with custom templates and content</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Class *
                  </label>
                  <select
                    value={slideData.class}
                    onChange={(e) => setSlideData(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Subject *
                  </label>
                  <select
                    value={slideData.subject}
                    onChange={(e) => setSlideData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-cyan-50 border border-cyan-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 hover:shadow-lg transition-all duration-300"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Chapter *
                  </label>
                  <select
                    value={slideData.chapter}
                    onChange={(e) => setSlideData(prev => ({ ...prev, chapter: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-indigo-50 border border-indigo-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:shadow-lg transition-all duration-300"
                    required
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map(chapter => (
                      <option key={chapter} value={chapter}>{chapter}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Presentation Type
                  </label>
                  <select
                    value={slideData.presentationType}
                    onChange={(e) => setSlideData(prev => ({ ...prev, presentationType: e.target.value }))}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-violet-50 border border-violet-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 hover:shadow-lg transition-all duration-300"
                  >
                    {presentationTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Specific Topic/Concept
                </label>
                <input
                  type="text"
                  value={slideData.topic}
                  onChange={(e) => setSlideData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g., Introduction to Algebra, Cell Structure, Grammar Rules"
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-sky-50 border border-sky-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 hover:shadow-lg transition-all duration-300"
                />
              </div>

              {/* Slide Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Slides: {slideData.slideCount}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={slideData.slideCount}
                    onChange={(e) => setSlideData(prev => ({ ...prev, slideCount: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5</span>
                    <span>50</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration: {slideData.duration} minutes
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={slideData.duration}
                    onChange={(e) => setSlideData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10 min</span>
                    <span>120 min</span>
                  </div>
                </div>
              </div>

              {/* Design Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Template Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map(template => (
                      <button
                        key={template.value}
                        type="button"
                        onClick={() => setSlideData(prev => ({ ...prev, template: template.value }))}
                        className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                          slideData.template === template.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{template.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{template.preview}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color Scheme
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorSchemes.map(scheme => (
                      <button
                        key={scheme.value}
                        type="button"
                        onClick={() => setSlideData(prev => ({ ...prev, colorScheme: scheme.value }))}
                        className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                          slideData.colorScheme === scheme.value
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 ${scheme.color} rounded-full mx-auto mb-1`}></div>
                        <div className="text-xs">{scheme.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Font Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Style
                </label>
                <select
                  value={slideData.fontStyle}
                  onChange={(e) => setSlideData(prev => ({ ...prev, fontStyle: e.target.value }))}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-emerald-50 border border-emerald-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:shadow-lg transition-all duration-300"
                >
                  {fontStyles.map(style => (
                    <option key={style.value} value={style.value}>{style.label}</option>
                  ))}
                </select>
              </div>

              {/* Slide Content Types */}
              {renderTagSection('Slide Content Types', 'slideContent', slideContentOptions, 'bg-blue-100 text-blue-700')}

              {/* Learning Objectives */}
              {renderTagSection('Learning Objectives', 'learningObjectives', learningObjectiveOptions, 'bg-blue-100 text-blue-700')}

              {/* Slide Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Include Features
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="images"
                      checked={slideData.includeImages}
                      onChange={(e) => setSlideData(prev => ({ ...prev, includeImages: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="images" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Image className="w-4 h-4" />
                      <span>Images & Graphics</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="animations"
                      checked={slideData.includeAnimations}
                      onChange={(e) => setSlideData(prev => ({ ...prev, includeAnimations: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="animations" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Zap className="w-4 h-4" />
                      <span>Animations</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="notes"
                      checked={slideData.includeNotes}
                      onChange={(e) => setSlideData(prev => ({ ...prev, includeNotes: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="notes" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <BookMarked className="w-4 h-4" />
                      <span>Speaker Notes</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="quizSlides"
                      checked={slideData.includeQuizSlides}
                      onChange={(e) => setSlideData(prev => ({ ...prev, includeQuizSlides: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="quizSlides" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>Quiz Slides</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="references"
                      checked={slideData.includeReferences}
                      onChange={(e) => setSlideData(prev => ({ ...prev, includeReferences: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="references" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <BookOpen className="w-4 h-4" />
                      <span>References</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={slideData.customInstructions}
                  onChange={(e) => setSlideData(prev => ({ ...prev, customInstructions: e.target.value }))}
                  placeholder="Enter any specific requirements for the presentation slides..."
                  className="w-full h-24 px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-lg transition-all duration-300 resize-none"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || !slideData.subject.trim() || !slideData.chapter.trim()}
                className="w-full flex items-center justify-center space-x-3 px-8 py-5 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-700 hover:via-cyan-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg font-semibold rounded-2xl transition-all duration-300 disabled:cursor-not-allowed shadow-2xl"
                style={{
                  boxShadow: isLoading || (!slideData.subject.trim() || !slideData.chapter.trim()) 
                    ? '0 10px 25px -5px rgba(107, 114, 128, 0.3)' 
                    : '0 20px 40px -10px rgba(59, 130, 246, 0.4), 0 10px 20px -5px rgba(6, 182, 212, 0.3)'
                }}
                whileHover={{
                  scale: (isLoading || !slideData.subject.trim() || !slideData.chapter.trim()) ? 1 : 1.02,
                  boxShadow: (isLoading || !slideData.subject.trim() || !slideData.chapter.trim()) 
                    ? '0 10px 25px -5px rgba(107, 114, 128, 0.3)' 
                    : '0 25px 50px -12px rgba(59, 130, 246, 0.5), 0 15px 30px -8px rgba(6, 182, 212, 0.4)'
                }}
                whileTap={{ scale: (isLoading || !slideData.subject.trim() || !slideData.chapter.trim()) ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Creating Slides...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Generate Presentation Slides</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PPTSlideMaker;