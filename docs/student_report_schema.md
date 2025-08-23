# Student Report Data Schema

This document outlines the data schema for generating comprehensive student reports, combining information from various Firestore collections. The schema focuses on providing a unified view of student demographics, academic performance (test results), and test-related details.

## 1. Overview

Student reports will primarily draw data from the following core collections:

- `users`: For basic user authentication and role information.
- `students`: For detailed student-specific demographic and enrollment data.
- `test`: For test metadata, including test name, assigned class, and questions.
- `testResult`: For individual student performance on a specific test.
- `questionCollection`: For details about each question within a test.
- `classes`: For class-specific details.
- `subjects`: For subject-specific details.
- `lessons`: For lesson-specific details.

## 2. Combined Data Schema for Student Reports

To generate a student report, data will be aggregated and joined from the following collections. The conceptual structure for a student's report data would look like this:

### `StudentReport` (Conceptual Aggregation)

This is not a single Firestore collection but a conceptual aggregation of data points needed for a report.

```json
{
  "studentId": "[student_doc_id]", // From students collection
  "userId": "[user_auth_uid]",     // From users collection
  "studentDetails": {
    "name": "Aarav Sharma",
    "email": "aarav.sharma@email.com",
    "rollNumber": "001",
    "classId": "[class_doc_id]",
    "className": "Class 12", // Joined from classes collection
    "schoolId": "[school_doc_id]",
    "schoolName": "Scholars Path" // Joined from school collection
  },
  "testsTaken": [
    {
      "testId": "[test_doc_id]",
      "testName": "Test Name",
      "subjectId": "[subject_doc_id]",
      "subjectName": "Biology - Class 11th", // Joined from subjects collection
      "lessonId": "[lesson_doc_id]",
      "lessonTitle": "Wave and Frequency", // Joined from lessons collection
      "startTime": "2025-04-12T08:34:31.895Z",
      "endTime": "2025-04-12T09:00:00.000Z", // From testResult or calculated
      "totalQuestions": 15,
      "studentResult": {
        "timeTaken": 25401,
        "totalMark": 10,
        "totalQuestionAttempted": 10,
        "accuracy": 80, // Calculated based on correct/total attempted
        "completed": true
      },
      "questionBreakdown": [
        {
          "questionId": "[question_doc_id]",
          "questionText": "Question text",
          "difficulty": "medium",
          "isCorrect": true, // From testResult's correct/wrong/skipped arrays
          "studentAnswer": "Option A text", // If stored in testResult
          "correctAnswer": "Correct answer",
          "explanation": "Explanation text"
        }
        // ... more questions
      ]
    }
    // ... more tests
  ]
}
```

## 3. Collection Details and Relevant Fields

### 3.1 `users` Collection

- **Purpose:** Basic user authentication and role.
- **Relevant Fields:**
  - `uid`: string (Firebase Auth ID, links to `students.userId`)
  - `email`: string
  - `displayName`: string
  - `role`: string (e.g., `student`)

### 3.2 `students` Collection

- **Purpose:** Detailed student demographics and enrollment.
- **Relevant Fields:**
  - `id`: string (Firestore document ID)
  - `userId`: string (links to `users.uid`)
  - `name`: string
  - `email`: string
  - `rollNumber`: string
  - `classId`: DocumentReference (links to `classes` collection)
  - `schoolId`: DocumentReference (links to `school` collection)

### 3.3 `test` Collection

- **Purpose:** Stores metadata about each test.
- **Relevant Fields:**
  - `id`: string (Firestore document ID)
  - `name`: string (Test Name)
  - `totalQuestions`: number
  - `classId`: DocumentReference (links to `classes` collection)
  - `subjectID`: DocumentReference (links to `subjects` collection)
  - `lessonId`: DocumentReference (links to `lessons` collection)
  - `start`: Timestamp (Test start time)
  - `end`: Timestamp (Test end time)
  - `questions`: array of DocumentReferences (links to `questionCollection`)

### 3.4 `testResult` Collection

