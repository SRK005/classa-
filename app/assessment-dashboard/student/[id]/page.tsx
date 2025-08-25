"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { db } from "../../../../lib/firebaseClient";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import Link from "next/link";

type TestRow = {
  id: string;
  testId?: string;
  testName?: string;
  subjectName?: string;
  className?: string;
  percentageScore?: number;
  createdAt?: Date;
  source?: "testResults" | "testResult";
};

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  

  const studentId = params?.id;
  const uidFromQuery = search?.get("uid") || undefined;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>("");
  const [tests, setTests] = useState<TestRow[]>([]);

  // Helper: safe read of student name either from students/{id} or users/{uid}
  const loadStudentName = async (uid?: string) => {
    try {
      // Try students collection first
      if (studentId) {
        const sSnap = await getDoc(doc(db, "students", studentId));
        if (sSnap.exists()) {
          const d = sSnap.data() as any;
          const n = d?.name || d?.displayName || "";
          if (n) setStudentName(n);
          // If uid missing, take from students doc
          if (!uid && d?.userId) uid = d.userId;
        }
      }

      // Fallback to users by uid
      if (uid && !studentName) {
        const uSnap = await getDoc(doc(db, "users", uid));
        if (uSnap.exists()) {
          const ud = uSnap.data() as any;
          const n = ud?.name || ud?.displayName || "";
          if (n) setStudentName(n);
        }
      }
    } catch (e) {
      // ignore name load errors
    }
  };

  // Fetch tests completed by this student
  const loadTests = async () => {
    setLoading(true);
    setError(null);

    try {
      // Determine effective uid
      let effectiveUid = uidFromQuery;

      // If no uid provided, try to read from students/{id}
      if (!effectiveUid && studentId) {
        try {
          const sSnap = await getDoc(doc(db, "students", studentId));
          if (sSnap.exists()) {
            const d = sSnap.data() as any;
            if (d?.userId && typeof d.userId === "string") {
              effectiveUid = d.userId;
            }
          }
        } catch {}
      }

      await loadStudentName(effectiveUid);

      const rows: TestRow[] = [];

      // 1) Primary schema: testResults with field studentId = <uid string>
      if (effectiveUid) {
        try {
          const trQ = query(
            collection(db, "testResults"),
            where("studentId", "==", effectiveUid)
          );
          const trSnap = await getDocs(trQ);
          trSnap.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
            const data = d.data() as any;
            rows.push({
              id: d.id,
              testId: data?.testId,
              testName: data?.testName,
              subjectName: data?.subjectName,
              percentageScore: data?.percentageScore,
              createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : undefined,
              source: "testResults",
            });
          });
        } catch (e) {
          // continue to fallbacks
        }
      }

      // 2) Legacy schema: testResult (singular) with field studentID as ref or uid string
      if (rows.length === 0) {
        try {
          const legacyRows: TestRow[] = [];

          // Try by students/{id} ref
          if (studentId) {
            try {
              const sRef = doc(db, "students", studentId);
              const q1 = query(collection(db, "testResult"), where("studentID", "==", sRef));
              const s1 = await getDocs(q1);
              s1.forEach((d) => {
                const data = d.data() as any;
                legacyRows.push({
                  id: d.id,
                  testId: typeof data?.testID === "string" ? data.testID : undefined,
                  testName: data?.testName,
                  percentageScore: typeof data?.accuracy === "number" ? data.accuracy : undefined,
                  createdAt: data?.endTime?.toDate ? data.endTime.toDate() : undefined,
                  source: "testResult",
                });
              });
            } catch {}
          }

          // Try by users/{uid} ref
          if (effectiveUid) {
            try {
              const uRef = doc(db, "users", effectiveUid);
              const q2 = query(collection(db, "testResult"), where("studentID", "==", uRef));
              const s2 = await getDocs(q2);
              s2.forEach((d) => {
                const data = d.data() as any;
                legacyRows.push({
                  id: d.id,
                  testId: typeof data?.testID === "string" ? data.testID : undefined,
                  testName: data?.testName,
                  percentageScore: typeof data?.accuracy === "number" ? data.accuracy : undefined,
                  createdAt: data?.endTime?.toDate ? data.endTime.toDate() : undefined,
                  source: "testResult",
                });
              });
            } catch {}

            // Try by raw uid string
            try {
              const q3 = query(collection(db, "testResult"), where("studentID", "==", effectiveUid));
              const s3 = await getDocs(q3);
              s3.forEach((d) => {
                const data = d.data() as any;
                legacyRows.push({
                  id: d.id,
                  testId: typeof data?.testID === "string" ? data.testID : undefined,
                  testName: data?.testName,
                  percentageScore: typeof data?.accuracy === "number" ? data.accuracy : undefined,
                  createdAt: data?.endTime?.toDate ? data.endTime.toDate() : undefined,
                  source: "testResult",
                });
              });
            } catch {}
          }

          rows.push(...legacyRows);
        } catch {}
      }

      // Enhance test meta for legacy rows when needed (subject, class) by reading test doc
      // Only hydrate rows missing names
      const toHydrate = rows.filter((r) => !r.testName || !r.subjectName);
      if (toHydrate.length > 0) {
        await Promise.all(
          toHydrate.map(async (r) => {
            if (!r.testId) return;
            try {
              const tSnap = await getDoc(doc(db, "test", r.testId));
              if (tSnap.exists()) {
                const t = tSnap.data() as any;
                r.testName = r.testName || t?.name;
                // subject can be subjectID ref or subjectId string
                if (!r.subjectName && t?.subjectID) {
                  try {
                    const subjSnap = await getDoc(
                      typeof t.subjectID === "string"
                        ? doc(db, "subjects", t.subjectID)
                        : (t.subjectID as any)
                    );
                    if (subjSnap.exists()) {
                      r.subjectName = (subjSnap.data() as any)?.name || r.subjectName;
                    }
                  } catch {}
                }
              }
            } catch {}
          })
        );
      }

      // Sort by date desc
      rows.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

      setTests(rows);
    } catch (e) {
      console.error(e);
      setError("Failed to load student's tests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadTests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, uidFromQuery]);

  const title = useMemo(() => {
    if (studentName) return `${studentName} • Tests Completed`;
    return "Student Tests Completed";
  }, [studentName]);

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <Link href="/assessment-dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white rounded-lg p-6 shadow-sm text-gray-600">No completed tests found for this student.</div>
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tests.map((t) => (
                    <tr key={t.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {t.source === "testResults" ? (
                          <Link href={`/test-result/${t.id}`} className="text-blue-600 hover:underline">
                            {t.testName || t.testId || "-"}
                          </Link>
                        ) : (
                          <span>{t.testName || t.testId || "-"}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{t.subjectName || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{typeof t.percentageScore === "number" ? `${t.percentageScore}%` : "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{t.createdAt ? t.createdAt.toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
