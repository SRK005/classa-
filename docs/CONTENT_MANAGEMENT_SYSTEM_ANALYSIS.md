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
{{ ... }}
- Each school only sees their own uploaded content
- CLASSA content is shared across all schools
- User authentication required for all operations
- School ID used for content filtering

### Upload Permissions
