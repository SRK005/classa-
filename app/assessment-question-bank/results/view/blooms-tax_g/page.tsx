'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, DocumentData, DocumentReference } from 'firebase/firestore';
import { db, auth } from '@/lib/firebaseClient';
import { useAuthState } from 'react-firebase-hooks/auth';
import Sidebar from "@/app/assessment-question-bank/components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Users, Award, TrendingUp, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BloomData {
  level: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
}

export default function BloomTaxonomyReportPage() {
  const [user] = useAuthState(auth);
  const [bloomData, setBloomData] = useState<BloomData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBloomData = async () => {
      if (!user) {
        setBloomData([]);
        setLoading(false);
        return;
      }

      try {
        // Get tests created by current user
        const userRef = doc(db, 'users', user.uid);
        const testsQuery = query(collection(db, 'test'), where('createdBy', '==', userRef));
        const testsSnapshot = await getDocs(testsQuery);

        if (testsSnapshot.empty) {
          setBloomData([]);
          setLoading(false);
          return;
        }

        const testIds = testsSnapshot.docs.map(doc => doc.id);
        
        // Get all student answers for these tests
        const studentAnswers: DocumentData[] = [];
        for (let i = 0; i < testIds.length; i += 30) {
          const batchIds = testIds.slice(i, i + 30);
          const answersQuery = query(collection(db, 'studentAnswers'), where('testId', 'in', batchIds));
          const answersSnapshot = await getDocs(answersQuery);
          answersSnapshot.forEach(doc => studentAnswers.push(doc.data()));
        }

        if (studentAnswers.length === 0) {
          setBloomData([]);
          setLoading(false);
          return;
        }

        // Get unique question IDs
        const questionIds = [...new Set(studentAnswers.map(a => a.questionId))];
        
        // Fetch question details
        const questionsMap = new Map<string, string>();
        for (let i = 0; i < questionIds.length; i += 30) {
          const batchIds = questionIds.slice(i, i + 30);
          const questionsQuery = query(collection(db, 'questionCollection'), where('__name__', 'in', batchIds));
          const questionsSnapshot = await getDocs(questionsQuery);
          questionsSnapshot.forEach(doc => {
            questionsMap.set(doc.id, doc.data().bloomTaxonomy || 'Unknown');
          });
        }

        // Aggregate data by bloom level
        const bloomAggregation: Record<string, { total: number; correct: number }> = {};
        
        studentAnswers.forEach(answer => {
          const level = questionsMap.get(answer.questionId) || 'Unknown';
          if (!bloomAggregation[level]) {
            bloomAggregation[level] = { total: 0, correct: 0 };
          }
          
          bloomAggregation[level].total += 1;
          if (answer.isCorrect) {
            bloomAggregation[level].correct += 1;
          }
        });

        // Format data for display
        const formattedData = Object.entries(bloomAggregation).map(([level, data]) => ({
          level,
          totalQuestions: data.total,
          correctAnswers: data.correct,
          percentage: parseFloat(((data.correct / data.total) * 100).toFixed(2))
        }));

        setBloomData(formattedData);
      } catch (error) {
        console.error('Error fetching bloom taxonomy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBloomData();
  }, [user]);

  // Prepare chart data
  const chartData = bloomData.map(data => ({
    name: data.level,
    percentage: data.percentage,
    questions: data.totalQuestions
  }));

  // Calculate summary metrics
  const totalQuestions = bloomData.reduce((sum, data) => sum + data.totalQuestions, 0);
  const totalCorrect = bloomData.reduce((sum, data) => sum + data.correctAnswers, 0);
  const overallPercentage = totalQuestions > 0 
    ? parseFloat(((totalCorrect / totalQuestions) * 100).toFixed(2)) 
    : 0;
  
  const bestLevel = bloomData.length > 0 
    ? bloomData.reduce((best, current) => current.percentage > best.percentage ? current : best)
    : null;
  
  const worstLevel = bloomData.length > 0 
    ? bloomData.reduce((worst, current) => current.percentage < worst.percentage ? worst : current)
    : null;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600 text-lg font-medium">Loading Bloom's Taxonomy data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (bloomData.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="text-center bg-white rounded-xl shadow-sm p-12 max-w-md">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No Bloom's Taxonomy data available</p>
            <p className="text-gray-500 text-sm mt-2">Create some tests with Bloom's Taxonomy classifications to see analytics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bloom's Taxonomy Report</h1>
            <p className="text-gray-600">Analyze student performance by cognitive level</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Overall Performance */}
            <div className="bg-blue-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-100 text-sm font-medium">Overall Performance</p>
                  <TrendingUp className="h-5 w-5 text-blue-200" />
                </div>
                <p className="text-3xl font-bold">
                  {overallPercentage}%
                </p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>

            {/* Total Questions */}
            <div className="bg-green-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-100 text-sm font-medium">Total Questions</p>
                  <BookOpen className="h-5 w-5 text-green-200" />
                </div>
                <p className="text-3xl font-bold">{totalQuestions}</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>

            {/* Best Performing Level */}
            <div className="bg-purple-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-100 text-sm font-medium">Best Level</p>
                  <Award className="h-5 w-5 text-purple-200" />
                </div>
                <p className="text-xl font-bold truncate">
                  {bestLevel?.level || 'N/A'}
                </p>
                <p className="text-lg">{bestLevel?.percentage || 0}%</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>

            {/* Needs Improvement */}
            <div className="bg-orange-500 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-100 text-sm font-medium">Needs Improvement</p>
                  <Users className="h-5 w-5 text-orange-200" />
                </div>
                <p className="text-xl font-bold truncate">
                  {worstLevel?.level || 'N/A'}
                </p>
                <p className="text-lg">{worstLevel?.percentage || 0}%</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Bloom's Level</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bloom's Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Questions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bloomData.map((data, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.level}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.totalQuestions}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.correctAnswers}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        <span className={`px-2 py-1 rounded-full ${data.percentage >= 70 ? 'bg-green-100 text-green-800' : 
                                         data.percentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                                         'bg-red-100 text-red-800'}`}>
                          {data.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
              <Download className="h-5 w-5 mr-2" />
              Download Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}