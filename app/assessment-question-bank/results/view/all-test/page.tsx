'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Question {
  id: string;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  marks?: number;
  type?: string;
  // Add other question properties as needed
}

interface Test {
  id: string;
  name: string;
  subject?: string;
  date?: any;
  questions?: Question[];
  // Add other test properties as needed
}

export default function AllTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentTests = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from the 'test' collection first
        const testsCollection = collection(db, 'test');
        const testsQuery = query(
          testsCollection,
          orderBy('createdAt', 'desc'),  // Sort by creation date, newest first
          limit(25)                      // Limit to 25 most recent tests
        );
        
        const testSnapshot = await getDocs(testsQuery);
        
        if (!testSnapshot.empty) {
          console.log(`Found ${testSnapshot.docs.length} test documents`);
          
          const testsList = testSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || data.title || `Test ${doc.id}`,
              subject: data.subject,
              date: data.date || data.createdAt || null,
              ...data
            } as Test;
          });
          
          setTests(testsList);
          setError(null);
        } else {
          console.log('No test documents found');
          setTests([]);
          setError('No test data available.');
        }
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError('Failed to load tests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTests();
  }, []);

  const selectedTestData = tests.find(test => test.id === selectedTest);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedTest) {
        setQuestions([]);
        return;
      }

      try {
        setQuestionsLoading(true);
        
        // First, get the test document to get the question references
        const testDoc = await getDoc(doc(db, 'test', selectedTest));
        if (!testDoc.exists()) {
          setError('Test not found');
          return;
        }

        const testData = testDoc.data();
        const questionRefs = testData.questions || [];
        
        console.log('Question references:', questionRefs);
        
        if (questionRefs.length === 0) {
          console.log('No question references found in test document');
          setQuestions([]);
          return;
        }

        // Fetch each question document
        const questionPromises = questionRefs.map((ref) => {
          try {
            if (!ref || typeof ref !== 'object' || !ref.path) {
              console.error('Invalid question reference:', ref);
              return null;
            }
            
            // If it's a DocumentReference, get the document directly
            if (ref.get) {
              return ref.get().catch(err => {
                console.error('Error getting question document:', err);
                return null;
              });
            }
            
            // Fallback for string paths (shouldn't happen based on the error, but just in case)
            const questionId = ref.path.split('/').pop();
            console.log('Fetching question with ID:', questionId);
            const questionDoc = doc(db, 'questionCollection', questionId);
            return getDoc(questionDoc).catch(err => {
              console.error(`Error fetching question ${questionId}:`, err);
              return null;
            });
          } catch (err) {
            console.error('Error processing question reference:', ref, err);
            return null;
          }
        });

        const questionSnapshots = await Promise.all(questionPromises);
        console.log('Question snapshots:', questionSnapshots);
        
        const questionsList = questionSnapshots
          .filter(snap => snap && snap.exists())
          .map(snap => {
            const data = snap.data();
            console.log('Question data:', snap.id, data);
            return {
              id: snap.id,
              ...data
            } as Question;
          });
        
        setQuestions(questionsList);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again.');
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedTest]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-destructive">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Test Results</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="w-full max-w-md">
                <label htmlFor="test-select" className="block text-sm font-medium mb-2">
                  Select a Test
                </label>
                <Select
                  value={selectedTest}
                  onValueChange={setSelectedTest}
                  disabled={tests.length === 0}
                >
                  <SelectTrigger id="test-select" className="w-full">
                    <SelectValue placeholder={tests.length === 0 ? "No tests available" : "Select a test"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tests.map((test) => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.name || `Test ${test.id}`}
                        {test.subject && ` - ${test.subject}`}
                        {test.date && ` (${test.date.toDate().toLocaleDateString()})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTestData && (
                <div className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Test Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold">{selectedTestData.name}</p>
                        {selectedTestData.subject && (
                          <p><span className="font-medium">Subject:</span> {selectedTestData.subject}</p>
                        )}
                        {selectedTestData.date && (
                          <p>
                            <span className="font-medium">Date:</span>{' '}
                            {selectedTestData.date.toDate().toLocaleString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {questionsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : questions.length > 0 ? (
                        <div className="space-y-6">
                          {questions.map((question, index) => (
                            <div key={question.id} className="border rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <div className="font-medium text-gray-500">{index + 1}.</div>
                                <div className="flex-1">
                                  <div className="font-medium mb-2">{question.questionText}</div>
                                  
                                  {question.options && question.options.length > 0 && (
                                    <div className="mt-2 space-y-2 ml-4">
                                      {question.options.map((option, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                          <div className="w-4 h-4 rounded-full border flex-shrink-0">
                                            {question.correctAnswer === option && (
                                              <div className="w-full h-full bg-primary rounded-full" />
                                            )}
                                          </div>
                                          <span>{option}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {question.marks && (
                                    <div className="mt-2 text-sm text-gray-500">
                                      Marks: {question.marks}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No questions found for this test.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}