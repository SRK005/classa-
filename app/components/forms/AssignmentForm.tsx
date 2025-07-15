"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebaseClient";
import { useAuth } from "../../contexts/AuthContext";
import FormCard from "../shared/FormCard";
import Input from "../shared/Input";
import Select from "../shared/Select";
import Button from "../shared/Button";
import LoadingSpinner from "../shared/LoadingSpinner";

interface AssignmentFormProps {
  assignmentId?: string;
  initialData?: {
    topic: string;
    description: string;
    classId: string;
    subjectId: string;
    chapterId: string;
    lessonId: string;
    attachmentUrl?: string;
    attachmentName?: string;
    startDate: any;
    endDate: any;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Option {
  value: string;
  label: string;
}

export default function AssignmentForm({ assignmentId, initialData, onSuccess, onCancel }: AssignmentFormProps) {
  const { user, schoolId } = useAuth();
  const [formData, setFormData] = useState({
    topic: initialData?.topic || "",
    description: initialData?.description || "",
    classId: initialData?.classId || "",
    subjectId: initialData?.subjectId || "",
    chapterId: initialData?.chapterId || "",
    lessonId: initialData?.lessonId || "",
    attachmentUrl: initialData?.attachmentUrl || "",
    attachmentName: initialData?.attachmentName || "",
    startDate: initialData?.startDate ? 
      (initialData.startDate.toDate ? initialData.startDate.toDate().toISOString().split('T')[0] : "") : "",
    endDate: initialData?.endDate ? 
      (initialData.endDate.toDate ? initialData.endDate.toDate().toISOString().split('T')[0] : "") : "",
  });
  
  const [classes, setClasses] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [chapters, setChapters] = useState<Option[]>([]);
  const [lessons, setLessons] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (schoolId) {
      fetchClasses();
    }
  }, [schoolId]);

  useEffect(() => {
    if (formData.classId) {
      fetchSubjectsForClass(formData.classId);
    } else {
      setSubjects([]);
      setChapters([]);
      setLessons([]);
      setFormData(prev => ({ ...prev, subjectId: "", chapterId: "", lessonId: "" }));
    }
  }, [formData.classId]);

  useEffect(() => {
    if (formData.subjectId) {
      fetchChaptersForSubject(formData.subjectId);
    } else {
      setChapters([]);
      setLessons([]);
      setFormData(prev => ({ ...prev, chapterId: "", lessonId: "" }));
    }
  }, [formData.subjectId]);

  useEffect(() => {
    if (formData.chapterId) {
      fetchLessonsForChapter(formData.chapterId);
    } else {
      setLessons([]);
      setFormData(prev => ({ ...prev, lessonId: "" }));
    }
  }, [formData.chapterId]);

