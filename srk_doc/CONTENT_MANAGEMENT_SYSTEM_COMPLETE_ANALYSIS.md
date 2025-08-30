# Content Management System - Complete Technical Analysis
*Generated: 2025-08-29*

## Executive Summary
This document provides a comprehensive technical analysis of the Content Management System, covering architecture, user flows, Firebase field usage, and implementation details for each page and functionality.

---

# Complete Content Management System Analysis

## Overview
The content-management system is a comprehensive educational content platform with two main sections: **School Content Management** (for uploading and managing custom content) and **CLASSA Content** (pre-built educational resources). Here's the complete breakdown:

## Architecture & Directory Structure

```
content-management/
├── page.tsx (Main Dashboard)
├── components/
│   └── ContentSidebar.tsx (Navigation)
├── manage-school-content/
│   ├── page.tsx (School Content Landing)
│   ├── notes-management/
│   │   └── page.tsx (Notes Upload & Management)
│   └── video-management/
│       └── page.tsx (Video Upload & Management)
└── edueron-content/
    ├── page.tsx (CLASSA Content Browser)
    ├── lesson-list/
    │   └── page.tsx (Lessons within Chapter)
    └── lesson-details/
        └── page.tsx (Interactive Lesson Viewer)
```

## User Flow & Navigation

### Main Entry Points
1. **Dashboard** (`/content-management`) - Central hub with two main paths
2. **School Content** - Custom uploads by school administrators
3. **CLASSA Content** - Pre-built curriculum content

### Navigation Flow
```
Dashboard → [School Content | CLASSA Content]
                ↓
School Content → [Notes Management | Video Management]
                ↓
Notes/Video → Upload Modal → Content List → Filters

CLASSA Content → Subjects → Chapters → Lessons → Lesson Details
```

## Detailed Screen Analysis

### 1. Main Dashboard (`page.tsx`)
**Purpose**: Entry point for content management
**Features**:
- Two main action cards: "Manage School Content" and "View CLASSA Content"
- Clean, modern UI with gradient backgrounds and glass morphism effects
- Navigation to school content or CLASSA content sections

**UI Components**:
- Sidebar navigation (ContentSidebar component)
- Two gradient cards with hover animations
- Responsive grid layout (1 column mobile, 2 columns desktop)

### 2. Content Sidebar (`components/ContentSidebar.tsx`)
**Purpose**: Consistent navigation across all pages
**Features**:
- Logo display (CLASSA logo)
- Four navigation items: Dashboard, Manage School Content, CLASSA Content, Help Center
- Active state highlighting with blue theme
- Logout button

### 3. School Content Landing (`manage-school-content/page.tsx`)
**Purpose**: Gateway to upload different content types
**Features**:
- Two content type cards: Notes and Videos
- Upload statistics display
- Direct navigation to specific management sections

## Upload Systems Analysis

### 4. Notes Management System (`notes-management/page.tsx`)

#### Upload Form Details
**File Types Supported**:
- `application/pdf` (.pdf files)
- `.doc` (Microsoft Word)
- `.docx` (Microsoft Word OpenXML)

**Form Fields**:
1. **File Upload Area**
   - Drag & drop interface
   - Click to browse
   - File size validation (implied through Firebase limits)
   - Real-time file name display

2. **Class Selection**
   - Dropdown populated from user's school classes
   - Filtered by user's school ID
   - Cascading subject filter

3. **Subject Selection**
   - Dependent dropdown (activates after class selection)
   - Filtered by selected class
   - Uses Firestore queries with class references

4. **Title Field**
   - Text input with auto-capitalization
   - Character limit (implied)
   - Real-time formatting (first letter uppercase)

5. **Description Field**
   - Textarea with auto-capitalization
   - Multi-line support
   - Rich text formatting ready

#### Validation Rules
- All fields required (title, description, class, subject, file)
- File must be selected
- Class and subject must be valid selections
- Form prevents submission with incomplete data

#### Upload Process
1. File validation on frontend
2. Firebase Storage upload to `/notes/{userId}/{timestamp}_{filename}`
3. Firestore document creation in `contents` collection
4. Metadata storage (title, description, classId, subjectId, schoolID, video: false)
5. Automatic refresh of content list

