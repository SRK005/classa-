'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, DocumentData } from 'firebase/firestore';
import { db, auth } from '@/lib/firebaseClient';
import Sidebar from "@/app/assessment-question-bank/components/Sidebar";
import { useAuthState } from 'react-firebase-hooks/auth';

export default function AllTestsPage() {
  const [tests, setTests] = useState<Array<{ id: string; name: string; status?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchTests = async () => {
      if (!user) {
        setTests([]);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const testsQuery = query(
          collection(db, 'test'),
          where('createdBy', '==', userRef)
        );
        const testsSnapshot = await getDocs(testsQuery);
        
        const testsData = testsSnapshot.docs.map((doc: DocumentData) => ({
          id: doc.id,
          name: doc.data().name || 'Unnamed Test',
          status: doc.data().status || 'Draft',
          ...doc.data(),
        }));
        setTests(testsData);
      } catch (error) {
        console.error('Error fetching tests:', error);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [user]);

  return (
    <div className="min-h-screen flex font-sans bg-[#F8F9FB]">
      <Sidebar />
      <main className="flex-1 bg-[#F8F9FB] p-8 md:p-12 xl:p-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: '#2563eb' }}>
            All Tests
          </h1>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading tests...
                      </td>
                    </tr>
                  ) : tests.length > 0 ? (
                    tests.map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{test.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${test.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {test.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900 mr-4">View</button>
                          <button className="text-indigo-600 hover:text-indigo-900">Results</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        No tests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
