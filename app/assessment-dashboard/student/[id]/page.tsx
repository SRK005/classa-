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
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from "../../components/Sidebar";

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
    if (studentName) return `${studentName}'s Assessment Dashboard`;
    return "Student Assessment Dashboard";
  }, [studentName]);

  // Calculate test statistics
  const testStats = useMemo(() => {
    if (tests.length === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const validScores = tests.filter(test => typeof test.percentageScore === 'number' && !isNaN(test.percentageScore));
    const scores = validScores.map(test => test.percentageScore || 0);

    return {
      totalTests: tests.length,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0
    };
  }, [tests]);

  // Chart data for performance over time
  const chartData = useMemo(() => {
    if (tests.length === 0) return [];
    return tests.map(test => ({
      name: test.testName || `Test ${test.id.substring(0, 4)}`,
      score: test.percentageScore || 0,
      date: test.createdAt ? test.createdAt.toLocaleDateString() : 'N/A'
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [tests]);

  return (
    <Box sx={{ display: 'flex', backgroundColor: 'white', minHeight: '100vh' }}>
      <Sidebar />
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1, backgroundColor: 'gra' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {title}
          </Typography>
          <Button variant="outlined" component={Link} href="/assessment-dashboard">
            ← Back to Dashboard
          </Button>
        </Box>

        {/* Test Statistics Cards */}
        {!loading && tests.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 'bold', mb: 1 }}>
                {testStats.totalTests}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Total Tests Taken
              </Typography>
            </Paper>

            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f0f9ff' }}>
              <Typography variant="h6" sx={{ color: '#0369a1', fontWeight: 'bold', mb: 1 }}>
                {testStats.averageScore}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Average Score
              </Typography>
            </Paper>

            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: '#f0fdf4' }}>
              <Typography variant="h6" sx={{ color: '#15803d', fontWeight: 'bold', mb: 1 }}>
                {testStats.highestScore}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Highest Score
              </Typography>
            </Paper>

            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', backgroundColor: '#fef2f2' }}>
              <Typography variant="h6" sx={{ color: '#dc2626', fontWeight: 'bold', mb: 1 }}>
                {testStats.lowestScore}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Lowest Score
              </Typography>
            </Paper>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress />
          </Box>
        ) : tests.length === 0 ? (
          <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">No completed tests found for this student.</Typography>
          </Paper>
        ) : (
          <Box>
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                Performance Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                All Completed Tests
              </Typography>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Test</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tests.map((t) => (
                      <TableRow
                        key={t.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {t.source === "testResults" ? (
                            <Link href={`/test-result/${t.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                              {t.testName || t.testId || "-"}
                            </Link>
                          ) : (
                            <span>{t.testName || t.testId || "-"}</span>
                          )}
                        </TableCell>
                        <TableCell>{t.subjectName || "-"}</TableCell>
                        <TableCell>{typeof t.percentageScore === "number" ? `${t.percentageScore}%` : "-"}</TableCell>
                        <TableCell>{t.createdAt ? t.createdAt.toLocaleDateString() : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
}
