'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { Test, TestResult, BloomsTaxonomyStats } from '@/types/assessment';
import { PieChart, BarChart, ChartData } from '@/components/shared/Charts';
import { Timestamp } from 'firebase/firestore';

interface BloomData extends ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
  }[];
}

export default function BloomsTaxonomyReport() {
  const [testData, setTestData] = useState<Test[]>([]);
  const [resultsData, setResultsData] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState('hicas_cbe'); // Default school ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tests for the school
        const testsQuery = query(collection(db, 'tests'), where('schoolID', '==', `/school/${schoolId}`));
        const testsSnapshot = await getDocs(testsQuery);
        const tests = testsSnapshot.docs.map(doc => ({
          id: doc.id,
          schoolID: doc.data().schoolID,
          testName: doc.data().testName,
          createdAt: doc.data().createdAt,
          ...doc.data()
        } as Test));
        setTestData(tests);

        // Fetch test results
        const resultsQuery = query(collection(db, 'testresults'), where('schoolId', '==', `/school/${schoolId}`));
        const resultsSnapshot = await getDocs(resultsQuery);
        const results = resultsSnapshot.docs.map(doc => ({
          id: doc.id,
          schoolId: doc.data().schoolId,
          testName: doc.data().testName,
          bloom: doc.data().bloom,
          isCorrect: doc.data().isCorrect,
          createdAt: doc.data().createdAt,
          ...doc.data()
        } as TestResult));
        setResultsData(results);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId]);

  // Process data for Bloom's Taxonomy visualization
  const processBloomData = (): ChartData => {
    const bloomLevels: Record<string, number> = {
      'Remembering': 0,
      'Understanding': 0,
      'Applying': 0,
      'Analyzing': 0,
      'Evaluating': 0,
      'Creating': 0
    };

    resultsData.forEach((result: TestResult) => {
      if (result.bloom && bloomLevels[result.bloom] !== undefined) {
        bloomLevels[result.bloom] += 1;
      }
    });

    return {
      labels: Object.keys(bloomLevels),
      datasets: [{
        data: Object.values(bloomLevels),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ]
      }]
    };
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bloom's Taxonomy Report</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Bloom's Taxonomy Distribution</h2>
          <div className="h-64">
            <PieChart data={processBloomData()} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Performance by Bloom Level</h2>
          <div className="h-64">
            <BarChart 
              data={{
                labels: processBloomData().labels,
                datasets: [{
                  label: 'Correct Answers %',
                  data: processBloomData().labels.map((label: string) => {
                    const correct = resultsData.filter((r: TestResult) => r.bloom === label && r.isCorrect).length;
                    const total = resultsData.filter((r: TestResult) => r.bloom === label).length;
                    return total > 0 ? Math.round((correct / total) * 100) : 0;
                  }),
                  backgroundColor: processBloomData().labels.map((_: string, i: number) => {
                    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
                    return colors[i % colors.length];
                  })
                }]
              }} 
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Detailed Results</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bloom Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resultsData.map((result: TestResult, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{result.testName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{result.bloom || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {result.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      try {
                        if (!result.createdAt) return 'N/A';
                        
                        // Handle Firestore Timestamp
                        if (typeof result.createdAt === 'object' && result.createdAt !== null && 'toDate' in result.createdAt) {
                          const timestamp = result.createdAt as { toDate: () => Date };
                          return timestamp.toDate().toLocaleDateString();
                        }
                        
                        // Handle string timestamps
                        if (typeof result.createdAt === 'string') {
                          return new Date(result.createdAt).toLocaleDateString();
                        }
                        
                        // Handle number timestamps (seconds or milliseconds)
                        if (typeof result.createdAt === 'number') {
                          const date = result.createdAt < 1e12 
                            ? new Date(result.createdAt * 1000) // Convert seconds to ms
                            : new Date(result.createdAt); // Already in ms
                          return date.toLocaleDateString();
                        }
                        
                        return 'N/A';
                      } catch (e) {
                        console.error('Error formatting date:', e);
                        return 'N/A';
                      }
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}