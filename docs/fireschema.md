# Firebase Firestore Schema for School Management System

This document provides a comprehensive Firestore data schema for a scalable school management web application.

## Core Collections

### 1. users
**Description:** Central user collection for all system users
```json
{
  "id": "user_123",
  "email": "john.doe@school.edu",
  "displayName": "John Doe",
  "photoURL": "https://storage.googleapis.com/...",
  "role": "student", // "student", "teacher", "admin", "parent", "employee"
  "schoolId": "school_456",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "lastLoginAt": "2024-01-15T10:30:00Z",
  "profile": {
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62701",
      "country": "USA"
    },
    "dateOfBirth": "2005-03-15",
    "gender": "male", // "male", "female", "other"
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1234567891",
      "relationship": "mother"
    }
  },
  "preferences": {
    "language": "en",
    "timezone": "America/Chicago",
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    }
  }
}
```

### 2. schools
**Description:** School/Institution information
```json
{
  "id": "school_456",
  "name": "Springfield High School",
  "code": "SHS001",
  "type": "high_school", // "elementary", "middle", "high_school", "college"
  "address": {
    "street": "456 Education Ave",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "contact": {
    "phone": "+1234567892",
    "email": "admin@springfield.edu",
    "website": "https://springfield.edu"
  },
  "settings": {
    "academicYear": "2024-2025",
    "gradeSystem": "percentage", // "percentage", "gpa", "letter"
    "currency": "USD",
    "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "sessionTimings": {
      "start": "08:00",
      "end": "15:30"
    }
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 3. students
**Description:** Student-specific information
```json
{
  "id": "student_789",
  "userId": "user_123", // Reference to users collection
  "schoolId": "school_456",
  "studentId": "SHS2024001", // School-specific student ID
  "classId": "class_101",
  "section": "A",
  "rollNumber": "001",
  "admissionDate": "2024-01-15",
  "academicInfo": {
    "grade": "10",
    "stream": "science", // "science", "commerce", "arts"
    "batch": "2024-2026",
    "previousSchool": "Springfield Middle School",
    "transferCertificate": "https://storage.googleapis.com/..."
  },
  "guardian": {
    "fatherId": "user_124", // Reference to users collection
    "motherId": "user_125",
    "guardianId": "user_124", // Primary guardian
    "relationship": "father"
  },
  "medical": {
    "bloodGroup": "O+",
    "allergies": ["peanuts"],
    "medications": [],
    "conditions": []
  },
  "transport": {
    "mode": "bus", // "bus", "private", "walking"
    "busRoute": "route_001",
    "pickupPoint": "Main Street Stop"
  },
  "fees": {
    "totalAnnual": 5000,
    "paid": 2500,
    "pending": 2500,
    "lastPaymentDate": "2024-01-15T10:30:00Z"
  },
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 4. teachers
**Description:** Teacher-specific information
```json
{
  "id": "teacher_456",
  "userId": "user_126", // Reference to users collection
  "schoolId": "school_456",
  "employeeId": "EMP2024001",
  "department": "Mathematics",
  "designation": "Senior Teacher",
  "qualification": {
    "degree": "M.Sc Mathematics",
    "university": "State University",
    "year": "2015",
    "certificates": ["Teaching License", "Advanced Mathematics"]
  },
  "subjects": ["subject_math", "subject_algebra"], // References to subjects
  "classes": ["class_101", "class_102"], // References to classes
  "experience": {
    "total": 8,
    "atCurrentSchool": 3,
    "previousInstitutions": [
      {
        "name": "City High School",
        "duration": "2016-2021",
        "position": "Mathematics Teacher"
      }
    ]
  },
  "employment": {
    "type": "full_time", // "full_time", "part_time", "contract"
    "joinDate": "2021-06-01",
    "salary": {
      "basic": 50000,
      "allowances": 10000,
      "total": 60000
    },
    "workingHours": {
      "start": "08:00",
      "end": "16:00"
    }
  },
  "permissions": {
    "canCreateAssignments": true,
    "canGradeExams": true,
    "canMarkAttendance": true,
    "canAccessReports": true
  },
  "isActive": true,
  "createdAt": "2021-06-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 5. employees
**Description:** Non-teaching staff information
```json
{
  "id": "employee_789",
  "userId": "user_127", // Reference to users collection
  "schoolId": "school_456",
  "employeeId": "EMP2024002",
  "department": "Administration",
  "designation": "Office Assistant",
  "employment": {
    "type": "full_time",
    "joinDate": "2023-01-15",
    "salary": {
      "basic": 30000,
      "allowances": 5000,
      "total": 35000
    },
    "workingHours": {
      "start": "09:00",
      "end": "17:00"
    }
  },
  "responsibilities": ["Student Records", "Fee Collection", "General Administration"],
  "permissions": {
    "canAccessStudentRecords": true,
    "canProcessFees": true,
    "canGenerateReports": false
  },
  "isActive": true,
  "createdAt": "2023-01-15T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Supporting Collections

### 6. classes
**Description:** Class/Grade information
```json
{
  "id": "class_101",
  "schoolId": "school_456",
  "name": "Grade 10",
  "section": "A",
  "grade": "10",
  "stream": "science",
  "academicYear": "2024-2025",
  "classTeacherId": "teacher_456", // Reference to teachers
  "subjects": ["subject_math", "subject_physics", "subject_chemistry"], // References
  "students": ["student_789"], // References to students
  "capacity": 40,
  "currentStrength": 35,
  "classroom": {
    "building": "Main Block",
    "floor": "2",
    "roomNumber": "201"
  },
  "timetable": {
    "monday": [
      {
        "period": 1,
        "subject": "subject_math",
        "teacher": "teacher_456",
        "startTime": "08:00",
        "endTime": "08:45"
      }
    ]
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 7. subjects
**Description:** Subject/Course information
```json
{
  "id": "subject_math",
  "schoolId": "school_456",
  "name": "Mathematics",
  "code": "MATH10",
  "description": "Advanced Mathematics for Grade 10",
  "department": "Mathematics",
  "grade": "10",
  "stream": "science",
  "type": "core", // "core", "elective", "optional"
  "credits": 4,
  "syllabus": {
    "chapters": [
      {
        "id": "chapter_001",
        "name": "Real Numbers",
        "topics": ["Euclid's Division Lemma", "Fundamental Theorem of Arithmetic"]
      }
    ],
    "practicals": [],
    "projects": []
  },
  "assessment": {
    "totalMarks": 100,
    "passingMarks": 35,
    "weightage": {
      "theory": 80,
      "practical": 20
    }
  },
  "teachers": ["teacher_456"], // References to teachers
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 8. attendance
**Description:** Daily attendance records
```json
{
  "id": "attendance_001",
  "schoolId": "school_456",
  "classId": "class_101",
  "date": "2024-01-15",
  "teacherId": "teacher_456", // Who marked attendance
  "records": [
    {
      "studentId": "student_789",
      "status": "present", // "present", "absent", "late", "excused"
      "timeIn": "08:00",
      "timeOut": "15:30",
      "remarks": ""
    }
  ],
  "summary": {
    "totalStudents": 35,
    "present": 33,
    "absent": 2,
    "late": 0,
    "excused": 0
  },
  "markedAt": "2024-01-15T08:15:00Z",
  "markedBy": "teacher_456"
}
```

### 9. exams
**Description:** Examination information
```json
{
  "id": "exam_001",
  "schoolId": "school_456",
  "name": "Mid-Term Examination",
  "type": "mid_term", // "unit_test", "mid_term", "final", "board"
  "academicYear": "2024-2025",
  "term": "first", // "first", "second", "third"
  "classes": ["class_101", "class_102"], // References to classes
  "subjects": ["subject_math", "subject_physics"], // References to subjects
  "schedule": [
    {
      "date": "2024-02-15",
      "subject": "subject_math",
      "startTime": "09:00",
      "endTime": "12:00",
      "duration": 180, // minutes
      "totalMarks": 100
    }
  ],
  "instructions": [
    "Bring your own stationery",
    "No electronic devices allowed"
  ],
  "status": "scheduled", // "scheduled", "ongoing", "completed", "cancelled"
  "createdBy": "teacher_456",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 10. examResults
**Description:** Individual exam results
```json
{
  "id": "result_001",
  "schoolId": "school_456",
  "examId": "exam_001", // Reference to exams
  "studentId": "student_789", // Reference to students
  "classId": "class_101",
  "subjectResults": [
    {
      "subjectId": "subject_math",
      "marksObtained": 85,
      "totalMarks": 100,
      "percentage": 85,
      "grade": "A",
      "remarks": "Excellent performance"
    }
  ],
  "overall": {
    "totalMarksObtained": 425,
    "totalMaxMarks": 500,
    "percentage": 85,
    "grade": "A",
    "rank": 3,
    "outOf": 35
  },
  "status": "published", // "draft", "published", "withheld"
  "publishedAt": "2024-02-20T10:00:00Z",
  "createdAt": "2024-02-18T15:30:00Z",
  "updatedAt": "2024-02-20T10:00:00Z"
}
```

### 11. assignments
**Description:** Homework and assignments
```json
{
  "id": "assignment_001",
  "schoolId": "school_456",
  "title": "Quadratic Equations Practice",
  "description": "Solve the given quadratic equations using different methods",
  "subjectId": "subject_math", // Reference to subjects
  "classId": "class_101", // Reference to classes
  "teacherId": "teacher_456", // Reference to teachers
  "type": "homework", // "homework", "project", "lab_work"
  "instructions": "Show all working steps clearly",
  "attachments": [
    {
      "name": "questions.pdf",
      "url": "https://storage.googleapis.com/...",
      "type": "pdf",
      "size": 1024000
    }
  ],
  "dueDate": "2024-01-20T23:59:59Z",
  "maxMarks": 50,
  "submissionType": "file", // "file", "text", "both"
  "allowLateSubmission": true,
  "latePenalty": 10, // percentage
  "status": "active", // "draft", "active", "closed"
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 12. submissions
**Description:** Assignment submissions
```json
{
  "id": "submission_001",
  "assignmentId": "assignment_001", // Reference to assignments
  "studentId": "student_789", // Reference to students
  "submittedAt": "2024-01-19T14:30:00Z",
  "isLate": false,
  "content": {
    "text": "Solution steps...",
    "files": [
      {
        "name": "solution.pdf",
        "url": "https://storage.googleapis.com/...",
        "type": "pdf",
        "size": 512000
      }
    ]
  },
  "grading": {
    "marksObtained": 45,
    "maxMarks": 50,
    "percentage": 90,
    "grade": "A",
    "feedback": "Excellent work! Clear explanations.",
    "gradedBy": "teacher_456",
    "gradedAt": "2024-01-21T10:00:00Z"
  },
  "status": "graded", // "submitted", "graded", "returned"
  "version": 1, // For resubmissions
  "createdAt": "2024-01-19T14:30:00Z",
  "updatedAt": "2024-01-21T10:00:00Z"
}
```

### 13. notifications
**Description:** System notifications
```json
{
  "id": "notification_001",
  "schoolId": "school_456",
  "title": "Assignment Due Reminder",
  "message": "Your Mathematics assignment is due tomorrow",
  "type": "assignment_reminder", // "announcement", "assignment_reminder", "exam_alert", "fee_reminder"
  "priority": "medium", // "low", "medium", "high", "urgent"
  "recipients": {
    "type": "specific", // "all", "role", "class", "specific"
    "userIds": ["user_123"], // For specific users
    "roles": [], // For role-based
    "classIds": [] // For class-based
  },
  "data": {
    "assignmentId": "assignment_001",
    "dueDate": "2024-01-20T23:59:59Z"
  },
  "channels": ["in_app", "email"], // "in_app", "email", "sms", "push"
  "status": "sent", // "draft", "scheduled", "sent", "failed"
  "readBy": ["user_123"], // Users who have read the notification
  "scheduledFor": "2024-01-19T09:00:00Z",
  "sentAt": "2024-01-19T09:00:00Z",
  "createdBy": "teacher_456",
  "createdAt": "2024-01-18T15:00:00Z"
}
```

### 14. fees
**Description:** Fee management
```json
{
  "id": "fee_001",
  "schoolId": "school_456",
  "studentId": "student_789", // Reference to students
  "academicYear": "2024-2025",
  "feeStructure": {
    "tuition": 3000,
    "library": 200,
    "laboratory": 500,
    "sports": 300,
    "transport": 1000,
    "total": 5000
  },
  "payments": [
    {
      "id": "payment_001",
      "amount": 2500,
      "method": "online", // "cash", "cheque", "online", "card"
      "transactionId": "TXN123456",
      "paidAt": "2024-01-15T10:30:00Z",
      "receivedBy": "employee_789",
      "receipt": "https://storage.googleapis.com/..."
    }
  ],
  "summary": {
    "totalFee": 5000,
    "totalPaid": 2500,
    "balance": 2500,
    "lastPaymentDate": "2024-01-15T10:30:00Z",
    "status": "partial" // "paid", "partial", "overdue"
  },
  "dueDate": "2024-03-31T23:59:59Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 15. leaves
**Description:** Leave applications
```json
{
  "id": "leave_001",
  "schoolId": "school_456",
  "applicantId": "user_123", // Reference to users (student/teacher/employee)
  "applicantType": "student", // "student", "teacher", "employee"
  "type": "sick", // "sick", "casual", "emergency", "vacation", "maternity"
  "startDate": "2024-01-20",
  "endDate": "2024-01-22",
  "totalDays": 3,
  "reason": "Fever and flu symptoms",
  "attachments": [
    {
      "name": "medical_certificate.pdf",
      "url": "https://storage.googleapis.com/...",
      "type": "pdf"
    }
  ],
  "status": "approved", // "pending", "approved", "rejected", "cancelled"
  "approvedBy": "teacher_456", // Reference to approver
  "approvedAt": "2024-01-18T14:00:00Z",
  "remarks": "Medical certificate provided",
  "appliedAt": "2024-01-17T10:00:00Z",
  "createdAt": "2024-01-17T10:00:00Z",
  "updatedAt": "2024-01-18T14:00:00Z"
}
```

### 16. timetables
**Description:** Class and teacher timetables
```json
{
  "id": "timetable_001",
  "schoolId": "school_456",
  "type": "class", // "class", "teacher"
  "referenceId": "class_101", // classId or teacherId
  "academicYear": "2024-2025",
  "effectiveFrom": "2024-01-15",
  "schedule": {
    "monday": [
      {
        "period": 1,
        "startTime": "08:00",
        "endTime": "08:45",
        "subjectId": "subject_math",
        "teacherId": "teacher_456",
        "room": "201",
        "type": "regular" // "regular", "practical", "library", "sports"
      }
    ]
  },
  "breaks": [
    {
      "name": "Short Break",
      "startTime": "10:30",
      "endTime": "10:45"
    },
    {
      "name": "Lunch Break",
      "startTime": "12:30",
      "endTime": "13:15"
    }
  ],
  "isActive": true,
  "createdBy": "user_admin",
  "createdAt": "2024-01-10T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Relationships and References

### One-to-Many Relationships
- **schools** → **users** (schoolId)
- **schools** → **classes** (schoolId)
- **classes** → **students** (classId)
- **teachers** → **subjects** (teacher can teach multiple subjects)
- **exams** → **examResults** (examId)
- **assignments** → **submissions** (assignmentId)

### Many-to-Many Relationships
- **teachers** ↔ **classes** (teacher can teach multiple classes, class can have multiple teachers)
- **students** ↔ **subjects** (through class enrollment)
- **classes** ↔ **subjects** (class has multiple subjects)

### Reference Fields
```javascript
// Example of how references are stored
{
  "studentId": "student_789", // String reference
  "classRef": db.collection('classes').doc('class_101'), // DocumentReference
  "teacherIds": ["teacher_456", "teacher_457"] // Array of references
}
```

## Indexing Suggestions

### Composite Indexes
```javascript
// For efficient querying
const indexes = [
  // Attendance queries
  { collection: 'attendance', fields: ['schoolId', 'classId', 'date'] },
  { collection: 'attendance', fields: ['schoolId', 'date', 'classId'] },
  
  // Student queries
  { collection: 'students', fields: ['schoolId', 'classId', 'isActive'] },
  { collection: 'students', fields: ['schoolId', 'grade', 'section'] },
  
  // Exam results
  { collection: 'examResults', fields: ['schoolId', 'examId', 'classId'] },
  { collection: 'examResults', fields: ['studentId', 'examId'] },
  
  // Assignments
  { collection: 'assignments', fields: ['schoolId', 'classId', 'subjectId', 'status'] },
  { collection: 'submissions', fields: ['assignmentId', 'studentId'] },
  
  // Notifications
  { collection: 'notifications', fields: ['schoolId', 'recipients.userIds', 'status'] },
  { collection: 'notifications', fields: ['schoolId', 'type', 'createdAt'] },
  
  // Fees
  { collection: 'fees', fields: ['schoolId', 'studentId', 'academicYear'] },
  { collection: 'fees', fields: ['schoolId', 'summary.status', 'dueDate'] },
  
  // Users
  { collection: 'users', fields: ['schoolId', 'role', 'isActive'] },
  { collection: 'users', fields: ['email', 'isActive'] }
];
```

## Security Rules (High Level)

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function getSchoolId() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.schoolId;
    }
    
    function isAdmin() {
      return getUserRole() == 'admin';
    }
    
    function isTeacher() {
      return getUserRole() == 'teacher';
    }
    
    function isStudent() {
      return getUserRole() == 'student';
    }
    
    function isParent() {
      return getUserRole() == 'parent';
    }
    
    function belongsToSameSchool(schoolId) {
      return getSchoolId() == schoolId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && 
        (request.auth.uid == userId || isAdmin() || 
         (isTeacher() && belongsToSameSchool(resource.data.schoolId)));
      allow write: if isAuthenticated() && 
        (request.auth.uid == userId || isAdmin());
    }
    
    // Students collection
    match /students/{studentId} {
      allow read: if isAuthenticated() && 
        (isAdmin() || 
         (isTeacher() && belongsToSameSchool(resource.data.schoolId)) ||
         (isStudent() && resource.data.userId == request.auth.uid) ||
         (isParent() && resource.data.guardian.guardianId == request.auth.uid));
      allow write: if isAdmin() || 
        (isTeacher() && belongsToSameSchool(resource.data.schoolId));
    }
    
    // Teachers collection
    match /teachers/{teacherId} {
      allow read: if isAuthenticated() && belongsToSameSchool(resource.data.schoolId);
      allow write: if isAdmin();
    }
    
    // Classes collection
    match /classes/{classId} {
      allow read: if isAuthenticated() && belongsToSameSchool(resource.data.schoolId);
      allow write: if isAdmin() || 
        (isTeacher() && belongsToSameSchool(resource.data.schoolId));
    }
    
    // Attendance collection
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated() && belongsToSameSchool(resource.data.schoolId);
      allow write: if isAdmin() || 
        (isTeacher() && belongsToSameSchool(resource.data.schoolId));
    }
    
    // Assignments collection
    match /assignments/{assignmentId} {
      allow read: if isAuthenticated() && belongsToSameSchool(resource.data.schoolId);
      allow write: if isAdmin() || 
        (isTeacher() && resource.data.teacherId == request.auth.uid);
    }
    
    // Submissions collection
    match /submissions/{submissionId} {
      allow read: if isAuthenticated() && 
        (isAdmin() || 
         resource.data.studentId == request.auth.uid ||
         (isTeacher() && belongsToSameSchool(get(/databases/$(database)/documents/assignments/$(resource.data.assignmentId)).data.schoolId)));
      allow write: if isAuthenticated() && 
        (resource.data.studentId == request.auth.uid || isAdmin() || isTeacher());
    }
    
    // Exam Results collection
    match /examResults/{resultId} {
      allow read: if isAuthenticated() && 
        (isAdmin() || 
         resource.data.studentId == request.auth.uid ||
         (isTeacher() && belongsToSameSchool(resource.data.schoolId)) ||
         (isParent() && get(/databases/$(database)/documents/students/$(resource.data.studentId)).data.guardian.guardianId == request.auth.uid));
      allow write: if isAdmin() || 
        (isTeacher() && belongsToSameSchool(resource.data.schoolId));
    }
    
    // Fees collection
    match /fees/{feeId} {
      allow read: if isAuthenticated() && 
        (isAdmin() || 
         resource.data.studentId == request.auth.uid ||
         (isParent() && get(/databases/$(database)/documents/students/$(resource.data.studentId)).data.guardian.guardianId == request.auth.uid));
      allow write: if isAdmin();
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && 
        (isAdmin() || 
         request.auth.uid in resource.data.recipients.userIds ||
         getUserRole() in resource.data.recipients.roles);
      allow write: if isAdmin() || isTeacher();
    }
  }
}
```

## Example Firestore Queries

### 1. Fetch Student with Class, Subjects, and Exam Reports
```javascript
// Get student details with related data
async function getStudentDetails(studentId) {
  try {
    // Get student document
    const studentDoc = await db.collection('students').doc(studentId).get();
    const studentData = studentDoc.data();
    
    // Get user details
    const userDoc = await db.collection('users').doc(studentData.userId).get();
    const userData = userDoc.data();
    
    // Get class details
    const classDoc = await db.collection('classes').doc(studentData.classId).get();
    const classData = classDoc.data();
    
    // Get subjects for the class
    const subjectsQuery = await db.collection('subjects')
      .where('id', 'in', classData.subjects)
      .get();
    const subjects = subjectsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get recent exam results
    const examResultsQuery = await db.collection('examResults')
      .where('studentId', '==', studentId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    const examResults = examResultsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return {
      student: { id: studentDoc.id, ...studentData },
      user: userData,
      class: { id: classDoc.id, ...classData },
      subjects,
      recentExamResults: examResults
    };
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
}
```

### 2. Generate Class-wise and Subject-wise Performance Reports
```javascript
// Generate performance report for a class
async function generateClassPerformanceReport(classId, examId) {
  try {
    // Get all students in the class
    const studentsQuery = await db.collection('students')
      .where('classId', '==', classId)
      .where('isActive', '==', true)
      .get();
    const students = studentsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get exam results for all students
    const examResultsQuery = await db.collection('examResults')
      .where('examId', '==', examId)
      .where('classId', '==', classId)
      .get();
    const examResults = examResultsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Calculate class statistics
    const classStats = {
      totalStudents: students.length,
      appearedStudents: examResults.length,
      absentStudents: students.length - examResults.length,
      averagePercentage: 0,
      highestScore: 0,
      lowestScore: 100,
      subjectWiseStats: {}
    };
    
    let totalPercentage = 0;
    const subjectStats = {};
    
    examResults.forEach(result => {
      totalPercentage += result.overall.percentage;
      classStats.highestScore = Math.max(classStats.highestScore, result.overall.percentage);
      classStats.lowestScore = Math.min(classStats.lowestScore, result.overall.percentage);
      
      // Subject-wise statistics
      result.subjectResults.forEach(subject => {
        if (!subjectStats[subject.subjectId]) {
          subjectStats[subject.subjectId] = {
            totalMarks: 0,
            totalStudents: 0,
            highest: 0,
            lowest: 100
          };
        }
        
        subjectStats[subject.subjectId].totalMarks += subject.percentage;
        subjectStats[subject.subjectId].totalStudents += 1;
        subjectStats[subject.subjectId].highest = Math.max(
          subjectStats[subject.subjectId].highest, 
          subject.percentage
        );
        subjectStats[subject.subjectId].lowest = Math.min(
          subjectStats[subject.subjectId].lowest, 
          subject.percentage
        );
      });
    });
    
    classStats.averagePercentage = totalPercentage / examResults.length;
    
    // Calculate subject averages
    Object.keys(subjectStats).forEach(subjectId => {
      subjectStats[subjectId].average = 
        subjectStats[subjectId].totalMarks / subjectStats[subjectId].totalStudents;
    });
    
    classStats.subjectWiseStats = subjectStats;
    
    return {
      classStats,
      studentResults: examResults,
      students
    };
  } catch (error) {
    console.error('Error generating class performance report:', error);
    throw error;
  }
}
```

### 3. List Top Performers and At-Risk Students
```javascript
// Get top performers and at-risk students
async function getStudentPerformanceAnalysis(schoolId, classId = null, limit = 10) {
  try {
    let query = db.collection('examResults')
      .where('schoolId', '==', schoolId);
    
    if (classId) {
      query = query.where('classId', '==', classId);
    }
    
    // Get recent exam results
    const examResultsQuery = await query
      .orderBy('createdAt', 'desc')
      .limit(100) // Get recent results
      .get();
    
    const examResults = examResultsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Group by student and calculate average performance
    const studentPerformance = {};
    
    examResults.forEach(result => {
      if (!studentPerformance[result.studentId]) {
        studentPerformance[result.studentId] = {
          studentId: result.studentId,
          totalExams: 0,
          totalPercentage: 0,
          averagePercentage: 0,
          examResults: []
        };
      }
      
      studentPerformance[result.studentId].totalExams += 1;
      studentPerformance[result.studentId].totalPercentage += result.overall.percentage;
      studentPerformance[result.studentId].examResults.push(result);
    });
    
    // Calculate averages
    Object.keys(studentPerformance).forEach(studentId => {
      const student = studentPerformance[studentId];
      student.averagePercentage = student.totalPercentage / student.totalExams;
    });
    
    // Convert to array and sort
    const performanceArray = Object.values(studentPerformance);
    
    // Top performers (highest average)
    const topPerformers = performanceArray
      .sort((a, b) => b.averagePercentage - a.averagePercentage)
      .slice(0, limit);
    
    // At-risk students (lowest average, below 60%)
    const atRiskStudents = performanceArray
      .filter(student => student.averagePercentage < 60)
      .sort((a, b) => a.averagePercentage - b.averagePercentage)
      .slice(0, limit);
    
    // Get student details for top performers and at-risk students
    const allStudentIds = [...topPerformers, ...atRiskStudents].map(s => s.studentId);
    const studentsQuery = await db.collection('students')
      .where('id', 'in', allStudentIds)
      .get();
    const studentsData = {};
    studentsQuery.docs.forEach(doc => {
      studentsData[doc.id] = { id: doc.id, ...doc.data() };
    });
    
    return {
      topPerformers: topPerformers.map(perf => ({
        ...perf,
        studentDetails: studentsData[perf.studentId]
      })),
      atRiskStudents: atRiskStudents.map(perf => ({
        ...perf,
        studentDetails: studentsData[perf.studentId]
      }))
    };
  } catch (error) {
    console.error('Error analyzing student performance:', error);
    throw error;
  }
}
```

### 4. Employee Salary Slip with Leaves, Fines, PF Deductions
```javascript
// Generate employee salary slip
async function generateSalarySlip(employeeId, month, year) {
  try {
    // Get employee details
    const employeeDoc = await db.collection('employees').doc(employeeId).get();
    const employeeData = employeeDoc.data();
    
    // Get user details
    const userDoc = await db.collection('users').doc(employeeData.userId).get();
    const userData = userDoc.data();
    
    // Get leaves for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const leavesQuery = await db.collection('leaves')
      .where('applicantId', '==', employeeData.userId)
      .where('status', '==', 'approved')
      .where('startDate', '>=', startDate.toISOString().split('T')[0])
      .where('endDate', '<=', endDate.toISOString().split('T')[0])
      .get();
    
    const leaves = leavesQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const totalLeaveDays = leaves.reduce((sum, leave) => sum + leave.totalDays, 0);
    
    // Calculate salary components
    const basicSalary = employeeData.employment.salary.basic;
    const allowances = employeeData.employment.salary.allowances;
    const grossSalary = basicSalary + allowances;
    
    // Calculate deductions
    const workingDaysInMonth = 22; // Assuming 22 working days
    const perDayBasic = basicSalary / workingDaysInMonth;
    const leaveDeduction = totalLeaveDays * perDayBasic;
    
    // PF deduction (12% of basic salary)
    const pfDeduction = basicSalary * 0.12;
    
    // Professional tax (example)
    const professionalTax = 200;
    
    // Total deductions
    const totalDeductions = leaveDeduction + pfDeduction + professionalTax;
    
    // Net salary
    const netSalary = grossSalary - totalDeductions;
    
    const salarySlip = {
      employee: {
        id: employeeId,
        name: userData.displayName,
        employeeId: employeeData.employeeId,
        designation: employeeData.designation,
        department: employeeData.department
      },
      period: {
        month,
        year,
        workingDays: workingDaysInMonth,
        leaveDays: totalLeaveDays,
        presentDays: workingDaysInMonth - totalLeaveDays
      },
      earnings: {
        basicSalary,
        allowances,
        grossSalary
      },
      deductions: {
        leaveDeduction,
        pfDeduction,
        professionalTax,
        totalDeductions
      },
      netSalary,
      leaves: leaves,
      generatedAt: new Date().toISOString(),
      generatedBy: 'system'
    };
    
    return salarySlip;
  } catch (error) {
    console.error('Error generating salary slip:', error);
    throw error;
  }
}
```

### 5. Admin Dashboard Analytics
```javascript
// Get comprehensive dashboard analytics
async function getAdminDashboardAnalytics(schoolId) {
  try {
    const analytics = {
      overview: {},
      students: {},
      teachers: {},
      attendance: {},
      academics: {},
      fees: {}
    };
    
    // Overview statistics
    const [studentsSnapshot, teachersSnapshot, employeesSnapshot, classesSnapshot] = await Promise.all([
      db.collection('students').where('schoolId', '==', schoolId).where('isActive', '==', true).get(),
      db.collection('teachers').where('schoolId', '==', schoolId).where('isActive', '==', true).get(),
      db.collection('employees').where('schoolId', '==', schoolId).where('isActive', '==', true).get(),
      db.collection('classes').where('schoolId', '==', schoolId).where('isActive', '==', true).get()
    ]);
    
    analytics.overview = {
      totalStudents: studentsSnapshot.size,
      totalTeachers: teachersSnapshot.size,
      totalEmployees: employeesSnapshot.size,
      totalClasses: classesSnapshot.size
    };
    
    // Student analytics by grade
    const studentsByGrade = {};
    studentsSnapshot.docs.forEach(doc => {
      const student = doc.data();
      const grade = student.academicInfo.grade;
      studentsByGrade[grade] = (studentsByGrade[grade] || 0) + 1;
    });
    analytics.students.byGrade = studentsByGrade;
    
    // Recent attendance statistics (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const attendanceQuery = await db.collection('attendance')
      .where('schoolId', '==', schoolId)
      .where('date', '>=', last7Days.toISOString().split('T')[0])
      .get();
    
    let totalPresent = 0;
    let totalStudentsCount = 0;
    attendanceQuery.docs.forEach(doc => {
      const attendance = doc.data();
      totalPresent += attendance.summary.present;
      totalStudentsCount += attendance.summary.totalStudents;
    });
    
    analytics.attendance = {
      averageAttendance: totalStudentsCount > 0 ? (totalPresent / totalStudentsCount) * 100 : 0,
      last7DaysData: attendanceQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
    
    // Fee collection statistics
    const feesQuery = await db.collection('fees')
      .where('schoolId', '==', schoolId)
      .get();
    
    let totalFeeAmount = 0;
    let totalCollected = 0;
    let totalPending = 0;
    
    feesQuery.docs.forEach(doc => {
      const fee = doc.data();
      totalFeeAmount += fee.summary.totalFee;
      totalCollected += fee.summary.totalPaid;
      totalPending += fee.summary.balance;
    });
    
    analytics.fees = {
      totalFeeAmount,
      totalCollected,
      totalPending,
      collectionPercentage: totalFeeAmount > 0 ? (totalCollected / totalFeeAmount) * 100 : 0
    };
    
    // Recent exam performance
    const recentExamsQuery = await db.collection('exams')
      .where('schoolId', '==', schoolId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    const recentExams = recentExamsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get results for recent exams
    const examPerformance = [];
    for (const exam of recentExams) {
      const resultsQuery = await db.collection('examResults')
        .where('examId', '==', exam.id)
        .get();
      
      const results = resultsQuery.docs.map(doc => doc.data());
      const averagePercentage = results.length > 0 
        ? results.reduce((sum, result) => sum + result.overall.percentage, 0) / results.length 
        : 0;
      
      examPerformance.push({
        examId: exam.id,
        examName: exam.name,
        averagePercentage,
        totalStudents: results.length
      });
    }
    
    analytics.academics = {
      recentExamPerformance: examPerformance
    };
    
    return analytics;
  } catch (error) {
    console.error('Error generating dashboard analytics:', error);
    throw error;
  }
}
```

## Scalability Considerations

### 1. Data Partitioning
- **School-based partitioning**: All data is partitioned by `schoolId` for multi-tenancy
- **Academic year partitioning**: Consider separate collections for different academic years for large schools

### 2. Subcollections for Large Datasets
```javascript
// For schools with many students, consider subcollections
// students/{studentId}/examResults/{resultId}
// students/{studentId}/attendance/{attendanceId}
// students/{studentId}/assignments/{assignmentId}
```

### 3. Aggregation Collections
```javascript
// Pre-computed aggregations for better performance
{
  "id": "class_101_monthly_stats",
  "classId": "class_101",
  "month": "2024-01",
  "stats": {
    "averageAttendance": 92.5,
    "totalStudents": 35,
    "averageGrade": 78.2
  }
}
```

### 4. Caching Strategy
- Use Firebase Functions with Redis for frequently accessed data
- Implement client-side caching for static data (subjects, classes)
- Use Firestore offline persistence for mobile apps

### 5. Future Extensions
- **Library Management**: Add books, issue/return tracking
- **Transport Management**: Bus routes, driver details, GPS tracking
- **Hostel Management**: Room allocation, mess management
- **Alumni Management**: Graduate tracking, events
- **Parent Portal**: Enhanced parent engagement features
- **Online Learning**: Video lectures, online assignments
- **Inventory Management**: School assets, stationery

This schema provides a solid foundation for a comprehensive school management system while maintaining flexibility for future enhancements and scalability requirements.