#### Content Management Features
- **Filtering**: By class and subject (cascading dropdowns)
- **Search**: Real-time filtering of notes list
- **Download**: Direct download links
- **Delete**: Confirmation dialog with delete functionality
- **Statistics**: Total notes count display

### 5. Video Management System (`video-management/page.tsx`)

#### Upload Form Details
**File Types Supported**:
- `video/*` (all video formats)
- YouTube URL support (alternative to file upload)

**Form Fields**:
1. **File Upload Area**
   - Drag & drop interface
   - Click to browse
   - Video file validation
   - File name display

2. **YouTube URL Field**
   - Text input for YouTube URLs
   - Pattern validation for YouTube format
   - Alternative to file upload

3. **Class & Subject Selection**
   - Same cascading dropdowns as notes
   - School-filtered classes and subjects

4. **Title Field**
   - Auto-capitalization
   - First letter uppercase formatting

5. **Description Field**
   - Multi-line textarea
   - Auto-capitalization

#### Upload Logic
- **Dual Upload Options**: File upload OR YouTube URL (not both)
- **File Upload**: Firebase Storage to `/videos/{userId}/{timestamp}_{filename}`
- **YouTube Integration**: Direct URL storage (no file upload)
- **Validation**: Either file OR YouTube URL must be provided

#### Content Features
- **Video Playback**: Direct links to videos/YouTube
- **Filtering**: Same class/subject filtering as notes
- **Management**: Download/delete functionality
- **Statistics**: Total videos count

## CLASSA Content System (Pre-built Curriculum)

### 6. CLASSA Content Browser (`edueron-content/page.tsx`)
**Purpose**: Browse pre-built educational content
**Features**:
- Subject selection (horizontal scrollable cards)
- Chapter display (grid layout)
- Topic listings within chapters
- Navigation to lesson lists

**Content Structure**:
```
Subjects → Chapters → Topics → Lessons → Lesson Details
```

**Supported Subjects**:
- Physics (11th & 12th)
- Chemistry (11th & 12th)
- Biology (11th & 12th)
- Sorted by grade and alphabetically

### 7. Lesson List (`lesson-list/page.tsx`)
**Purpose**: Display lessons within a selected chapter
**Features**:
- Grid layout of lesson cards
- Lesson icons/images
- Click navigation to lesson details
- Loading states and empty states

### 8. Interactive Lesson Viewer (`lesson-details/page.tsx`)

#### Main Features
**Card-Based Navigation**:
- 7 interactive learning tools in a rotating card stack
- Smooth animations and transitions
- Click-to-navigate interface

#### Learning Tools Available:

1. **Short Notes**
   - Content: HTML-formatted notes
   - Display: Full-screen iframe
   - Source: Firestore `shortNotes` collection

2. **Concept Summary**
   - Content: Explanatory content
   - Display: Full-screen iframe
   - Source: Firestore `conceptSummary` collection

3. **View Glossary**
   - Content: Term definitions
   - Display: Full-screen iframe
   - Source: Firestore `glossary` collection

4. **View Mnemonics**
   - Content: Memory aids
   - Display: Full-screen iframe
   - Source: Firestore `mnemonics` collection

5. **Flash Cards**
   - Interactive card flipping
   - Front/back content display
   - Navigation between cards
   - Source: Firestore `flashCards` collection

6. **Mind Maps**
   - Visual concept mapping
   - HTML content rendering
   - Full-screen display
   - Source: Firestore `mindmaps` collection

7. **Question Bank**
   - Interactive quiz interface
   - Multiple choice questions
   - LaTeX mathematical rendering
   - Answer validation with feedback
   - Detailed explanations
   - Progress tracking

#### Question Bank Features
**Question Structure**:
- Question text (with LaTeX support)
- 4 multiple choice options (A, B, C, D)
- Correct answer tracking
- Explanation text
- Solution steps
- Optional question image
- Mistake categorization (silly, conceptual, minor mistakes)

**Interactive Elements**:
- Option selection with visual feedback
- Correct/wrong answer animations
- Explanation reveal system
- Navigation between questions
- Progress indicator

## Technical Implementation Details

### Database Structure
**Firestore Collections**:
- `contents` - Uploaded notes/videos (video: boolean flag)
- `classes` - School classes with schoolId reference
- `subjects` - Subjects linked to classes
- `chapters` - CLASSA curriculum chapters
- `lessons` - Individual lessons
- `shortNotes`, `conceptSummary`, `glossary`, `mnemonics` - Lesson content
- `flashCards`, `mindmaps` - Interactive content
- `questionCollection` - Quiz questions

