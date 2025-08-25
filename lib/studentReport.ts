import { db } from "../components/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  DocumentReference,
  Timestamp,
} from "firebase/firestore";

// ========================= Types =========================
export interface StudentDetails {
  name: string;
  email?: string;
  rollNumber?: string;
  classId?: string;
  className?: string;
  schoolId?: string;
  schoolName?: string;
}

export interface StudentResultSummary {
  timeTaken?: number; // ms
  totalMark?: number;
  totalQuestionAttempted?: number;
  accuracy?: number; // percentage
  completed?: boolean;
  startTime?: string; // ISO
  endTime?: string; // ISO
}

export interface QuestionBreakdownItem {
  questionId: string;
  questionText?: string;
  difficulty?: string;
  isCorrect?: boolean;
  wasSkipped?: boolean;
  studentAnswer?: string | null;
  correctAnswer?: string;
  explanation?: string;
}

export interface TestTakenItem {
  testId: string;
  testName?: string;
  subjectId?: string;
  subjectName?: string;
  lessonId?: string;
  lessonTitle?: string;
  classId?: string;
  className?: string;
  startTime?: string; // ISO
  endTime?: string; // ISO
  totalQuestions?: number;
  studentResult: StudentResultSummary;
  questionBreakdown: QuestionBreakdownItem[];
}

export interface StudentReport {
  studentId: string;
  userId?: string;
  studentDetails: StudentDetails;
  testsTaken: TestTakenItem[];
}

// ========================= Helpers =========================

function tsToISO(ts?: Timestamp | string | number | null): string | undefined {
  if (!ts) return undefined;
  if (typeof ts === "string") return ts;
  if (typeof ts === "number") return new Date(ts).toISOString();
  try {
    return ts.toDate().toISOString();
  } catch {
    return undefined;
  }
}

async function getNameFromRef(ref?: DocumentReference | null, field: string = "name"): Promise<{ id?: string; name?: string }> {
  if (!ref) return {};
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as any;
      return { id: snap.id, name: data?.[field] };
    }
  } catch (e) {
    // ignore
  }
  return {};
}

function isDocumentReference(val: unknown): val is DocumentReference<any> {
  return !!val && typeof val === "object" && "id" in (val as any) && "path" in (val as any);
}

async function safeGetDocByMaybeRef(maybeRefOrId: any, coll: string) {
  try {
    if (isDocumentReference(maybeRefOrId)) {
      const snap = await getDoc(maybeRefOrId);
      return snap.exists() ? { id: snap.id, data: snap.data() as any } : null;
    }
    if (typeof maybeRefOrId === "string" && maybeRefOrId) {
      const snap = await getDoc(doc(db, coll, maybeRefOrId));
      return snap.exists() ? { id: snap.id, data: snap.data() as any } : null;
    }
  } catch {
    // ignore
  }
  return null;
}

function uniqBy<T, K extends keyof any>(arr: T[], key: (t: T) => K): T[] {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}

// ========================= Public API =========================

/**
 * Build a StudentReport for a given Firebase Auth UID (users.uid).
 */
export async function buildStudentReportByUserUid(uid: string): Promise<StudentReport | null> {
  // 1) find student by userId
  const studentsRef = collection(db, "students");
  const q = query(studentsRef, where("userId", "==", uid));
  const studentSnaps = await getDocs(q);
  if (studentSnaps.empty) return null;
  const studentDoc = studentSnaps.docs[0];
  return buildStudentReportByStudentId(studentDoc.id);
}

/**
 * Build a StudentReport for a given students document ID.
 */
export async function buildStudentReportByStudentId(studentId: string): Promise<StudentReport | null> {
  // 1) Load student core
  const studentSnap = await getDoc(doc(db, "students", studentId));
  if (!studentSnap.exists()) return null;
  const student = studentSnap.data() as any;

  // 2) Student details and joins (class/school names)
  const { id: classId, name: className } = await getNameFromRef(student?.classId);
  const { id: schoolId, name: schoolName } = await getNameFromRef(student?.schoolId);

  const studentDetails: StudentDetails = {
    name: student?.name,
    email: student?.email,
    rollNumber: student?.rollNumber,
    classId,
    className,
    schoolId,
    schoolName,
  };

  // 3) Find testResult entries for this student.
  // testResult.studentID can be a DocumentReference (to students or users) or a string UID in some datasets.
  const testsTaken = await fetchTestsTakenForStudent(studentId, student?.userId, className);

  const report: StudentReport = {
    studentId: studentId,
    userId: student?.userId,
    studentDetails,
    testsTaken,
  };

  return report;
}

// ========================= Internals =========================