  const fetchClasses = async () => {
    if (!schoolId) return;
    
    setLoadingData(true);
    try {
      const classesQuery = query(
        collection(db, "classes"),
        where("schoolId", "==", doc(db, "school", schoolId))
      );
      const classesSnapshot = await getDocs(classesQuery);
      
      const classOptions: Option[] = classesSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().name
      }));
      
      setClasses(classOptions);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setErrors({ classes: "Failed to load classes" });
    } finally {
      setLoadingData(false);
    }
  };

  const fetchSubjectsForClass = async (classId: string) => {
    if (!schoolId || !classId) return;
    
    try {
      const subjectsQuery = query(
        collection(db, "subjects"),
        where("schoolId", "==", doc(db, "school", schoolId)),
        where("assClass", "array-contains", doc(db, "classes", classId))
      );
      const subjectsSnapshot = await getDocs(subjectsQuery);
      
      const subjectOptions: Option[] = subjectsSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().name
      }));
      
      setSubjects(subjectOptions);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setErrors({ subjects: "Failed to load subjects for this class" });
    }
  };

  const fetchChaptersForSubject = async (subjectId: string) => {
    if (!schoolId || !subjectId) return;
    
    try {
      const chaptersQuery = query(
        collection(db, "chapters"),
        where("schoolId", "==", doc(db, "school", schoolId)),
        where("subjectId", "==", doc(db, "subjects", subjectId))
      );
      const chaptersSnapshot = await getDocs(chaptersQuery);
      
      const chapterOptions: Option[] = chaptersSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().name
      }));
      
      setChapters(chapterOptions);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setErrors({ chapters: "Failed to load chapters for this subject" });
    }
  };

  const fetchLessonsForChapter = async (chapterId: string) => {
    if (!schoolId || !chapterId) return;
    
    try {
      const lessonsQuery = query(
        collection(db, "lessons"),
        where("schoolId", "==", doc(db, "school", schoolId)),
        where("chapterId", "==", doc(db, "chapters", chapterId))
      );
      const lessonsSnapshot = await getDocs(lessonsQuery);
      
      const lessonOptions: Option[] = lessonsSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().name
      }));
      
      setLessons(lessonOptions);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setErrors({ lessons: "Failed to load lessons for this chapter" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.topic.trim()) {
      newErrors.topic = "Assignment topic is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Assignment description is required";
    }

    if (!formData.classId) {
      newErrors.classId = "Class is required";
    }

    if (!formData.subjectId) {
      newErrors.subjectId = "Subject is required";
    }

    if (!formData.chapterId) {
      newErrors.chapterId = "Chapter is required";
    }

    if (!formData.lessonId) {
      newErrors.lessonId = "Lesson is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    if (!schoolId) {
      newErrors.school = "School ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const assignmentData = {
        topic: formData.topic.trim(),
        description: formData.description.trim(),
        classId: doc(db, "classes", formData.classId),
        subjectId: doc(db, "subjects", formData.subjectId),
        chapterId: doc(db, "chapters", formData.chapterId),
        lessonId: doc(db, "lessons", formData.lessonId),
        attachmentUrl: formData.attachmentUrl.trim() || null,
        attachmentName: formData.attachmentName.trim() || null,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        schoolId: doc(db, "school", schoolId!),
        createdBy: doc(db, "users", user!.uid),
        ...(assignmentId 
          ? { updatedAt: serverTimestamp() }
          : { createdAt: serverTimestamp() }
        ),
      };

      if (assignmentId) {
        await updateDoc(doc(db, "assignments", assignmentId), assignmentData);
      } else {
        await addDoc(collection(db, "assignments"), assignmentData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving assignment:", error);
      setErrors({ submit: "Failed to save assignment. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title={assignmentId ? "Edit Assignment" : "Create New Assignment"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Assignment Topic"
          type="text"
          value={formData.topic}
          onChange={(value) => setFormData(prev => ({ ...prev, topic: value }))}
          placeholder="Enter assignment topic"
          required
          error={errors.topic}
        />

        <Input
          label="Description"
          type="textarea"
          value={formData.description}
          onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="Enter assignment description"
          rows={4}
          required
          error={errors.description}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Class"
            options={classes}
            value={formData.classId}
            onChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}
            placeholder="Select a class"
            required
            disabled={loadingData}
            error={errors.classId}
          />

          <Select
            label="Subject"
            options={subjects}
            value={formData.subjectId}
            onChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
            placeholder="Select a subject"
            required
            disabled={!formData.classId}
            error={errors.subjectId}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Chapter"
            options={chapters}
            value={formData.chapterId}
            onChange={(value) => setFormData(prev => ({ ...prev, chapterId: value }))}
            placeholder="Select a chapter"
            required
            disabled={!formData.subjectId}
            error={errors.chapterId}
          />

          <Select
            label="Lesson"
            options={lessons}
            value={formData.lessonId}
            onChange={(value) => setFormData(prev => ({ ...prev, lessonId: value }))}
            placeholder="Select a lesson"
            required
            disabled={!formData.chapterId}
            error={errors.lessonId}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(value) => setFormData(prev => ({ ...prev, startDate: value }))}
            required
            error={errors.startDate}
          />

          <Input
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(value) => setFormData(prev => ({ ...prev, endDate: value }))}
            required
            error={errors.endDate}
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attachment (Optional)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Attachment URL"
              type="text"
              value={formData.attachmentUrl}
              onChange={(value) => setFormData(prev => ({ ...prev, attachmentUrl: value }))}
              placeholder="Enter attachment URL"
              error={errors.attachmentUrl}
            />

            <Input
              label="Attachment Name"
              type="text"
              value={formData.attachmentName}
              onChange={(value) => setFormData(prev => ({ ...prev, attachmentName: value }))}
              placeholder="Enter attachment name"
              error={errors.attachmentName}
            />
          </div>
        </div>

        {errors.submit && (
          <div className="text-red-600 text-sm">{errors.submit}</div>
        )}

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            loading={loading}
            disabled={loading || loadingData}
            className="flex-1"
          >
            {loading ? <LoadingSpinner size="small" /> : null}
            {assignmentId ? "Update Assignment" : "Create Assignment"}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </FormCard>
  );
} 