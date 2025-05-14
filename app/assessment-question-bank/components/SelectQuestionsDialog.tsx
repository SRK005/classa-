import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebaseClient';
import { collection, query, where, getDocs, doc, Query, DocumentReference } from 'firebase/firestore';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Question {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct?: string;
  explanation?: string;
  solution?: string;
  difficulty?: string;
  bloom?: string;
}

interface FilterEntity {
  id: string;
  name: string;
}

interface SelectQuestionsDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (selected: string[]) => void;
  initialSelected?: string[];
}

const QUESTIONS_PER_PAGE = 10;
const CACHE_TTL = 31 * 24 * 60 * 60 * 1000;

function renderWithLatex(text: string) {
  if (/^\$.*\$$/.test(text?.trim() || '')) {
    return <div className="text-left"><BlockMath math={text.replace(/\$/g, '')} /></div>;
  }
  const parts = (text || '').split(/(\$[^$]+\$)/g);
  return parts.map((part, i) =>
    /^\$.*\$$/.test(part)
      ? <span className="text-left inline-block align-middle" key={i}><InlineMath math={part.replace(/\$/g, '')} /></span>
      : <span key={i}>{part}</span>
  );
}

function getTagColor(type: string, value: string) {
  if (type === 'difficulty') {
    if (value.toLowerCase() === 'easy') return 'bg-green-100 text-green-800';
    if (value.toLowerCase() === 'medium') return 'bg-yellow-100 text-yellow-800';
    if (value.toLowerCase() === 'hard') return 'bg-red-100 text-red-800';
  }
  if (type === 'bloom') {
    if (value.toLowerCase().includes('remember')) return 'bg-blue-100 text-blue-800';
    if (value.toLowerCase().includes('understand')) return 'bg-purple-100 text-purple-800';
    if (value.toLowerCase().includes('apply')) return 'bg-pink-100 text-pink-800';
    if (value.toLowerCase().includes('analyze')) return 'bg-orange-100 text-orange-800';
    if (value.toLowerCase().includes('evaluate')) return 'bg-teal-100 text-teal-800';
    if (value.toLowerCase().includes('create')) return 'bg-indigo-100 text-indigo-800';
  }
  return 'bg-gray-100 text-gray-800';
}

