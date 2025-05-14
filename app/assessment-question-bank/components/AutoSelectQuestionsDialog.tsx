import React, { useEffect, useState } from 'react';
import { db } from '../../../lib/firebaseClient';
import { collection, query, where, getDocs, doc, Query } from 'firebase/firestore';

interface FilterEntity {
  id: string;
  name: string;
}

interface AutoSelectQuestionsDialogProps {
  open: boolean;
  onClose: () => void;
  onAutoSelect: (selected: string[]) => void;
  classId?: string;
}

const difficulties = ['easy', 'medium', 'hard'];
const bloomFields = [
  'Remember',
  'Understand',
  'Apply',
  'Analyze',
  'Evaluate',
  'Create',
];

const AutoSelectQuestionsDialog: React.FC<AutoSelectQuestionsDialogProps> = ({ open, onClose, onAutoSelect, classId }) => {
  const [total, setTotal] = useState(0);
  const [easy, setEasy] = useState(0);
  const [medium, setMedium] = useState(0);
  const [hard, setHard] = useState(0);
  const [bloom, setBloom] = useState<{ [key: string]: number }>({});
  const [classes, setClasses] = useState<FilterEntity[]>([]);
  const [subjects, setSubjects] = useState<FilterEntity[]>([]);
  const [chapters, setChapters] = useState<FilterEntity[]>([]);
  const [lessons, setLessons] = useState<FilterEntity[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(classId || '');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [count, setCount] = useState(1);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedBlooms, setSelectedBlooms] = useState<string[]>([]);

  // Fetch classes
  useEffect(() => {
    async function fetchClasses() {
      const q = query(collection(db, 'classes'));
      const snap = await getDocs(q);
      setClasses(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name || '' })));
    }
    if (open && !classId) fetchClasses();
  }, [open, classId]);

  // Fetch subjects
  useEffect(() => {
    if (!selectedClass) { setSubjects([]); setSelectedSubject(''); return; }
    async function fetchSubjects() {
      const classRef = doc(db, 'classes', selectedClass);
      const q = query(collection(db, 'subjects'), where('classID', '==', classRef));
      const snap = await getDocs(q);
      setSubjects(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name || '' })));
    }
    fetchSubjects();
  }, [selectedClass]);

  // Fetch chapters
  useEffect(() => {
    if (!selectedSubject) { setChapters([]); setSelectedChapter(''); return; }
    async function fetchChapters() {
      const q = query(collection(db, 'chapters'), where('subjectID', '==', doc(db, 'subjects', selectedSubject)));
      const snap = await getDocs(q);
      setChapters(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name || '' })));
    }
    fetchChapters();
  }, [selectedSubject]);

  // Fetch lessons
  useEffect(() => {
    if (!selectedChapter) { setLessons([]); setSelectedLesson(''); return; }
    async function fetchLessons() {
      const q = query(collection(db, 'lessons'), where('chapterID', '==', doc(db, 'chapters', selectedChapter)));
      const snap = await getDocs(q);
      setLessons(snap.docs.map(doc => ({ id: doc.id, name: doc.data().title || doc.data().name || '' })));
    }
    fetchLessons();
  }, [selectedChapter]);

  // Handle difficulty changes
  const handleDifficultyChange = (diff: string) => {
    setSelectedDifficulties(prev => prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]);
  };

  // Handle bloom field changes
  const handleBloomChange = (bloom: string) => {
    setSelectedBlooms(prev => prev.includes(bloom) ? prev.filter(b => b !== bloom) : [...prev, bloom]);
  };

  // Validation
  const validate = () => {
    if (!total || total < 1) return 'Total count is required.';
    if (!selectedSubject) return 'Subject is required.';
    if (easy + medium + hard > total) return 'Sum of easy, medium, hard cannot exceed total.';
    const bloomSum = Object.values(bloom).reduce((a, b) => a + (b || 0), 0);
    if (bloomSum > total) return 'Sum of bloom fields cannot exceed total.';
    return '';
  };

  // On submit
  const handleAutoSelect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      let q: Query = query(collection(db, 'questionCollection'));
      if (selectedLesson) q = query(q, where('lessonID', '==', doc(db, 'lessons', selectedLesson)));
      else if (selectedChapter) q = query(q, where('chapterID', '==', doc(db, 'chapters', selectedChapter)));
      else if (selectedSubject) q = query(q, where('subjectID', '==', doc(db, 'subjects', selectedSubject)));
      if (selectedClass) q = query(q, where('classID', '==', doc(db, 'classes', selectedClass)));
      const snap = await getDocs(q);
      let pool = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as any[];
      // Filter by difficulty
      const diffMap: { [key: string]: number } = { easy: easy, medium: medium, hard: hard };
      let selectedIds: string[] = [];
      let used = new Set<string>();
      for (const diff of ['easy', 'medium', 'hard']) {
        if (diffMap[diff]) {
          const filtered = pool.filter(q => (q.difficulty || '').toLowerCase() === diff);
          const shuffled = filtered.sort(() => Math.random() - 0.5);
          for (let i = 0; i < diffMap[diff] && i < shuffled.length; ++i) {
            selectedIds.push(shuffled[i].id);
            used.add(shuffled[i].id);
          }
        }
      }
      // Filter by bloom
      for (const field of bloomFields) {
        const count = bloom[field] || 0;
        if (count) {
          const filtered = pool.filter(q => typeof q.bloom === 'string' && q.bloom.toLowerCase().includes(field.toLowerCase()) && !used.has(q.id));
          const shuffled = filtered.sort(() => Math.random() - 0.5);
          for (let i = 0; i < count && i < shuffled.length; ++i) {
            selectedIds.push(shuffled[i].id);
            used.add(shuffled[i].id);
          }
        }
      }
      // Fill up to total with random
      if (selectedIds.length < total) {
        const remaining = pool.filter(q => !used.has(q.id));
        const shuffled = remaining.sort(() => Math.random() - 0.5);
        for (let i = 0; i < total - selectedIds.length && i < shuffled.length; ++i) {
          selectedIds.push(shuffled[i].id);
        }
      }
      // Limit to total
      selectedIds = selectedIds.slice(0, total);
      onAutoSelect(selectedIds);
    } catch (err: any) {
      setError('Failed to auto select questions.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in border border-gray-200">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Auto Select Questions</h2>
        <form className="flex flex-col gap-5" onSubmit={handleAutoSelect}>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">Total Questions <span className="text-red-500">*</span></label>
            <input type="number" className="w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-base font-medium text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm" value={count} onChange={e => setCount(Number(e.target.value))} min={1} required />
          </div>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">Subject <span className="text-red-500">*</span></label>
            <select className="w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-base font-medium text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} required>
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">Chapter</label>
            <select className="w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-base font-medium text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm" value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)}>
              <option value="">Select Chapter</option>
              {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">Lesson</label>
            <select className="w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-base font-medium text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm" value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)}>
              <option value="">Select Lesson</option>
              {lessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">Difficulty</label>
            <div className="flex gap-4">
              {difficulties.map(diff => (
                <label key={diff} className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedDifficulties.includes(diff)} onChange={() => handleDifficultyChange(diff)} />
                  <span>{diff.charAt(0).toUpperCase() + diff.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">Bloom Fields</label>
            <div className="flex gap-4 flex-wrap">
              {bloomFields.map(bloom => (
                <label key={bloom} className="flex items-center gap-2">
                  <input type="checkbox" checked={selectedBlooms.includes(bloom)} onChange={() => handleBloomChange(bloom)} />
                  <span>{bloom}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <div className="text-red-500 text-center font-semibold mt-2">{error}</div>}
          <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition text-lg flex items-center justify-center" disabled={loading}>
            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span> : null}
            Auto Select
          </button>
        </form>
      </div>
    </div>
  );
};

export default AutoSelectQuestionsDialog; 