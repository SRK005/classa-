
## 1. Database Schema Design

- **Objective**: Define the necessary changes to the Firestore database schema to support teacher accounts and their association with students, and to facilitate querying student test results by teachers.
- **Proposed Changes**:
    - **`users` Collection**: Add a `role` field (e.g., 'student', 'teacher') to differentiate user types. For teachers, potentially add a `students` sub-collection or an array of student UIDs they are associated with.
    - **`testResults` Collection**: Consider adding a `teacherId` field to each test result document, linking it to the teacher who assigned or is responsible for that student's results. This will simplify querying for a teacher's students' results.

## 2. Teacher Dashboard Development

- **Objective**: Create a new Next.js page for the teacher dashboard that lists all students associated with the logged-in teacher.
- **Components**:
    - A new page, e.g., `app/teacher-dashboard/page.tsx`.
    - UI components to display a list of students (e.g., `StudentCard`, `StudentTable`).
    - Authentication guard to ensure only teachers can access this page.

## 3. Fetching Student Test Results

- **Objective**: Implement server-side or client-side logic to fetch test results for a specific student when their name is clicked on the teacher dashboard.
- **Logic**:
    - When a teacher clicks on a student's name, navigate to a student-specific test results page (e.g., `app/teacher-dashboard/[studentId]/page.tsx`).
    - On this page, fetch all `testResults` documents where `studentId` matches the selected student's ID.

## 4. Adapting `test-result/[testResultId]/page.tsx`

- **Objective**: Reuse and adapt the existing `test-result/[testResultId]/page.tsx` component to display detailed test reports for students from the teacher's perspective.
- **Adaptations**:
    - The component should be able to accept a `testResultId` as a prop or URL parameter, similar to its current functionality.
    - Ensure the data fetching logic within this component can retrieve the necessary test result details from Firestore.
    - Potentially add teacher-specific UI elements or remove student-specific interactive elements if not relevant for the teacher's view.
    
## Data Schemes and Structure

To implement the teacher login feature and enable teachers to view student test reports, we'll need to define clear data schemes and structures within Firestore. Here's a detailed breakdown:

### 1. `users` Collection

This collection will store information about both students and teachers. The key addition here is a `role` field to differentiate between user types and a mechanism to associate students with teachers.

-   **Document ID**: `userId` (Firebase Authentication UID)
-   **Fields**:
    -   `name`: `string` (e.g., "John Doe", "Jane Smith")
    -   `email`: `string` (User's email address)
    -   `role`: `string` (Enum: `"student"`, `"teacher"`)
    -   `createdAt`: `timestamp`
    -   `updatedAt`: `timestamp`
    -   **If `role` is `"teacher"`**:
        -   `associatedStudents`: `array<string>` (An array of `userId`s of students associated with this teacher. This allows a teacher to view results for specific students. Alternatively, a sub-collection `students` under the teacher's document could store references or basic student info.)
    -   **If `role` is `"student"`**:
        -   `teacherId`: `string` (Optional: The `userId` of the teacher associated with this student. This can be used for inverse lookups or if a student has a primary teacher.)

**Example `users` documents:**

```json
// Teacher User
{
  "name": "Mr. Anderson",
  "email": "anderson@example.com",
  "role": "teacher",
  "createdAt": "2023-01-01T10:00:00Z",
  "updatedAt": "2023-10-26T14:30:00Z",
  "associatedStudents": [
    "studentUid123",
    "studentUid456",
    "studentUid789"
  ]
}

// Student User
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "role": "student",
  "createdAt": "2023-01-05T11:00:00Z",
  "updatedAt": "2023-10-26T14:35:00Z",
  "teacherId": "teacherUidXYZ" // Optional, depending on association strategy
}
```

### 2. `testResults` Collection

This collection already exists, but we need to ensure it contains the necessary fields to link test results to students and potentially to teachers for easier querying.

-   **Document ID**: Auto-generated or `testResultId`
-   **Existing Fields (as per current structure)**:
    -   `studentId`: `string` (UID of the student who took the test)
    -   `testId`: `string` (ID of the test taken)
    -   `score`: `number`
    -   `completionDate`: `timestamp`
    -   `performanceMetrics`: `object` (e.g., speed, accuracy)
    -   `questionBreakdown`: `array<object>` (details for each question: `questionId`, `answer`, `correct`, `difficulty`, `bloomTaxonomy`, `topic`, `prerequisites`)
    -   ...
-   **New Field (Recommended)**:
    -   `teacherId`: `string` (The `userId` of the teacher who assigned this test or is responsible for this student. This field is crucial for teachers to easily query *their* students' test results. This would be populated when the test is assigned or completed.)

**Example `testResults` document with `teacherId`:**

```json
{
  "studentId": "studentUid123",
  "testId": "mathTest001",
  "score": 85,
  "completionDate": "2023-10-25T09:00:00Z",
  "teacherId": "teacherUidXYZ", // New field
  "performanceMetrics": {
    "timeTaken": "30m",
    "accuracy": 0.85
  },
  "questionBreakdown": [
    // ... array of question details
  ]
}
```

### 3. Firebase Security Rules

Crucial for controlling access to data based on user roles. Teachers should only be able to read their associated students' data, and students only their own.

**Example Firestore Security Rules (Conceptual):**

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users Collection Rules
    match /users/{userId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
    }

    // Test Results Collection Rules
    match /testResults/{testResultId} {
      // Students can only read their own test results
      allow read: if request.auth.uid == resource.data.studentId;

      // Teachers can read test results of students they are associated with
      allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher' &&
                     resource.data.studentId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.associatedStudents;

      // Only authenticated users can create test results (e.g., after completing a test)
      allow create: if request.auth.uid != null;
      // No direct update/delete by students or teachers for test results (usually immutable)
      allow update, delete: if false;
    }

    // Add rules for other collections as needed (e.g., tests, questions)
  }
}
```

### Implementation Structure

1.  **Teacher Login**: Utilize existing Firebase Authentication. After login, check the user's `role` from the `users` collection.
2.  **Teacher Dashboard Page (`app/teacher-dashboard/page.tsx`)**:
    *   Fetch the logged-in teacher's `associatedStudents` array from their `users` document.
    *   For each `studentId` in `associatedStudents`, fetch the student's name from the `users` collection.
    *   Display a list of students. Each student entry will have a "View Details" button or link.
3.  **Student-Specific Test Results List Page (`app/teacher-dashboard/[studentId]/page.tsx`)**:
    *   When a teacher clicks "View Details" for a student, navigate to this page, passing the `studentId` as a URL parameter.
    *   On this page, query the `testResults` collection for all documents where `studentId` matches the URL parameter.
    *   Display a list of test results for that specific student (e.g., Test Name, Score, Date).
    *   Each test result entry will have a "View Report" button or link.
4.  **Detailed Test Report Page (Reusing `app/test-result/[testResultId]/page.tsx`)**:
    *   When a teacher clicks "View Report" for a specific test result, navigate to the existing `app/test-result/[testResultId]/page.tsx` page, passing the `testResultId`.
    *   This page will then display the detailed report, leveraging its existing data fetching and rendering logic.
    *   Consider adding a conditional UI element or a prop to this component to indicate if it's being viewed by a teacher, potentially hiding student-specific actions or navigation.