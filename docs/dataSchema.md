# Firestore Data Schema

This document describes the structure of the Firestore collections in the project.

## Collections

### homework
- **Type:** HomeworkDocument
- Fields:
  - `id: string`
  - `type: "homework"`
  - `schoolId: DocumentReference`
  - `createdBy: DocumentReference`
  - `status: "active" | "archived"`
  - `attachments?: Array<{ name: string; url: string; type: string; size: number; }>`
  - `createdAt: Timestamp`
  - `updatedAt?: Timestamp`
  - `title: string`
  - `description: string`
  - `classId: DocumentReference`
  - `subjectId: DocumentReference`
  - `priority: "high" | "medium" | "low"`
  - `metadata: { isAssignment: boolean }`

### remark
- **Type:** RemarkDocument
- Fields:
  - `id: string`
  - `type: "remark"`
  - `schoolId: DocumentReference`
  - `createdBy: DocumentReference`
  - `status: "active" | "archived"`
  - `attachments?: Array<{ name: string; url: string; type: string; size: number; }>`
  - `createdAt: Timestamp`
  - `updatedAt?: Timestamp`
  - `studentId: DocumentReference`
  - `personalRemarks: string`
  - `workRemarks?: string`
  - `parentRemarks?: string`
  - `classId: DocumentReference`
  - `subjectId?: DocumentReference`
  - `priority: "high" | "medium" | "low"`
  - `category: "academic" | "behavior" | "attendance" | "performance"`

### Other Collections

#### assignment_submitted
- **Description:** Student assignment submissions
- Fields:
  - `assignmentId: string` (reference to assignments)
  - `studentId: string` (reference to users)
  - `classId: string` (reference to classes)
  - `subjectId: string` (reference to subjects)
  - `submittedAt: Timestamp`
  - `files: Array<{ name: string, url: string, type: string }>`
  - `textAnswer?: string`
  - `status: 'draft' | 'submitted' | 'graded'`
  - `grade?: number`
  - `feedback?: string`
  - `gradedBy?: string` (teacher UID)
  - `gradedAt?: Timestamp`

#### assignments
- **Description:** Homework assignments created by teachers
- Fields:
  - `title: string`
  - `description: string`
  - `subjectId: string` (reference to subjects)
  - `classId: string` (reference to classes)
  - `schoolId: string` (reference to schools)
  - `dueDate: Timestamp`
  - `priority: 'high' | 'medium' | 'low'`
  - `attachments: Array<string>` (URLs)
  - `createdBy: string` (teacher UID)
  - `createdAt: Timestamp`

#### category
- Fields: Unknown

#### chapters
- Fields (from indexes):
  - `majSubID`
  - `number`
  - `schoolID`
  - `name`
  - `sp`
  - `subjectID`

#### chats
- Fields: Unknown

#### classes
- **Description:** School classes (grade/batch)
- Fields:
  - `name: string`
  - `schoolId: string` (reference to schools)
  - `createdAt: Timestamp`
  - `updatedAt: Timestamp`

#### comments
- Fields (from indexes):
  - `lessonID`
  - `createdTime`

#### completeTestResults
- Fields: Unknown

#### conceptSummary
- **Description:** Concept explanations
- Fields:
  - `explanation: string`

#### contents
- **Description:** Learning resources (notes or videos)
- Fields:
  - `title: string`
  - `description: string`
  - `url: string`
  - `video: boolean`
  - `schoolID: string`
  - `classId: string`
  - `createdAt: Timestamp`

#### conversation
- Fields: Unknown

#### errorQuestions
- Fields: Unknown

#### example
- Fields: Unknown

#### ff_push_notifications
- Fields: Unknown

#### ff_user_push_notifications
- Fields: Unknown

#### flashCards
- Fields: Unknown

#### glossary
- Fields: Unknown

#### groupChats
- Fields: Unknown

#### homeworks
- Fields: Unknown

#### lessonPerformance
- Fields: Unknown

#### lessons
- Fields (from indexes):
  - `chapterID`
  - `number`
  - `order`
  - `sp`
  - `schoolID`
  - `title`

#### majorSubject
- Fields: Unknown

#### markedAnswers
- Fields: Unknown

#### messages
- Fields (from indexes):
  - `conID`
  - `sendAt`

#### mindmaps
- Fields: Unknown

#### mnemonics
- Fields: Unknown

#### parents
- Fields: Unknown

#### personalNotes
- Fields (from indexes):
  - `userID`
  - `createdTime`

#### questionCollection
- Fields (from indexes):
  - `previous`
  - `year`
  - `actNo`

#### remarks
- Fields: Unknown

#### resourceProvider
- Fields: Unknown

#### sample
- Fields: Unknown

#### school
- Fields: Unknown

#### shortNotes
- Fields: Unknown

#### sticky_notes
- Fields: Unknown

#### studentAnswers
- **Description:** Individual student responses to questions within a test.
- Fields:
  - `questionId: string` (Reference to the question answered)
  - `isCorrect: boolean` (Indicates if the student's answer was correct)
  - `subject: string` (The subject of the question)
  - `testId: string` (Reference to the test the question belongs to)
  - `studentId: string` (Reference to the student who answered)
  - `timestamp: Timestamp` (The time the answer was recorded)

#### students
- Fields (from indexes):
  - `classRef`
  - `userID`

#### subCategory
- Fields: Unknown

#### subjects
- Fields (from indexes):
  - `assClass` (array)
  - `sp`
  - `order`
  - `classId`
  - `mainBranchID`
  - `schoolId`

#### teachers
- Fields (from indexes):
  - `providerID`
  - `classes` (array)
  - `schoolId`
  - `createdTime`

#### test
- Fields (from indexes):
  - `classId`
  - `end`
  - `name`
  - `online`
  - `createdAt`
  - `wholeClass`
  - `conceptMasteryTest`
  - `lessonId`
  - `ProblemSolving`
  - `proficiencyTest`
  - `schoolID`
  - `start`
  - `userID` (array)

#### testAttempts
- Fields: Unknown

#### testResult
- Fields (from indexes):
  - `studentID`
  - `endTime`
  - `score`
  - `startTime`
  - `testID`
  - `average`

#### testResults
- Fields: Unknown

#### users
- Fields (from indexes):
  - `role`
  - `display_name`
  - `schoolId`
