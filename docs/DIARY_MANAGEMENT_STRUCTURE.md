# Diary Management Structure

## Overview

The diary management system has been simplified to focus on daily teaching notes and observations. This system allows teachers to record their daily notes for specific classes and subjects.

## Database Structure

### Collection: `diary_entries`

Each diary entry document contains the following fields:

```typescript
interface DiaryEntry {
  id: string; // Auto-generated document ID
  content: string; // The daily notes content (required)
  classId: DocumentReference; // Reference to the class document
  subjectId: DocumentReference; // Reference to the subject document
  schoolId: DocumentReference; // Reference to the school document
  createdBy: DocumentReference; // Reference to the user who created the entry
  attachments?: Array<{
    // Optional file attachments
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  createdAt: Timestamp; // When the entry was created
  updatedAt?: Timestamp; // When the entry was last updated (optional)
}
```

## Field Details

### Required Fields

- **`content`**: The main text content of the daily notes (10-2000 characters)
- **`classId`**: DocumentReference to the class this entry is for
- **`subjectId`**: DocumentReference to the subject this entry is for
- **`schoolId`**: DocumentReference to the school
- **`createdBy`**: DocumentReference to the user who created the entry
- **`createdAt`**: Timestamp when the entry was created

### Optional Fields

- **`attachments`**: Array of file attachments (max 5MB per file)
- **`updatedAt`**: Timestamp when the entry was last updated

## File Storage

Attachments are stored in Firebase Storage under the path:

```
diary/daily/{schoolId}/{timestamp}_{filename}
```

Supported file types:

- PDF files
- Word documents (.doc, .docx)
- Text files (.txt)
- Images (.jpg, .jpeg, .png, .gif)

Maximum file size: 5MB per file

## Usage Examples

### Creating a New Diary Entry

```typescript
const entryData = {
  classId: doc(db, "classes", "classId"),
  subjectId: doc(db, "subjects", "subjectId"),
  schoolId: doc(db, "school", "schoolId"),
  createdBy: doc(db, "users", "userId"),
  content: "Today we covered Chapter 5 in Mathematics...",
  attachments: [], // Optional
  createdAt: serverTimestamp(),
};

await addDoc(collection(db, "diary_entries"), entryData);
```

### Fetching Diary Entries for a School

```typescript
const diaryQuery = query(
  collection(db, "diary_entries"),
  where("schoolId", "==", doc(db, "school", schoolId))
);
const diarySnapshot = await getDocs(diaryQuery);
```

### Updating a Diary Entry

```typescript
await updateDoc(doc(db, "diary_entries", entryId), {
  content: "Updated content...",
  updatedAt: serverTimestamp(),
});
```

## UI Features

### Form Components

1. **Class & Subject Selection**: Dropdown menus to select class and subject
2. **Content Textarea**: Large text area for daily notes (8 rows)
3. **File Upload**: Optional file attachment with drag-and-drop support
4. **Validation**: Real-time validation for required fields and content length

### Display Components

1. **Entry Cards**: Grid layout showing diary entries
2. **Search**: Text search across content, class, subject, and creator
3. **Statistics**: Total entries and today's entries count
4. **Actions**: Edit and delete buttons for each entry

## Validation Rules

- **Content**: Required, 10-2000 characters
- **Class**: Required selection
- **Subject**: Required selection
- **File Size**: Maximum 5MB per file
- **File Types**: PDF, Word, Text, or Image files only

## Security Considerations

- Users can only view/edit diary entries for their school
- File uploads are restricted by size and type
- All operations require proper authentication

## Migration from Previous System

The previous diary system had separate collections for `homeworks` and `remarks` with complex features like:

- Priority levels
- Due dates
- Student-specific remarks
- Tags and categories
- Visibility settings
- Follow-up requirements

The new system simplifies this to focus on daily teaching notes with:

- Single collection (`diary_entries`)
- Simple content field
- Class and subject associations
- Optional file attachments
- Basic search and filtering

## Benefits of Simplified Structure

1. **Easier to Use**: Teachers can quickly record daily notes without complex configuration
2. **Better Performance**: Simpler queries and data structure
3. **Focused Purpose**: Specifically designed for daily teaching notes
4. **Reduced Complexity**: No need to manage multiple entry types or complex metadata
5. **Better Search**: Simple text search across all content

## Future Enhancements

Potential features that could be added:

- Date-based filtering
- Export functionality
- Template system for common note types
- Integration with lesson plans
- Collaborative notes for team teaching
