# Classwise Performance Dashboard — Implementation Guide

This document explains how the page `app/assessment-question-bank/results/view/classwisekiro/page.tsx` works and how to implement a similar dashboard. It covers Firebase collections, relationships, data flow, and UI/UX design ideas.

## Purpose

- Show class-wise performance across tests created by the logged-in teacher.
- Aggregate metrics per class: total students, average score, highest/lowest score, pass rate.
- Visualize with summary cards, bar chart, pie chart, and detailed class cards.

## Firebase Collections and Relationships

The page reads from these collections:

- users/{uid}
  - Used to determine the current teacher via `auth` and build `users/{uid}` DocumentReference for queries.

- test
  - Each test document contains:
    - createdBy: DocumentReference -> `users/{uid}` of the creator.
    - classId: DocumentReference -> A class document (collection path is stored inside the reference; not hard-coded here).
    - Other test metadata (not required for this page).

- testResults
  - Each test result document contains:
    - testId: string -> The ID of a doc in `test`.
    - studentId: string -> The student’s identifier.
    - percentageScore: number -> Percentage score for that student in that test.

Notes:
- The class document’s collection name isn’t assumed in the code. It is read via the DocumentReference stored in `test.classId`. The code fetches each class doc and reads its `name` field for display. Ensure class docs contain a `name` string.
- The `test.createdBy` field must be a DocumentReference to `users/{uid}` for the equality query to work.

## Data Flow Overview

1. Auth
   - Get the current user with `useAuthState(auth)`.

2. Fetch tests created by this user
   - Query `test` with `where("createdBy", "==", userRef)`.
   - Build:
     - testsMap: map testId -> test data (includes `classId` ref).
     - classRefMap: unique classId -> DocumentReference for class docs.

3. Resolve class names
   - For each `classId` reference, `getDoc(ref)` and read `name`. Fallback to "Unknown Class".

4. Fetch test results in batches
   - Extract all testIds.
   - Firestore `in` query limit is 30 values, so split into chunks of up to 30 testIds.
   - For each chunk, query `testResults` with `where('testId', 'in', batchIds)`.

5. Aggregate per class
   - For every test result:
     - Find its test via `testsMap.get(result.testId)`.
     - Resolve `classId` from `test.classId.id`.
     - Aggregate metrics per class key:
       - studentIds: Set to count unique students.
       - totalScore: sum of `percentageScore`.
       - testCount: number of results aggregated.
       - highestScore, lowestScore tracking.
       - passedCount (score >= 35).

6. Compute formatted output per class
   - averageScore = totalScore / testCount.
   - passRate = (passedCount / testCount) * 100.
   - totalStudents = size of `studentIds` set.

7. Prepare chart data
   - BarChart: per-class `averageScore` and `passRate`.
   - PieChart: distribution buckets by average score:
     - Excellent (>= 80), Good (60–79), At-Risk (< 60).

8. Render UI
   - Loading & empty states.
   - Summary cards, charts, class cards, and action buttons.

## Minimal Data Schema Requirements

- users/{uid}
  - Required: n/a for this page beyond existence; referenced in `test.createdBy`.

- test/{testId}
  - createdBy: DocumentReference -> users/{uid}
  - classId: DocumentReference -> class doc (must contain `name`)

- testResults/{resultId}
  - testId: string
  - studentId: string
  - percentageScore: number

- class documents (the target of `test.classId`)
  - name: string (used for display)

## UI/UX Design Breakdown

- Layout
  - `Sidebar` on the left; main content scrollable.

- Summary Cards (top row)
  - Overall Average: mean of class averages.
  - Classes: number of classes with data.
  - Total Students: sum of unique students across classes.
  - Pass Rate: mean of class pass rates.

- Charts
  - BarChart (Recharts): X-axis class name (shortened), bars for `averageScore` and `passRate`.
  - PieChart (Recharts): segments by class average performance distribution.

- Class Cards
  - Icon + name + student count.
  - Metrics: Average, Pass Rate, Highest, Lowest.
  - Progress bar for average.
  - Mini line chart (low -> avg -> high trend line).
  - "View Full Details" button linking to `/assessment-question-bank/results/view/class-details/[className]`.

- States
  - Loading spinner with message.
  - Empty state card prompting to create tests.

- Actions (placeholders)
  - Download PDF Report
  - Export to Excel
  - View Analytics

## Implementation Steps (Checklist)

- Setup
  - Ensure `db` and `auth` are available via your Firebase client (e.g., `@/lib/firebaseClient`).
  - Install `react-firebase-hooks`, `recharts`, and icon library (e.g., `lucide-react`).

- Data Fetching (in a `useEffect`)
  - If no user: stop and clear data.
  - Query `test` where `createdBy` == `doc(db, 'users', user.uid)`.
  - Build maps and resolve class names from `test.classId` refs.
  - Chunk `testIds` into size <= 30; for each, query `testResults` with `in`.
  - Aggregate results per class and compute metrics.

- UI
  - Derive chart datasets and distribution buckets.
  - Render the same sections and states as above.

## Performance & Scaling Considerations

- `where(..., 'in', [...])` limit of 30 values: already chunked.
- Class docs fetches are sequential in the original code; prefer `Promise.all` across unique class refs to reduce latency.
- Consider indexing:
  - `test` collection: index on `createdBy` (DocumentReference equality).
  - `testResults`: single-field index on `testId` (required for `in` queries).
- For very large datasets, paginate tests or time-bound queries.
- Optionally denormalize class names into `test` to reduce reads.

## Security Rules (Guidance)

- Allow read of `test` only where `createdBy` matches `request.auth.uid`.
- Allow read of `testResults` only for tests owned by the user (may require rules that resolve the referenced `test` and confirm `createdBy`).
- Ensure users can only read class docs referenced by their own tests, or copy needed fields (e.g., class name) into `test`.

## Error Handling & Edge Cases

- No tests or no results: show empty state.
- Missing `classId` or missing class doc: display "Unknown Class".
- Missing scores: treat as 0 in aggregations.

## Extension Ideas

- Replace class name in the URL with class ID to avoid special character issues and enable stable routing.
- Implement the action buttons:
  - PDF/Excel export using the aggregated `classData`.
- Add filters: date ranges, subjects, grades.
- Add drill-down pages for class -> student -> test breakdowns.

## Dependencies Used in the Page

- firebase/firestore: `collection`, `query`, `where`, `getDocs`, `doc`, `getDoc`, `DocumentReference`.
- react-firebase-hooks/auth: `useAuthState`.
- Recharts: `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `PieChart`, `Pie`, `Cell`, `LineChart`, `Line`.
- Icons: `lucide-react` (e.g., `TrendingUp`, `Users`, `BookOpen`, `Award`, `Download`, `FileSpreadsheet`, `BarChart3`).
- next/navigation: `useRouter` for navigation to class details.

## Key Takeaways

- The dashboard is driven by three core data sources: `users`, `test`, and `testResults`, plus class docs referenced by `test.classId`.
- Aggregation occurs client-side after fetching tests and batched test results.
- UI emphasizes quick-glance metrics, trends, and drill-downs, with clean loading/empty states.