async function fetchTestsTakenForStudent(studentId: string, userUid?: string, fallbackClassName?: string): Promise<TestTakenItem[]> {
  const testResultColl = collection(db, "testResult");

  // Try queries in order: studentID == students/{studentId} (ref), studentID == users/{userUid} (ref), studentID == uid string
  const results: any[] = [];

  // a) By student ref
  try {
    const studentRef = doc(db, "students", studentId);
    const q1 = query(testResultColl, where("studentID", "==", studentRef));
    const s1 = await getDocs(q1);
    s1.forEach((d) => results.push({ id: d.id, data: d.data() }));
  } catch {}

  // b) By user ref
  if (userUid) {
    try {
      const userRef = doc(db, "users", userUid);
      const q2 = query(testResultColl, where("studentID", "==", userRef));
      const s2 = await getDocs(q2);
      s2.forEach((d) => results.push({ id: d.id, data: d.data() }));
    } catch {}
  }

  // c) By raw uid string (if any)
  if (userUid) {
    try {
      const q3 = query(testResultColl, where("studentID", "==", userUid));
      const s3 = await getDocs(q3);
      s3.forEach((d) => results.push({ id: d.id, data: d.data() }));
    } catch {}
  }

  // dedupe by result id
  const deduped = uniqBy(results, (r) => r.id);

  const items: TestTakenItem[] = [];
  for (const r of deduped) {
    const item = await hydrateTestResult(r.id, r.data, fallbackClassName);
    items.push(item);
  }

  return items;
}

async function hydrateTestResult(resultId: string, resultData: any, fallbackClassName?: string): Promise<TestTakenItem> {
  // Load test doc
  const testInfo = await safeGetDocByMaybeRef(resultData?.testID, "test");

  // Extract test base fields
  const testId = testInfo?.id ?? (typeof resultData?.testID === "string" ? resultData.testID : undefined) ?? "";
  const testName = testInfo?.data?.name;
  const totalQuestions = testInfo?.data?.totalQuestions ?? resultData?.totalQuestion;
  const classInfo = await getNameFromRef(testInfo?.data?.classId);
  const subjectInfo = await getNameFromRef(testInfo?.data?.subjectID);
  const lessonInfo = await getNameFromRef(testInfo?.data?.lessonId, "title");

  // Times
  const startTime = tsToISO(resultData?.startTime ?? testInfo?.data?.start);
  const endTime = tsToISO(resultData?.endTime ?? testInfo?.data?.end);

  // Student result summary
  const correctRefs: DocumentReference[] = Array.isArray(resultData?.correctAnswer) ? resultData.correctAnswer : [];
  const wrongRefs: DocumentReference[] = Array.isArray(resultData?.wrongAnswer) ? resultData.wrongAnswer : [];
  const skippedRefs: DocumentReference[] = Array.isArray(resultData?.skippedAnswer) ? resultData.skippedAnswer : [];

  const attempted = (correctRefs?.length ?? 0) + (wrongRefs?.length ?? 0);
  const accuracy = typeof resultData?.accuracy === "number"
    ? resultData.accuracy
    : attempted > 0
      ? Math.round(((correctRefs.length) / attempted) * 100)
      : undefined;

  const studentResult: StudentResultSummary = {
    timeTaken: resultData?.timeTaken,
    totalMark: resultData?.totalMark,
    totalQuestionAttempted: attempted,
    accuracy,
    completed: resultData?.completed,
    startTime,
    endTime,
  };

  // Question breakdown - merge refs from test.questions and result arrays, then fetch docs
  const testQuestionRefs: DocumentReference[] = Array.isArray(testInfo?.data?.questions) ? testInfo!.data!.questions : [];
  const allRefs: DocumentReference[] = uniqBy(
    [...testQuestionRefs, ...correctRefs, ...wrongRefs, ...skippedRefs].filter(isDocumentReference),
    (r) => r.path as any
  );

  const answerMap: Record<string, string | null> =
    (resultData?.answers as Record<string, string | null>) ||
    (resultData?.responses as Record<string, string | null>) ||
    {};

  const qDocs = await Promise.all(
    allRefs.map(async (ref) => {
      try {
        const s = await getDoc(ref);
        return s.exists() ? { id: s.id, data: s.data() as any } : null;
      } catch {
        return null;
      }
    })
  );

  const correctSet = new Set(correctRefs.map((r) => r.path));
  const wrongSet = new Set(wrongRefs.map((r) => r.path));
  const skippedSet = new Set(skippedRefs.map((r) => r.path));

  const questionBreakdown: QuestionBreakdownItem[] = qDocs
    .filter(Boolean)
    .map((qd) => {
      const id = (qd as any).id as string;
      const data = (qd as any).data as any;
      const refPath = (doc(db, "questionCollection", id)).path; // recreate path for set membership

      const studentAnswer = answerMap[id] ?? null;
      const isCorrect = correctSet.has(refPath) ? true : wrongSet.has(refPath) ? false : undefined;
      const wasSkipped = skippedSet.has(refPath) ? true : false;

      return {
        questionId: id,
        questionText: data?.question,
        difficulty: data?.difficulty,
        isCorrect,
        wasSkipped,
        studentAnswer,
        correctAnswer: data?.correct,
        explanation: data?.explanation,
      };
    });

  const item: TestTakenItem = {
    testId,
    testName,
    subjectId: subjectInfo.id,
    subjectName: subjectInfo.name,
    lessonId: lessonInfo.id,
    lessonTitle: lessonInfo.name,
    classId: classInfo.id,
    className: classInfo.name ?? fallbackClassName,
    startTime,
    endTime,
    totalQuestions,
    studentResult,
    questionBreakdown,
  };

  return item;
}