### File Storage
**Firebase Storage Structure**:
```
notes/{userId}/{timestamp}_{filename}
videos/{userId}/{timestamp}_{filename}
```

### Authentication & Security
- Firebase Auth integration
- School-based content isolation (schoolID filtering)
- User permission validation
- File upload restrictions by type

### UI/UX Features
- **Responsive Design**: Mobile-first approach
- **Animations**: Smooth transitions and hover effects
- **Glass Morphism**: Backdrop blur effects
- **Loading States**: Spinners and skeleton screens
- **Error Handling**: User-friendly error messages
- **Accessibility**: ARIA labels and keyboard navigation

### Performance Optimizations
- Lazy loading of content
- Efficient Firestore queries with proper indexing
- Client-side caching
- Image optimization
- Hydration-safe rendering

## Data Flow & User Permissions

### Content Isolation
- Each school only sees their own uploaded content
- CLASSA content is shared across all schools
- User authentication required for all operations
- School ID used for content filtering

### Upload Permissions
- Only authenticated users can upload
- Content automatically tagged with user's school ID
- Class/subject validation against user's school

---

# Firebase Fields Usage by Page/Screen & Functionality

## 1. **Main Dashboard** (`page.tsx`)
**No direct Firebase usage** - Pure navigation page

## 2. **Content Sidebar** (`components/ContentSidebar.tsx`)
**No direct Firebase usage** - Navigation component only

## 3. **School Content Landing** (`manage-school-content/page.tsx`)
**No direct Firebase usage** - Static landing page

---

## **Notes Management System** (`notes-management/page.tsx`)

### **Authentication & User Context**
- **Collection**: `users`
- **Fields Used**:
  - `schoolId` - To filter classes by user's school
  - `uid` - For file storage paths

### **Classes Data**
- **Collection**: `classes`
- **Fields Used**:
  - `schoolId` - Filter classes by user's school
  - `name` - Display class names in dropdown
  - `id` - Document ID for references

### **Subjects Data**
- **Collection**: `subjects`
- **Fields Used**:
  - `assClass` - Array of class references
  - `name` - Display subject names
  - `id` - Document ID for references

### **Content Upload (Written to Firestore)**
- **Collection**: `contents`
- **Fields Written**:
  - `title` - User input title
  - `description` - User input description
  - `url` - Firebase Storage download URL
  - `createdBy` - Reference to user document
  - `createdAt` - Server timestamp
  - `classId` - Reference to selected class
  - `subjectId` - Reference to selected subject
  - `schoolID` - User's school ID
  - `video` - Always `false` for notes

### **Content Display (Read from Firestore)**
- **Collection**: `contents`
- **Fields Read**:
  - `title` - Display in list
  - `description` - Display in list
  - `url` - For download links
  - `classId` - For class name resolution
  - `subjectId` - For subject name resolution
  - `createdAt` - For date display
  - `schoolID` - For filtering

---

## **Video Management System** (`video-management/page.tsx`)

### **Same Authentication & Classes/Subjects Fields as Notes**
*(See Notes Management above)*

### **Content Upload (Written to Firestore)**
- **Collection**: `contents`
- **Fields Written**:
  - `title` - User input title
  - `description` - User input description
  - `url` - Firebase Storage URL or YouTube URL
  - `createdBy` - Reference to user document
  - `createdAt` - Server timestamp
  - `classId` - Reference to selected class
  - `subjectId` - Reference to selected subject
  - `schoolID` - User's school ID
  - `video` - Always `true` for videos

### **Content Display (Read from Firestore)**
- **Same fields as Notes Management above**

---

## **CLASSA Content Browser** (`edueron-content/page.tsx`)

### **Subjects Data**
- **Collection**: `subjects`
- **Query**: `where("sp", "==", true)` - Special curriculum subjects
- **Fields Used**:
  - `name` - Subject name (with "th" suffix removed)
  - `description` - Subject description
  - `image` - Subject icon/image
  - `id` - Document ID for reference

### **Chapters Data**
- **Collection**: `chapters`
- **Query**: `where("subjectID", "==", subjectRef)`
- **Fields Used**:
  - `name` - Chapter title
  - `topics` - Array of topic strings
  - `image` - Chapter icon/image
  - `number` - Chapter number for sorting