const SelectQuestionsDialog: React.FC<SelectQuestionsDialogProps> = ({ open, onClose, onUpdate, initialSelected = [] }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  // Filters
  const [classes, setClasses] = useState<FilterEntity[]>([]);
  const [subjects, setSubjects] = useState<FilterEntity[]>([]);
  const [chapters, setChapters] = useState<FilterEntity[]>([]);
  const [lessons, setLessons] = useState<FilterEntity[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [class11Id, setClass11Id] = useState<string>('');
  const [class12Id, setClass12Id] = useState<string>('');
  const [explanationOpen, setExplanationOpen] = useState<string | null>(null);
  const [explanationContent, setExplanationContent] = useState<{explanation?: string, solution?: string}>({});

  // Fetch classes
  useEffect(() => {
    async function fetchClasses() {
      const q = query(collection(db, 'classes'), where('sp', '==', true));
      const snap = await getDocs(q);
      const classList = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name || '' }));
      setClasses(classList);
      const class11 = classList.find(c => c.name?.toString().includes('11'));
      const class12 = classList.find(c => c.name?.toString().includes('12'));
      setClass11Id(class11?.id || '');
      setClass12Id(class12?.id || '');
    }
    if (open) fetchClasses();
  }, [open]);

  // Fetch subjects
  useEffect(() => {
    if (!selectedClass) { setSubjects([]); setSelectedSubject(''); return; }
    async function fetchSubjects() {
      const classRef = doc(db, 'classes', selectedClass);
      let q;
      if (selectedClass === class11Id && class12Id) {
        const class11Ref = doc(db, 'classes', class11Id);
        const class12Ref = doc(db, 'classes', class12Id);
        q = query(collection(db, 'subjects'), where('sp', '==', true), where('classID', 'in', [class11Ref, class12Ref]));
      } else {
        q = query(collection(db, 'subjects'), where('sp', '==', true), where('classID', '==', classRef));
      }
      const snap = await getDocs(q);
      const subjectList = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name || '' }));
      setSubjects(subjectList);
    }
    fetchSubjects();
  }, [selectedClass, class11Id, class12Id]);

  // Fetch chapters
  useEffect(() => {
    if (!selectedSubject) { setChapters([]); setSelectedChapter(''); return; }
    async function fetchChapters() {
      const q = query(collection(db, 'chapters'), where('sp', '==', true), where('subjectID', '==', doc(db, 'subjects', selectedSubject)));
      const snap = await getDocs(q);
      const chapterList = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name || '' }));
      setChapters(chapterList);
    }
    fetchChapters();
  }, [selectedSubject]);

  // Fetch lessons
  useEffect(() => {
    if (!selectedChapter) { setLessons([]); setSelectedLesson(''); return; }
    async function fetchLessons() {
      const q = query(collection(db, 'lessons'), where('sp', '==', true), where('chapterID', '==', doc(db, 'chapters', selectedChapter)));
      const snap = await getDocs(q);
      const lessonList = snap.docs.map(doc => ({ id: doc.id, name: doc.data().title || doc.data().name || '' }));
      setLessons(lessonList);
    }
    fetchLessons();
  }, [selectedChapter]);

  // Fetch questions
  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      let q: Query = query(collection(db, 'questionCollection'), where('sp', '==', true));
      if (selectedLesson) q = query(q, where('lessonID', '==', doc(db, 'lessons', selectedLesson)));
      else if (selectedChapter) q = query(q, where('chapterID', '==', doc(db, 'chapters', selectedChapter)));
      else if (selectedSubject) q = query(q, where('subjectID', '==', doc(db, 'subjects', selectedSubject)));
      else if (selectedClass) {
        const classRef = doc(db, 'classes', selectedClass);
        if (selectedClass === class11Id && class12Id) {
          const class11Ref = doc(db, 'classes', class11Id);
          const class12Ref = doc(db, 'classes', class12Id);
          q = query(q, where('classID', 'in', [class11Ref, class12Ref]));
        } else {
          q = query(q, where('classID', '==', classRef));
        }
      }
      const snap = await getDocs(q);
      const data = snap.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          question: d.questionText || d.question || '',
          optionA: d.optionA || '',
          optionB: d.optionB || '',
          optionC: d.optionC || '',
          optionD: d.optionD || '',
          correct: d.correct || '',
          explanation: d.explanation || '',
          solution: d.solution || '',
          difficulty: d.difficulty || '',
          bloom: d.bloom || '',
        };
      });
      setQuestions(data);
      setLoading(false);
    }
    if (open) fetchQuestions();
  }, [open, selectedClass, selectedSubject, selectedChapter, selectedLesson, class11Id, class12Id]);

  // Multi-page selection: keep across pages
  useEffect(() => {
    if (open && initialSelected) setSelected(initialSelected);
  }, [open, initialSelected]);

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const paginatedQuestions = questions.slice((currentPage - 1) * QUESTIONS_PER_PAGE, currentPage * QUESTIONS_PER_PAGE);

  const handleCheckbox = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full relative animate-fade-in border border-gray-200">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Select Questions</h2>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Class</label>
            <select className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-gray-800 bg-white" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSubject(''); setSelectedChapter(''); setSelectedLesson(''); }}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Subject</label>
            <select className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-gray-800 bg-white" value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter(''); setSelectedLesson(''); }} disabled={!selectedClass}>
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Chapter</label>
            <select className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-gray-800 bg-white" value={selectedChapter} onChange={e => { setSelectedChapter(e.target.value); setSelectedLesson(''); }} disabled={!selectedSubject}>
              <option value="">Select Chapter</option>
              {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Lesson</label>
            <select className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-gray-800 bg-white" value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)} disabled={!selectedChapter}>
              <option value="">Select Lesson</option>
              {lessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-gray-400">No questions found.</div>
        ) : (
          <>
            <div className="space-y-8 max-h-[400px] overflow-y-auto">
              {paginatedQuestions.map((q, idx) => {
                const isCorrect = (option: string) => option.trim().toLowerCase() === (q.correct || '').trim().toLowerCase();
                return (
                  <div key={q.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 text-left relative">
                    <input
                      type="checkbox"
                      className="absolute top-4 right-4 w-5 h-5 accent-blue-600"
                      checked={selected.includes(q.id)}
                      onChange={() => handleCheckbox(q.id)}
                    />
                    <div className="flex flex-wrap gap-2 mb-2">
                      {q.difficulty && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getTagColor('difficulty', q.difficulty)}`}>{q.difficulty}</span>
                      )}
                      {q.bloom && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getTagColor('bloom', q.bloom)}`}>{q.bloom}</span>
                      )}
                    </div>
                    <div className="font-semibold text-lg text-gray-900 mb-2">{(currentPage - 1) * QUESTIONS_PER_PAGE + idx + 1}. {renderWithLatex(q.question)}</div>
                    <div className="flex flex-col gap-2 mb-4">
                      <div className={`flex items-center gap-2 ${isCorrect(q.optionA) ? 'bg-green-50 border-2 border-green-400 rounded-lg font-bold' : ''} p-2`}> <span className="font-bold">A.</span> {renderWithLatex(q.optionA)}</div>
                      <div className={`flex items-center gap-2 ${isCorrect(q.optionB) ? 'bg-green-50 border-2 border-green-400 rounded-lg font-bold' : ''} p-2`}> <span className="font-bold">B.</span> {renderWithLatex(q.optionB)}</div>
                      <div className={`flex items-center gap-2 ${isCorrect(q.optionC) ? 'bg-green-50 border-2 border-green-400 rounded-lg font-bold' : ''} p-2`}> <span className="font-bold">C.</span> {renderWithLatex(q.optionC)}</div>
                      <div className={`flex items-center gap-2 ${isCorrect(q.optionD) ? 'bg-green-50 border-2 border-green-400 rounded-lg font-bold' : ''} p-2`}> <span className="font-bold">D.</span> {renderWithLatex(q.optionD)}</div>
                    </div>
                    <button
                      className="mt-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-800 font-semibold shadow hover:bg-blue-200 transition text-sm"
                      onClick={() => { setExplanationOpen(q.id); setExplanationContent({explanation: q.explanation, solution: q.solution}); }}
                    >
                      Show Explanation
                    </button>
                  </div>
                );
              })}
            </div>
            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >Previous</button>
              <span className="text-gray-700 font-semibold">Page {currentPage} of {totalPages}</span>
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >Next</button>
            </div>
            <div className="flex justify-end mt-8">
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition text-lg"
                onClick={() => onUpdate(selected)}
              >
                Update Questions
              </button>
            </div>
          </>
        )}
        {/* Explanation Dialog */}
        {explanationOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setExplanationOpen(null)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4 text-blue-700">Explanation & Solution</h2>
              {explanationContent.explanation && (
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-1">Explanation:</div>
                  <div className="bg-gray-50 rounded p-3 text-gray-900">
                    {renderWithLatex(explanationContent.explanation)}
                  </div>
                </div>
              )}
              {explanationContent.solution && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">Solution:</div>
                  <div className="bg-gray-50 rounded p-3 text-gray-900">
                    {renderWithLatex(explanationContent.solution)}
                  </div>
                </div>
              )}
              {!(explanationContent.explanation || explanationContent.solution) && (
                <div className="text-gray-400">No explanation or solution available.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectQuestionsDialog; 