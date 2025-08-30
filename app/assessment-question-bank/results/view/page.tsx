"use client";

import * as React from "react";
import Sidebar from "@/app/assessment-question-bank/components/Sidebar";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import "./animations.css";

export default function ResultsViewPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.report-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const reportCards = [
    {
      title: "Overall School Performance",
      description: "Comprehensive overview of school-wide assessment results",
      icon: "🏫",
      color: "blue",
      href: "/assessment-question-bank/results/view/overall-school"
    },
    {
      title: "Studentwise Report",
      description: "Individual student performance across all assessments",
      icon: "👨‍🎓",
      color: "emerald",
      href: "/assessment-dashboard/dash"
    },
    {
      title: "Classwise Report",
      description: "Performance analysis by class and grade level",
      icon: "📚",
      color: "purple",
      href: "/assessment-question-bank/results/view/classwisekiro"
    },
    {
      title: "Subjectwise Report",
      description: "Subject-specific performance and trends",
      icon: "📊",
      color: "orange",
      href: "/assessment-question-bank/results/view/subjectwise"
    },
    {
      title: "Difficulty Report",
      description: "Question difficulty analysis and student performance",
      icon: "⚡",
      color: "red",
      href: "/assessment-question-bank/results/view/difficulty"
    },
    {
      title: "Bloom's Taxonomy Performance",
      description: "Cognitive skill level assessment and analysis",
      icon: "🌸",
      color: "pink",
      href: "/assessment-question-bank/results/view/blooms-taxonomy"
    },
    // {
    //   title: "Question Effectiveness Report",
    //   description: "Analysis of question quality and discrimination",
    //   icon: "❓",
    //   color: "teal",
    //   href: "/assessment-question-bank/results/view/question-effectiveness"
    // },
    {
      title: "Top Performers & At-Risk Students",
      description: "Identification of high achievers and students needing support",
      icon: "🎯",
      color: "yellow",
      href: "/assessment-question-bank/results/view/top-performers"
    },
    // {
    //   title: "Time Efficiency Reports",
    //   description: "Analysis of time management and completion patterns",
    //   icon: "⏱️",
    //   color: "cyan",
    //   href: "/assessment-question-bank/results/view/time-efficiency"
    // },
    // {
    //   title: "Participation Report",
    //   description: "Student engagement and participation metrics",
    //   icon: "📈",
    //   color: "green",
    //   href: "/assessment-question-bank/results/view/participation"
    // },
    {
      title: "Chapterwise Report",
      description: "Performance analysis by textbook chapters and units",
      icon: "📖",
      color: "violet",
      href: "/assessment-question-bank/results/view/chapterwise"
    },
    {
      title: "Lessonwise Report",
      description: "Detailed analysis of individual lesson performance",
      icon: "📝",
      color: "slate",
      href: "/assessment-question-bank/results/view/lessonwise"
    }
  ];

  const getColorClasses = (color: string, isHovered: boolean) => {
    const colors = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-50/80 via-white to-blue-50/80',
        hoverBg: 'bg-gradient-to-br from-blue-100/90 via-blue-50/80 to-white',
        border: isHovered ? 'border-blue-300/60' : 'border-blue-200/40',
        accent: 'bg-gradient-to-r from-blue-500 to-blue-600',
        text: isHovered ? 'text-blue-700' : 'text-gray-700',
        glow: 'shadow-blue-500/20 shadow-2xl',
        particle: 'bg-blue-400'
      },
      emerald: {
        bg: 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/80',
        hoverBg: 'bg-gradient-to-br from-emerald-100/90 via-emerald-50/80 to-white',
        border: isHovered ? 'border-emerald-300/60' : 'border-emerald-200/40',
        accent: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
        text: isHovered ? 'text-emerald-700' : 'text-gray-700',
        glow: 'shadow-emerald-500/20 shadow-2xl',
        particle: 'bg-emerald-400'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-50/80 via-white to-purple-50/80',
        hoverBg: 'bg-gradient-to-br from-purple-100/90 via-purple-50/80 to-white',
        border: isHovered ? 'border-purple-300/60' : 'border-purple-200/40',
        accent: 'bg-gradient-to-r from-purple-500 to-purple-600',
        text: isHovered ? 'text-purple-700' : 'text-gray-700',
        glow: 'shadow-purple-500/20 shadow-2xl',
        particle: 'bg-purple-400'
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-50/80 via-white to-orange-50/80',
        hoverBg: 'bg-gradient-to-br from-orange-100/90 via-orange-50/80 to-white',
        border: isHovered ? 'border-orange-300/60' : 'border-orange-200/40',
        accent: 'bg-gradient-to-r from-orange-500 to-orange-600',
        text: isHovered ? 'text-orange-700' : 'text-gray-700',
        glow: 'shadow-orange-500/20 shadow-2xl',
        particle: 'bg-orange-400'
      },
      red: {
        bg: 'bg-gradient-to-br from-red-50/80 via-white to-red-50/80',
        hoverBg: 'bg-gradient-to-br from-red-100/90 via-red-50/80 to-white',
        border: isHovered ? 'border-red-300/60' : 'border-red-200/40',
        accent: 'bg-gradient-to-r from-red-500 to-red-600',
        text: isHovered ? 'text-red-700' : 'text-gray-700',
        glow: 'shadow-red-500/20 shadow-2xl',
        particle: 'bg-red-400'
      },
      pink: {
        bg: 'bg-gradient-to-br from-pink-50/80 via-white to-pink-50/80',
        hoverBg: 'bg-gradient-to-br from-pink-100/90 via-pink-50/80 to-white',
        border: isHovered ? 'border-pink-300/60' : 'border-pink-200/40',
        accent: 'bg-gradient-to-r from-pink-500 to-pink-600',
        text: isHovered ? 'text-pink-700' : 'text-gray-700',
        glow: 'shadow-pink-500/20 shadow-2xl',
        particle: 'bg-pink-400'
      },
      teal: {
        bg: 'bg-gradient-to-br from-teal-50/80 via-white to-teal-50/80',
        hoverBg: 'bg-gradient-to-br from-teal-100/90 via-teal-50/80 to-white',
        border: isHovered ? 'border-teal-300/60' : 'border-teal-200/40',
        accent: 'bg-gradient-to-r from-teal-500 to-teal-600',
        text: isHovered ? 'text-teal-700' : 'text-gray-700',
        glow: 'shadow-teal-500/20 shadow-2xl',
        particle: 'bg-teal-400'
      },
      yellow: {
        bg: 'bg-gradient-to-br from-yellow-50/80 via-white to-yellow-50/80',
        hoverBg: 'bg-gradient-to-br from-yellow-100/90 via-yellow-50/80 to-white',
        border: isHovered ? 'border-yellow-300/60' : 'border-yellow-200/40',
        accent: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        text: isHovered ? 'text-yellow-700' : 'text-gray-700',
        glow: 'shadow-yellow-500/20 shadow-2xl',
        particle: 'bg-yellow-400'
      },
      cyan: {
        bg: 'bg-gradient-to-br from-cyan-50/80 via-white to-cyan-50/80',
        hoverBg: 'bg-gradient-to-br from-cyan-100/90 via-cyan-50/80 to-white',
        border: isHovered ? 'border-cyan-300/60' : 'border-cyan-200/40',
        accent: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
        text: isHovered ? 'text-cyan-700' : 'text-gray-700',
        glow: 'shadow-cyan-500/20 shadow-2xl',
        particle: 'bg-cyan-400'
      },
      green: {
        bg: 'bg-gradient-to-br from-green-50/80 via-white to-green-50/80',
        hoverBg: 'bg-gradient-to-br from-green-100/90 via-green-50/80 to-white',
        border: isHovered ? 'border-green-300/60' : 'border-green-200/40',
        accent: 'bg-gradient-to-r from-green-500 to-green-600',
        text: isHovered ? 'text-green-700' : 'text-gray-700',
        glow: 'shadow-green-500/20 shadow-2xl',
        particle: 'bg-green-400'
      },
      violet: {
        bg: 'bg-gradient-to-br from-violet-50/80 via-white to-violet-50/80',
        hoverBg: 'bg-gradient-to-br from-violet-100/90 via-violet-50/80 to-white',
        border: isHovered ? 'border-violet-300/60' : 'border-violet-200/40',
        accent: 'bg-gradient-to-r from-violet-500 to-violet-600',
        text: isHovered ? 'text-violet-700' : 'text-gray-700',
        glow: 'shadow-violet-500/20 shadow-2xl',
        particle: 'bg-violet-400'
      },
      slate: {
        bg: 'bg-gradient-to-br from-slate-50/80 via-white to-slate-50/80',
        hoverBg: 'bg-gradient-to-br from-slate-100/90 via-slate-50/80 to-white',
        border: isHovered ? 'border-slate-300/60' : 'border-slate-200/40',
        accent: 'bg-gradient-to-r from-slate-500 to-slate-600',
        text: isHovered ? 'text-slate-700' : 'text-gray-700',
        glow: 'shadow-slate-500/20 shadow-2xl',
        particle: 'bg-slate-400'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen flex font-sans bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-ping" style={{animationDuration: '4s'}}></div>
      </div>
      
      <Sidebar />
      <main className="flex-1 p-8 md:p-12 xl:p-16 relative z-10">
        {/* Header Section */}
        <div className={`mb-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="flex items-center mb-8">
            <div className="w-2 h-12 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-6 shadow-lg animate-pulse"></div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Assessment Reports
            </h1>
          </div>
          <p className="text-gray-600 text-xl max-w-3xl leading-relaxed">
            Comprehensive analytics and insights for educational assessment data. 
            Choose a report type to get started with your analysis.
          </p>
        </div>

        {/* Cards Layout - Modern Grid with Swipeable Cards */}
        <div ref={containerRef} className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {reportCards.map((card, index) => {
              const isHovered = hoveredCard === index;
              const isDragged = draggedCard === index;
              const colorClasses = getColorClasses(card.color, isHovered);
              
              return (
                <div
                  key={index}
                  className={`
                    report-card group cursor-pointer card-hover-effect
                    ${isLoaded ? 'animate-scale-in' : 'opacity-0 translate-y-16 scale-95'}
                    ${isDragged ? 'scale-110 rotate-2' : ''}
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    transitionDelay: `${index * 50}ms`
                  }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onMouseDown={() => setDraggedCard(index)}
                  onMouseUp={() => setDraggedCard(null)}
                  onTouchStart={() => setDraggedCard(index)}
                  onTouchEnd={() => setDraggedCard(null)}
                >
                  <Link href={card.href}>
                    <div className={`
                      relative ${isHovered ? colorClasses.hoverBg : colorClasses.bg} 
                      border-2 ${colorClasses.border} rounded-3xl p-8 
                      glass-morphism
                      shadow-lg hover:shadow-2xl ${isHovered ? colorClasses.glow + ' animate-glow' : ''}
                      transition-all duration-500 ease-out overflow-hidden
                      h-full flex flex-col min-h-[280px]
                      ${isDragged ? 'shadow-3xl animate-morph' : ''}
                      ${isHovered ? 'animate-shimmer' : ''}
                    `}>
                      {/* Animated Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent transform rotate-12 scale-150"></div>
                      </div>
                      
                      {/* Floating Particles */}
                      {isHovered && (
                        <>
                          <div className={`absolute top-4 right-4 w-2 h-2 ${colorClasses.particle} rounded-full opacity-40 animate-particle-float`}></div>
                          <div className={`absolute bottom-6 left-6 w-1.5 h-1.5 ${colorClasses.particle} rounded-full opacity-30 animate-float`} style={{animationDelay: '0.5s'}}></div>
                          <div className={`absolute top-1/2 right-8 w-1 h-1 ${colorClasses.particle} rounded-full opacity-50 animate-ping`} style={{animationDuration: '3s'}}></div>
                        </>
                      )}
                      
                      {/* Left accent bar with animation */}
                      <div className={`
                        absolute left-0 top-0 bottom-0 w-1.5 ${colorClasses.accent} rounded-r-full
                        transform transition-all duration-500 origin-top
                        ${isHovered ? 'scale-y-100' : 'scale-y-30'}
                      `}></div>
                      
                      {/* Content */}
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Icon with enhanced animation */}
                        <div className={`
                          icon-container w-16 h-16 rounded-2xl ${colorClasses.bg} border-2 ${colorClasses.border}
                          flex items-center justify-center mb-6 shadow-lg
                          bg-white/90 backdrop-blur-sm
                          transform transition-all duration-500
                          ${isHovered ? 'rotate-12 scale-110' : ''}
                          ${isDragged ? 'rotate-45 scale-125' : ''}
                        `}>
                          <span className="text-2xl filter drop-shadow-sm">{card.icon}</span>
                        </div>
                        
                        {/* Text Content */}
                        <div className="flex-1">
                          <h3 className={`
                            text-xl font-bold ${colorClasses.text} mb-3 
                            transition-all duration-300 leading-tight
                            ${isHovered ? 'translate-x-1' : ''}
                          `}>
                            {card.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {card.description}
                          </p>
                        </div>
                        
                        {/* Arrow with enhanced animation */}
                        <div className={`
                          flex justify-end mt-6 ${colorClasses.text}
                          transform transition-all duration-300
                          ${isHovered ? 'translate-x-2' : ''}
                        `}>
                          <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-sm">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover overlay with ripple effect */}
                      <div className={`
                        absolute inset-0 ${colorClasses.accent} opacity-0 transition-all duration-500
                        ${isHovered ? 'opacity-5' : ''}
                        ${isDragged ? 'opacity-10' : ''}
                      `}></div>
                      
                      {/* Swipe indicator */}
                      {isDragged && (
                        <div className="absolute top-4 left-4 text-xs text-gray-500 opacity-70 animate-pulse">
                          Swipe to explore
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="fixed top-20 right-20 w-32 h-32 bg-blue-100 rounded-full opacity-20 blur-3xl pointer-events-none"></div>
        <div className="fixed bottom-20 left-20 w-24 h-24 bg-purple-100 rounded-full opacity-20 blur-2xl pointer-events-none"></div>
      </main>
    </div>
  );
}