---

## **Lesson List** (`lesson-list/page.tsx`)

### **Lessons Data**
- **Collection**: `lessons`
- **Query**: `where("chapterID", "==", chapterRef)`
- **Fields Used**:
  - `name` or `title` - Lesson name
  - `image` or `coverImg` or `icon` - Lesson icon
  - `id` - Document ID for navigation

---

## **Interactive Lesson Viewer** (`lesson-details/page.tsx`)

### **Short Notes Content**
- **Collection**: `shortNotes`
- **Query**: `where("lessonID", "==", lessonRef)`
- **Fields Used**:
  - `notes` - HTML content for display

### **Concept Summary Content**
- **Collection**: `conceptSummary`
- **Query**: `where("lessonID", "==", lessonRef)`
- **Fields Used**:
  - `explanation` - HTML content for display

### **Glossary Content**
- **Collection**: `glossary`
- **Query**: `where("lessonID", "==", lessonRef)`
- **Fields Used**:
  - `content` - HTML content for display

### **Mnemonics Content**
- **Collection**: `mnemonics`
- **Query**: `where("lessonID", "==", lessonRef)`
- **Fields Used**:
  - `concent` - HTML content for display

### **Flash Cards Content**
- **Collection**: `flashCards`
- **Query**: `where("lessonID", "==", lessonRef)`
- **Fields Used**:
  - `front` or `term` or `title` or `question` or `word` or `faceA` or `cardFront` or `heading` or `name` - Front content
  - `back` or `definition` or `answer` or `explanation` or `content` or `details` or `faceB` or `cardBack` or `description` - Back content
  - `image` or `imageUrl` or `img` - Optional image

### **Mind Maps Content**
- **Collection**: `mindmaps`
- **Query**: `where("lessonID", "==", lessonRef)`
- **Fields Used**:
  - `content` - HTML content for display

### **Question Bank Content**
- **Collection**: `questionCollection`
- **Query**: `where("lessonID", "==", lessonRef)`
- **Fields Used**:
  - `questionText` - Question content
  - `optionA`, `optionB`, `optionC`, `optionD` - Multiple choice options
  - `correct` - Correct answer text
  - `explanation` - Answer explanation
  - `solution` - Step-by-step solution
  - `qlmg` - Optional question image
  - `sillyOption`, `conceptualOption`, `minorOption` - Mistake options
  - `sillyReason`, `conceptualReason`, `minorReason` - Mistake explanations

---

## **Firebase Storage Structure**

### **File Upload Paths**
```
notes/{userId}/{timestamp}_{filename}
videos/{userId}/{timestamp}_{filename}
```

### **Content Types**
- **Notes**: PDF, DOC, DOCX files
- **Videos**: All video formats + YouTube URLs
- **Images**: Lesson icons, subject icons, question images

---

## **Authentication & Security Fields**

### **User Authentication**
- **Firebase Auth**: `auth.currentUser`
- **Fields**: `uid`, `email`, user profile data

### **School-Based Security**
- **Field**: `schoolId` - Used in all queries for content isolation
- **Purpose**: Ensures users only see content from their school

### **Permission Validation**
- **Class Access**: Filtered by `schoolId` in classes collection
- **Subject Access**: Filtered by class references (`assClass` array)
- **Content Access**: Filtered by `schoolID` in contents collection

---

## **System Architecture Summary**

### **Frontend Technologies**
- Next.js with TypeScript
- React with hooks
- Tailwind CSS for styling
- FontAwesome for icons
- KaTeX for mathematical rendering

### **Backend Technologies**
- Firebase Firestore (NoSQL database)
- Firebase Storage (File storage)
- Firebase Authentication (User management)

### **Key Features**
- **Content Isolation**: School-based data separation
- **Dual Content Types**: School uploads + Pre-built curriculum
- **Interactive Learning**: 7 different learning tools
- **File Management**: Support for documents, videos, and multimedia
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Mobile-first approach

### **Security Measures**
- Authentication required for all operations
- School-based content filtering
- File type validation
- User permission validation
- Secure file storage with Firebase

---

*This document provides the complete technical specification for the Content Management System, including all Firebase field mappings, user flows, and implementation details.*
