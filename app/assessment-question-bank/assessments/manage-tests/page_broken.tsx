// Modern Material 3 Test Management Dashboard
"use client";
import * as React from "react";
import Sidebar from "../../components/Sidebar";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  DocumentReference,
  orderBy,
  limit,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import QuestionSelectionDialog from "../../components/QuestionSelectionDialog";
import PDFDownloadButton from "../../pyq/neet/PDFDownloadButton";
import TestPreviewDialog from "../../components/TestPreviewDialog";
import latexToPngDataUrl from "../../pyq/neet/latexToDataUrl";
import { Dialog } from "@headlessui/react";
import { 
  DocumentTextIcon, 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const statusConfig = {
  published: {
    bg: "bg-gradient-to-r from-emerald-50 to-teal-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircleIcon,
    label: "Published"
  },
  drafted: {
    bg: "bg-gradient-to-r from-amber-50 to-orange-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: ExclamationTriangleIcon,
    label: "Draft"
  },
  ongoing: {
    bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: ClockIcon,
    label: "Ongoing"
  },
  finished: {
    bg: "bg-gradient-to-r from-purple-50 to-pink-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: CheckCircleIcon,
    label: "Finished"
  },
};

// Helper to split text and LaTeX and generate images
async function splitTextWithLatex(text: string) {
  const regex = /\$([^$]+)\$/g;
  let lastIndex = 0;
  let match;
  const result: (string | { latex: string; img: string })[] = [];
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    const latex = match[1];
    const img = await latexToPngDataUrl(latex);
    result.push({ latex, img });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}

export default function ManageTestsPage() {
  const [tests, setTests] = React.useState<any[]>([]);
  const [recentTests, setRecentTests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const router = useRouter();
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null
  );
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(6);
  const [userSchoolId, setUserSchoolId] = React.useState<string | null>(null);
  const [selectDialogOpen, setSelectDialogOpen] = React.useState<string | null>(
    null
  );
  const [selectedQuestions, setSelectedQuestions] = React.useState<{
    [testId: string]: string[];
  }>({});
  const [preparePdfTest, setPreparePdfTest] = React.useState<any | null>(null);
  const [pdfQuestions, setPdfQuestions] = React.useState<any[]>([]);
  const [pdfLoading, setPdfLoading] = React.useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = React.useState<string | null>(null);
  const [previewQuestions, setPreviewQuestions] = React.useState<any[]>([]);
  
  // Dashboard stats
  const [stats, setStats] = React.useState({
    total: 0,
    published: 0,
    drafted: 0,
    ongoing: 0,
    finished: 0
  });

  // Fetch current user's schoolID
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        if (userData && userData.schoolId) {
          setUserSchoolId(userData.schoolId);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const testsSnap = await getDocs(collection(db, "test"));
        const testList: any[] = [];
        const statusCounts = { total: 0, published: 0, drafted: 0, ongoing: 0, finished: 0 };
        
        for (const testDoc of testsSnap.docs) {
          const data = testDoc.data();
          // Fetch class name
          let className = "-";
          if (data.classId) {
            try {
              const classSnap = await getDoc(data.classId as DocumentReference);
              className = classSnap.exists() ? classSnap.data().name : "-";
            } catch {}
          }
          
          const status = (data.status || "drafted") as keyof typeof statusConfig;
          statusCounts.total++;
          statusCounts[status]++;
          
          testList.push({
            id: testDoc.id,
            name: data.name,
            className,
            start: data.start?.toDate ? data.start.toDate() : data.start,
            end: data.end?.toDate ? data.end.toDate() : data.end,
            status,
            online: data.online,
            questions: Array.isArray(data.questions) ? data.questions : [],
            totalQuestions:
              Array.isArray(data.questions) && data.questions.length > 0
                ? data.questions.length
                : 0,
            schoolId: data.schoolId,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          });
        }
        
        // Sort tests by creation date for recent tests
        const sortedTests = testList.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        setTests(testList);
        setRecentTests(sortedTests.slice(0, 5)); // Get last 5 created tests
        setStats(statusCounts);
      } catch (err) {
        console.error("Error fetching tests:", err);
        setError("Failed to load tests");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Sort all tests by end time descending
  const sortedTests = [...tests].sort((a, b) => {
    const aEnd = a.end ? new Date(a.end).getTime() : 0;
    const bEnd = b.end ? new Date(b.end).getTime() : 0;
    return bEnd - aEnd;
  });
  const totalPages = Math.ceil(sortedTests.length / pageSize);
  const paginatedTests = sortedTests.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await deleteDoc(doc(db, "test", id));
      setTests((prev) => prev.filter((t) => t.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      alert("Failed to delete test.");
    } finally {
      setActionLoading(null);
    }
  };

  // Function to refresh a specific test's data
  const refreshTestData = async (testId: string) => {
    try {
      const testDoc = await getDoc(doc(db, "test", testId));
      if (testDoc.exists()) {
        const data = testDoc.data();
        // Fetch class name
        let className = "-";
        if (data.classId) {
          try {
            const classSnap = await getDoc(data.classId as DocumentReference);
            className = classSnap.exists() ? classSnap.data().name : "-";
          } catch {}
        }
        
        const updatedTest = {
          id: testDoc.id,
          name: data.name,
          className,
          start: data.start?.toDate ? data.start.toDate() : data.start,
          end: data.end?.toDate ? data.end.toDate() : data.end,
          status: (data.status || "drafted") as keyof typeof statusConfig,
          online: data.online,
          questions: Array.isArray(data.questions) ? data.questions : [],
          totalQuestions: typeof data.totalQuestions === "number" ? data.totalQuestions : null,
        };
        
        setTests((prev) =>
          prev.map((t) => (t.id === testId ? updatedTest : t))
        );
      }
    } catch (err) {
      console.error("Error refreshing test data:", err);
    }
  };

  const handlePublish = async (id: string) => {
    setActionLoading(id);
    try {
      await updateDoc(doc(db, "test", id), { online: true });
      setTests((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: "published", online: true } : t
        )
      );
    } catch (err) {
      alert("Failed to publish test.");
    } finally {
      setActionLoading(null);
    }
  };

  // Handler to preview test questions
  const handlePreviewQuestions = async (test: any) => {
    setPreviewDialogOpen(test.id);
    try {
      // Fetch question data from test
      let questionsData = [];
      if (test.questions && test.questions.length > 0) {
        questionsData = await Promise.all(
          test.questions.map(async (qRef: any) => {
            const qSnap = await getDoc(qRef);
            const d = (qSnap.data() as any) || {};
            return {
              id: qSnap.id,
              question: d.questionText || d.question || "",
              optionA: d.optionA || "",
              optionB: d.optionB || "",
              optionC: d.optionC || "",
              optionD: d.optionD || "",
              correct: d.correct || "",
              explanation: d.explanation || "",
              solution: d.solution || "",
              difficulty: d.difficulty || "",
              bloom: d.bloom || "",
            };
          })
        );
      }
      setPreviewQuestions(questionsData);
    } catch (err) {
      console.error("Error fetching questions for preview:", err);
      setPreviewQuestions([]);
    }
  };

  // Handler to prepare questions with LaTeX images for PDF
  const handlePreparePdf = async (test: any) => {
    setPreparePdfTest(test);
    setPdfLoading(true);
    // If questions are DocumentReferences, fetch their data
    let questionsData = [];
    if (
      test.questions &&
      test.questions.length > 0 &&
      typeof test.questions[0] === "object" &&
      test.questions[0].path
    ) {
      // Firestore DocumentReferences
      questionsData = await Promise.all(
        test.questions.map(async (qRef: any) => {
          const qSnap = await getDoc(qRef);
          const d = (qSnap.data() as any) || {};
          return {
            id: qSnap.id,
            question: d.questionText || d.question || "",
            optionA: d.optionA || "",
            optionB: d.optionB || "",
            optionC: d.optionC || "",
            optionD: d.optionD || "",
            correct: d.correct || "",
            explanation: d.explanation || "",
            solution: d.solution || "",
            difficulty: d.difficulty || "",
            bloom: d.bloom || "",
            questionLatex: d.questionLatex || "",
            optionALatex: d.optionALatex || "",
            optionBLatex: d.optionBLatex || "",
            optionCLatex: d.optionCLatex || "",
            optionDLatex: d.optionDLatex || "",
          };
        })
      );
    } else {
      // Already have question data
      questionsData = (test.questions || []).map((q: any) => ({
        id: q.id,
        question: q.questionText || q.question || "",
        optionA: q.optionA || "",
        optionB: q.optionB || "",
        optionC: q.optionC || "",
        optionD: q.optionD || "",
        correct: q.correct || "",
        explanation: q.explanation || "",
        solution: q.solution || "",
        difficulty: q.difficulty || "",
        bloom: q.bloom || "",
        questionLatex: q.questionLatex || "",
        optionALatex: q.optionALatex || "",
        optionBLatex: q.optionBLatex || "",
        optionCLatex: q.optionCLatex || "",
        optionDLatex: q.optionDLatex || "",
      }));
    }
    // Prepare questions with LaTeX images
    const questionsWithLatex = await Promise.all(
      questionsData.map(async (q: any) => {
        let questionLatexImg = null;
        if (q.questionLatex && q.questionLatex.trim()) {
          questionLatexImg = await latexToPngDataUrl(q.questionLatex);
          console.log("LaTeX Q:", q.questionLatex, "->", questionLatexImg);
        }
        let optionALatexImg = null;
        if (q.optionALatex && q.optionALatex.trim()) {
          optionALatexImg = await latexToPngDataUrl(q.optionALatex);
          console.log("LaTeX A:", q.optionALatex, "->", optionALatexImg);
        }
        let optionBLatexImg = null;
        if (q.optionBLatex && q.optionBLatex.trim()) {
          optionBLatexImg = await latexToPngDataUrl(q.optionBLatex);
          console.log("LaTeX B:", q.optionBLatex, "->", optionBLatexImg);
        }
        let optionCLatexImg = null;
        if (q.optionCLatex && q.optionCLatex.trim()) {
          optionCLatexImg = await latexToPngDataUrl(q.optionCLatex);
          console.log("LaTeX C:", q.optionCLatex, "->", optionCLatexImg);
        }
        let optionDLatexImg = null;
        if (q.optionDLatex && q.optionDLatex.trim()) {
          optionDLatexImg = await latexToPngDataUrl(q.optionDLatex);
          console.log("LaTeX D:", q.optionDLatex, "->", optionDLatexImg);
        }
        const questionParts = await splitTextWithLatex(q.question || "");
        const optionAParts = await splitTextWithLatex(q.optionA || "");
        const optionBParts = await splitTextWithLatex(q.optionB || "");
        const optionCParts = await splitTextWithLatex(q.optionC || "");
        const optionDParts = await splitTextWithLatex(q.optionD || "");
        return {
          ...q,
          questionLatexImg,
          optionALatexImg,
          optionBLatexImg,
          optionCLatexImg,
          optionDLatexImg,
          questionParts,
          optionAParts,
          optionBParts,
          optionCParts,
          optionDParts,
        };
      })
    );
    setPdfQuestions(questionsWithLatex);
    setPdfLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <Sidebar />
      <main className="flex-1 bg-gray-50 flex flex-col items-center p-10">
        <div className="w-full max-w-5xl">
          <button
            className="mb-4 px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
            onClick={() => {
              if (
                userSchoolId &&
                typeof userSchoolId === "object" &&
                "path" in userSchoolId &&
                "id" in userSchoolId
              ) {
                const ref = userSchoolId as any;
                console.log("Debug schoolId:", ref);
                alert(
                  "schoolId path: " + ref.path + "\nschoolId id: " + ref.id
                );
              } else {
                alert("schoolId: " + userSchoolId);
              }
            }}
          >
            Debug: Show Auth User SchoolID
          </button>
          <h1 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
            Manage Tests
          </h1>
          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {paginatedTests.map((test: {
                id: string;
                name: string;
                className: string;
                start: any;
                end: any;
                status: keyof typeof statusConfig;
                online?: boolean;
                questions?: any[];
                totalQuestions?: number | null;
              }) => {
                const StatusIcon = statusConfig[test.status].icon;
                return (
                  <div key={test.id} className="bg-white rounded-2xl shadow border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-blue-900">
                        {test.name || "Untitled Test"}
                      </h3>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${statusConfig[test.status].bg} ${statusConfig[test.status].text} ${statusConfig[test.status].border} border`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig[test.status].label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-blue-900">
                      <div>
                        <span className="font-semibold">Class:</span> {test.className}
                      </div>
                      <div>
                        <span className="font-semibold">Start:</span> {test.start ? new Date(test.start).toLocaleString() : "-"}
                      </div>
                      <div>
                        <span className="font-semibold">End:</span> {test.end ? new Date(test.end).toLocaleString() : "-"}
                      </div>
                      <div>
                        <span className="font-semibold">Questions:</span> {test.questions ? test.questions.length : 0}
                        {typeof test.totalQuestions === "number" ? ` / ${test.totalQuestions}` : ""}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4 items-center">
                      {/* First row: Three buttons */}
                      <div className="flex flex-wrap gap-3 w-full justify-start">
                        <button
                          className="px-4 py-2 rounded-xl font-semibold shadow-sm border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 transition"
                          onClick={() => setSelectDialogOpen(test.id)}
                        >
                          Select Questions
                        </button>
                        <button
                          className="px-4 py-2 rounded-xl font-semibold shadow-sm border border-green-200 bg-white text-green-700 hover:bg-green-50 focus:ring-2 focus:ring-green-200 transition flex items-center gap-2"
                          onClick={() => handlePreviewQuestions(test)}
                          disabled={!test.questions || test.questions.length === 0}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview
                        </button>
                        <button
                          className="px-4 py-2 rounded-xl font-semibold shadow-sm border border-purple-200 bg-white text-purple-700 hover:bg-purple-50 focus:ring-2 focus:ring-purple-200 transition"
                          onClick={() => handlePreparePdf(test)}
                        >
                          Prepare PDF
                        </button>
                      </div>

                      {/* Horizontal divider */}
                      <hr className="my-2 border-gray-200 w-full" />

                      {/* Second row: Last two buttons (Publish, Delete) */}
                      <div className="flex flex-wrap gap-3 w-full justify-start">
                        <button
                          className={`px-4 py-2 rounded-xl font-semibold shadow-sm border transition ${test.online ? "bg-blue-900 text-white border-blue-900 cursor-default" : "border-pink-200 bg-white text-pink-700 hover:bg-pink-50 focus:ring-2 focus:ring-pink-200"}`}
                          onClick={() => handlePublish(test.id)}
                          disabled={test.online || actionLoading === test.id}
                        >
                          {actionLoading === test.id ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span>
                          ) : null}
                          {test.online ? "Published" : "Publish"}
                        </button>
                        <button
                          className="px-4 py-2 rounded-xl font-semibold shadow-sm border border-red-200 bg-white text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-200 transition"
                          onClick={() => setConfirmDeleteId(test.id)}
                          disabled={actionLoading === test.id}
                        >
                          {actionLoading === test.id ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 inline-block mr-2"></span>
                          ) : null}
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* QuestionSelectionDialog for this test */}
                    {selectDialogOpen === test.id && (
                      <QuestionSelectionDialog
                        open={true}
                        onClose={() => setSelectDialogOpen(null)}
                        onUpdate={async (selected: string[]) => {
                          setSelectedQuestions((prev) => ({
                            ...prev,
                            [test.id]: selected,
                          }));
                          setSelectDialogOpen(null);
                          // Refresh the test data to show updated question count
                          await refreshTestData(test.id);
                        }}
                        initialSelected={selectedQuestions[test.id] || []}
                        schoolId={userSchoolId}
                        testId={doc(db, "test", test.id)}
                        onRefreshTest={() => refreshTestData(test.id)}
                      />
                    )}
                  </div>
                );
              })}

              {/* Test Preview Dialog */}
              {previewDialogOpen && (
                <TestPreviewDialog
                  open={true}
                  onClose={() => setPreviewDialogOpen(null)}
                  questions={previewQuestions}
                  testId={previewDialogOpen}
                  onRefreshTest={() => refreshTestData(previewDialogOpen)}
                />
              )}
              {tests.length === 0 && (
                <div className="col-span-full text-center text-blue-400 py-10">
                  No tests found.
                </div>
              )}
            </div>
          )}
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                className="px-4 py-2 rounded-lg font-semibold border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-blue-700 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-4 py-2 rounded-lg font-semibold border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
          <div className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-blue-100 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-red-700 mb-4">
              Delete Test?
            </h2>
            <p className="text-blue-700 mb-6 text-center">
              Are you sure you want to delete this test? This action cannot be
              undone.
            </p>
            <div className="flex gap-4">
              <button
                className="px-6 py-2 rounded-xl font-bold shadow-sm border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 transition"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-xl font-bold shadow-sm border border-red-200 bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-200 transition"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={actionLoading === confirmDeleteId}
              >
                {actionLoading === confirmDeleteId ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span>
                ) : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Prepare PDF Dialog */}
      {preparePdfTest && (
        <Dialog
          open={!!preparePdfTest}
          onClose={() => setPreparePdfTest(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative border border-blue-100 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">
              Download PDF for {preparePdfTest.name}
            </h2>
            {pdfLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>{" "}
                Preparing PDF...
              </div>
            ) : (
              <PDFDownloadButton questions={pdfQuestions} viewYear={2024} />
            )}
            <button
              className="mt-4 px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
              onClick={() => setPreparePdfTest(null)}
            >
              Close
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