- **Purpose:** Stores individual student results for a specific test.
- **Relevant Fields:**
  - `id`: string (Firestore document ID)
  - `studentID`: DocumentReference (links to `users` or `students` collection)
  - `testID`: DocumentReference (links to `test` collection)
  - `timeTaken`: number (in milliseconds)
  - `totalMark`: number (marks scored by student)
  - `totalQuestion`: number (total questions in the test)
  - `accuracy`: number (accuracy percentage, can be calculated)
  - `wrongAnswer`: array of DocumentReferences (questions answered incorrectly)
  - `correctAnswer`: array of DocumentReferences (questions answered correctly)
  - `skippedAnswer`: array of DocumentReferences (questions skipped)
  - `completed`: boolean
  - `startTime`: Timestamp
  - `endTime`: Timestamp

### 3.5 `questionCollection` Collection

- **Purpose:** Stores details for each question.
- **Relevant Fields:**
  - `id`: string (Firestore document ID)
  - `question`: string (Question text)
  - `optionA`, `optionB`, `optionC`, `optionD`: string (Options)
  - `correct`: string (Correct answer option)
  - `explanation`: string
  - `difficulty`: string (`easy|medium|hard`)
  - `subjectId`: DocumentReference (links to `subjects` collection)
  - `chapterId`: DocumentReference (links to `chapters` collection)
  - `lessonId`: DocumentReference (links to `lessons` collection)

### 3.6 `classes` Collection

- **Purpose:** Stores class details.
- **Relevant Fields:**
  - `id`: string (Firestore document ID)
  - `name`: string (Class name, e.g., "Class 12")

### 3.7 `subjects` Collection

- **Purpose:** Stores subject details.
- **Relevant Fields:**
  - `id`: string (Firestore document ID)
  - `name`: string (Subject name, e.g., "Biology - Class 11th")

### 3.8 `lessons` Collection

- **Purpose:** Stores lesson details.
- **Relevant Fields:**
  - `id`: string (Firestore document ID)
  - `title`: string (Lesson title, e.g., "Wave and Frequency")

## 4. Relationships and Joins

To construct the `StudentReport`:

- **Student to User:** `students.userId` joins with `users.uid`.
- **Student to Class:** `students.classId` joins with `classes.id`.
- **Student to School:** `students.schoolId` joins with `school.id`.
- **Test Result to Test:** `testResult.testID` joins with `test.id`.
- **Test to Subject:** `test.subjectID` joins with `subjects.id`.
- **Test to Lesson:** `test.lessonId` joins with `lessons.id`.
- **Test Result to Questions:** `testResult.correctAnswer`, `wrongAnswer`, `skippedAnswer` arrays contain references to `questionCollection.id`.

## 5. Indexing Considerations

For efficient querying and report generation, the following composite indexes are recommended:

- `testResult` collection:
  - `studentID` ASC, `testID` ASC
  - `testID` ASC, `studentID` ASC
  - `studentID` ASC, `completed` ASC
- `students` collection:
  - `userId` ASC
  - `classId` ASC
  - `schoolId` ASC
- `test` collection:
  - `classId` ASC, `online` ASC, `end` ASC
  - `subjectID` ASC
  - `lessonId` ASC

## 6. Security Rules Considerations

Firestore security rules should ensure that:

- Students can only read their own `testResult` documents.
- Students can read `test`, `questionCollection`, `classes`, `subjects`, `lessons` documents relevant to their assigned tests and classes.
- Teachers/Admins can read all relevant data for reporting purposes.

Example (simplified):

```firestore
service cloud.firestore {
  match /databases/{database}/documents {
    match /testResult/{resultId} {
      allow read: if request.auth.uid == resource.data.studentID.id; // Assuming studentID is a direct UID or a reference to a user document with a matching UID
    }
    match /students/{studentId} {
      allow read: if request.auth.uid == resource.data.userId; // Student can read their own profile
    }
    match /test/{testId} {
      allow read: if resource.data.classId.id in get(/databases/$(database)/documents/students/$(request.auth.uid)).data.classId.id; // Students can read tests assigned to their class
    }
    // ... similar rules for other collections
  }
}
```

This schema provides a robust foundation for building student reports, allowing for detailed analysis of performance across various tests, subjects, and lessons.