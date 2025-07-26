# Diary System Backend Structure (Simple Daily Diary)

## Overview

The diary system now supports only a simple daily note for each user. All previous features related to homework, remarks, priority, schedule, tags, visibility, follow-up, and attachments have been removed.

## Collection Structure

### Diary Entries Collection (`diary_entries`)

```javascript
{
  id: "diary_123",
  note: "Today we completed Chapter 3 and assigned homework.",
  userId: "abc123",         // UID of the teacher/user who created the entry
  schoolId: "myschool_001", // School identifier
  createdAt: "2024-01-10T09:00:00Z" // Firestore server timestamp
}
```

## Field Types

| Field     | Type      | Description                           |
| --------- | --------- | ------------------------------------- |
| note      | string    | The diary note/remark                 |
| userId    | string    | UID of the user who created the entry |
| schoolId  | string    | School identifier                     |
| createdAt | timestamp | When the entry was created            |

## Example Firestore Query

```js
// To get all diary entries for a school, ordered by date:
db.collection("diary_entries")
  .where("schoolId", "==", "myschool_001")
  .orderBy("createdAt", "desc");
```

## Security Rules (Firestore)

```javascript
match /diary_entries/{entryId} {
  allow read: if isAuthenticated() && belongsToSameSchool(resource.data.schoolId);
  allow write: if isAuthenticated() && belongsToSameSchool(request.resource.data.schoolId);
}
```
