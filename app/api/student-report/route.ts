import { NextResponse } from "next/server";
import { buildStudentReportByStudentId, buildStudentReportByUserUid } from "@/lib/studentReport";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const uid = searchParams.get("uid");

    if (!studentId && !uid) {
      return NextResponse.json({ error: "Provide either studentId or uid" }, { status: 400 });
    }

    let report = null;
    if (studentId) {
      report = await buildStudentReportByStudentId(studentId);
    } else if (uid) {
      report = await buildStudentReportByUserUid(uid);
    }

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("/api/student-report error", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
