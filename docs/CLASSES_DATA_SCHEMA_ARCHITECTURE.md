# 📊 Classes Data Schema & Architecture

## 🎯 **Data Architecture Overview**

### **Primary Collection: `classes`**
```javascript
// Document Structure
{
  id: "auto-generated", // Firebase document ID
  name: "Class 12", // String - Class name
  classCode: "CS101", // String - Optional class code
  description: "Advanced Computer Science", // String - Optional description
  schoolId: "/school/hicas_cbe", // Reference - School document path
  teacherId: "user_id", // String - Main teacher user ID
  createdBy: "/users/5KK3TnpijKO2t33vnHtBO5o65dA3", // Reference - Creator
  createdTime: Timestamp, // Firebase timestamp
  updatedAt: Timestamp, // Firebase timestamp
  isActive: true // Boolean - Soft delete flag
}
```

## 🔗 **Related Collections & Relationships**

### **1. Students Collection (`students`)**
```javascript
{
  id: "auto-generated",
  userId: "firebase_user_uid",
  classId: "/classes/class_doc_id", // ← REFERENCE to classes collection
  schoolId: "/school/hicas_cbe",
  name: "John Doe",
  email: "john@example.com",
  isActive: true,
  createdAt: Timestamp
}
```

### **2. Subjects Collection (`subjects`)**
```javascript
{
  id: "auto-generated",
  name: "Mathematics",
  classId: "/classes/class_doc_id", // ← REFERENCE to classes collection
  schoolId: "/school/hicas_cbe",
  teacherId: "user_id",
  description: "Advanced Mathematics",
  createdAt: Timestamp
}
```

### **3. Users Collection (`users`) - Teachers**
```javascript
{
  id: "auto-generated",
  uid: "firebase_user_uid",
  displayName: "Dr. Smith",
  email: "smith@school.com",
  role: "teacher",
  schoolId: "/school/hicas_cbe",
  isActive: true,
  createdAt: Timestamp
}
```

### **4. Schools Collection (`school` or `schools`)**
```javascript
{
  id: "hicas_cbe", // Used as reference key
  name: "HICAS School",
  address: "School Address",
  phone: "123-456-7890",
  createdAt: Timestamp
}
```

## 🔄 **Data Flow Architecture**

### **Query Pattern 1: Get Classes by School**
```javascript
// Primary Query - Get all classes for a school
const classesQuery = query(
  collection(db, "classes"),
  where("schoolId", "==", "/school/hicas_cbe") // ← Direct string match
);

// Alternative with reference
const schoolRef = doc(db, "school", "hicas_cbe");
const classesQuery = query(
  collection(db, "classes"),
  where("schoolId", "==", schoolRef) // ← Document reference
);
```

### **Query Pattern 2: Get Students in Class**
```javascript
// Get all students in a specific class
const studentsQuery = query(
  collection(db, "students"),
  where("classId", "==", "/classes/class_doc_id"), // ← Class reference
  where("isActive", "==", true)
);
```

### **Query Pattern 3: Get Subjects for Class**
```javascript
// Get all subjects taught in a class
const subjectsQuery = query(
  collection(db, "subjects"),
  where("classId", "==", "/classes/class_doc_id"), // ← Class reference
  where("schoolId", "==", "/school/hicas_cbe")
);
```

### **Query Pattern 4: Get Teacher Information**
```javascript
// Get teacher details by user ID
const teacherDoc = await getDoc(doc(db, "users", teacherId));

// Alternative: Get all teachers for a school
const teachersQuery = query(
  collection(db, "users"),
  where("role", "==", "teacher"),
  where("schoolId", "==", "/school/hicas_cbe"),
  where("isActive", "==", true)
);
```

## 📋 **Complete Data Fetching Architecture**

### **Step 1: Fetch Classes**
```javascript
const classesSnapshot = await getDocs(classesQuery);
const classes = classesSnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### **Step 2: Enhance with Related Data (Parallel)**
```javascript
const enhancedClasses = await Promise.all(
  classes.map(async (classItem) => {
    // Parallel queries for each class
    const [studentsSnapshot, subjectsSnapshot] = await Promise.all([
      // Query students
      getDocs(query(
        collection(db, "students"),
        where("classId", "==", `/classes/${classItem.id}`),
        where("isActive", "==", true)
      )),
      // Query subjects
      getDocs(query(
        collection(db, "subjects"),
        where("classId", "==", `/classes/${classItem.id}`)
      ))
    ]);

    // Get teacher info if exists
    let teacherName = "Not Assigned";
    if (classItem.teacherId) {
      const teacherDoc = await getDoc(doc(db, "users", classItem.teacherId));
      if (teacherDoc.exists()) {
        teacherName = teacherDoc.data().displayName || "Unknown Teacher";
      }
    }

    return {
      ...classItem,
      studentCount: studentsSnapshot.size,
      subjectCount: subjectsSnapshot.size,
      teacherName
    };
  })
);
```

## 🗂️ **Data Relationships Diagram**

```
┌─────────────────┐
│    SCHOOL       │
│  id: hicas_cbe  │
└─────────┬───────┘
          │ schoolId = "/school/hicas_cbe"
          ▼
┌─────────────────┐
│    CLASSES      │
│  - name         │
│  - teacherId    │
│  - schoolId     │
└─────────┬───────┘
          │ classId = "/classes/{id}"
          ├─────────────────────┐
          │                     │
          ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│   STUDENTS      │   │   SUBJECTS      │
│  - userId       │   │  - name         │
│  - classId      │   │  - teacherId    │
│  - schoolId     │   │  - classId      │
└─────────────────┘   └─────────────────┘
          │                     │
          │ teacherId           │ teacherId
          ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│    USERS        │   │    USERS        │
│  (Students)     │   │  (Teachers)     │
│  - uid          │   │  - uid          │
│  - displayName  │   │  - displayName  │
└─────────────────┘   └─────────────────┘
```

## 🔑 **Key Data Relationships**

### **Foreign Key Patterns:**
1. **Classes → School:** `schoolId: "/school/{school_id}"`
2. **Students → Class:** `classId: "/classes/{class_id}"`
3. **Students → School:** `schoolId: "/school/{school_id}"`
4. **Subjects → Class:** `classId: "/classes/{class_id}"`
5. **Subjects → School:** `schoolId: "/school/{school_id}"`
6. **Classes → Teacher:** `teacherId: "{user_id}"` (direct user ID)
7. **Users → School:** `schoolId: "/school/{school_id}"`

### **Reference Types:**
- **Document References:** `/collection/documentId` format
- **Direct IDs:** Simple string IDs for users
- **Mixed Patterns:** Some use references, others use direct strings

## ⚡ **Query Optimization Strategies**

### **1. Compound Queries (Limited)**
```javascript
// ❌ Firestore doesn't support this
where("schoolId", "==", "/school/hicas_cbe")
where("isActive", "==", true) // Can't combine with different fields
```

### **2. Parallel Data Fetching**
```javascript
// ✅ Fetch related data in parallel
await Promise.all([
  getDocs(studentsQuery),
  getDocs(subjectsQuery),
  getDoc(teacherDoc)
]);
```

### **3. Client-Side Filtering**
```javascript
// ✅ Filter on client after fetching
const activeClasses = classes.filter(cls => cls.isActive !== false);
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: schoolId Format Mismatch**
**Problem:** Different schools use different formats
**Solution:** Multiple query attempts with fallbacks

### **Issue 2: Reference vs String Queries**
**Problem:** Some data uses references, others use strings
**Solution:** Try both query types with error handling

### **Issue 3: Missing Related Data**
**Problem:** Student/subject counts might be missing
**Solution:** Graceful fallbacks with default values

### **Issue 4: Large Datasets**
**Problem:** Too many classes to fetch at once
**Solution:** Implement pagination or limit queries

## 📊 **Data Integrity Rules**

### **Required Fields:**
- `classes.name` - Must exist
- `classes.schoolId` - Must exist for filtering
- `students.classId` - Must reference valid class
- `subjects.classId` - Must reference valid class

### **Optional Fields:**
- `classes.classCode` - Display only
- `classes.description` - Display only
- `classes.teacherId` - May be null
- `classes.isActive` - Defaults to true

## 🔧 **Implementation Notes**

### **Working Query (from School Management):**
```javascript
// This works reliably
where("schoolId", "==", doc(db, "school", schoolId))
```

### **Alternative Query (Assessment Dashboard):**
```javascript
// More complex but handles edge cases
where("schoolId", "==", `/school/${schoolId}`)
```

### **Student Count Query:**
```javascript
// Reliable pattern
where("classId", "==", doc(db, "classes", classId))
where("isActive", "==", true)
```

### **Subject Count Query:**
```javascript
// Simple pattern
where("classId", "==", doc(db, "classes", classId))
```

This data architecture provides a **complete blueprint** for implementing reliable class fetching with proper relationships and error handling! 🎯

---

**Document Version:** 1.0  
**Focus:** Data Schema & Architecture  
**Created:** August 29, 2025  
**Author:** Cascade AI Assistant
