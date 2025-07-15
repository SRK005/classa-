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

interface DiaryFormProps {
  entryId?: string;
  initialData?: {
    title: string;
    content: string;
    date: any;
    classId: string;
    subjectId: string;
    studentId: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Option {
  value: string;
  label: string;
}

export default function DiaryForm({ entryId, initialData, onSuccess, onCancel }: DiaryFormProps) {
  const { user, schoolId } = useAuth();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    date: initialData?.date ? 
      (initialData.date.toDate ? initialData.date.toDate().toISOString().split('T')[0] : "") : "",
    classId: initialData?.classId || "",
    subjectId: initialData?.subjectId || "",
    studentId: initialData?.studentId || "",
  });
  const [classes, setClasses] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [students, setStudents] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchClasses();
  }, [schoolId]);

  useEffect(() => {
    if (formData.classId) {
      fetchSubjects(formData.classId);
      fetchStudents(formData.classId);
    } else {
      setSubjects([]);
      setStudents([]);
      setFormData(prev => ({ ...prev, subjectId: "", studentId: "" }));
    }
  }, [formData.classId]);

  const fetchClasses = async () => {
    if (!schoolId) return;
    
    setLoadingClasses(true);
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
      setErrors(prev => ({ ...prev, classes: "Failed to load classes" }));
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchSubjects = async (classId: string) => {
    if (!schoolId) return;
    
    setLoadingSubjects(true);
    try {
      const subjectsQuery = query(
        collection(db, "subjects"),
        where("schoolId", "==", doc(db, "school", schoolId)),
        where("classId", "==", doc(db, "classes", classId))
      );
      const subjectsSnapshot = await getDocs(subjectsQuery);
      
      const subjectOptions: Option[] = subjectsSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().name
      }));
      
      setSubjects(subjectOptions);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setErrors(prev => ({ ...prev, subjects: "Failed to load subjects" }));
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchStudents = async (classId: string) => {
    if (!schoolId) return;
    
    setLoadingStudents(true);
    try {
      const studentsQuery = query(
        collection(db, "students"),
        where("schoolId", "==", doc(db, "school", schoolId)),
        where("classId", "==", doc(db, "classes", classId))
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      
      const studentOptions: Option[] = studentsSnapshot.docs.map(doc => ({
        value: doc.id,
        label: `${doc.data().name} (${doc.data().rollNumber})`
      }));
      
      setStudents(studentOptions);
    } catch (error) {
      console.error("Error fetching students:", error);
      setErrors(prev => ({ ...prev, students: "Failed to load students" }));
    } finally {
      setLoadingStudents(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.classId) {
      newErrors.classId = "Class is required";
    }

    if (!formData.subjectId) {
      newErrors.subjectId = "Subject is required";
    }

    if (!formData.studentId) {
      newErrors.studentId = "Student is required";
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
      const entryData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        date: new Date(formData.date),
        classId: doc(db, "classes", formData.classId),
        subjectId: doc(db, "subjects", formData.subjectId),
        studentId: doc(db, "students", formData.studentId),
        schoolId: doc(db, "school", schoolId!),
        createdBy: doc(db, "users", user!.uid),
        ...(entryId 
          ? { updatedAt: serverTimestamp() }
          : { createdAt: serverTimestamp() }
        ),
      };

      if (entryId) {
        await updateDoc(doc(db, "diary", entryId), entryData);
      } else {
        await addDoc(collection(db, "diary"), entryData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving diary entry:", error);
      setErrors(prev => ({ ...prev, submit: "Failed to save diary entry. Please try again." }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title={entryId ? "Edit Diary Entry" : "Create New Diary Entry"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          type="text"
          value={formData.title}
          onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
          placeholder="Enter diary entry title"
          required
          error={errors.title}
        />

        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
          required
          error={errors.date}
        />

        <Select
          label="Class"
          options={classes}
          value={formData.classId}
          onChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}
          placeholder="Select a class"
          required
          disabled={loadingClasses}
          error={errors.classId}
        />

        <Select
          label="Subject"
          options={subjects}
          value={formData.subjectId}
          onChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
          placeholder="Select a subject"
          required
          disabled={loadingSubjects || !formData.classId}
          error={errors.subjectId}
        />

        <Select
          label="Student"
          options={students}
          value={formData.studentId}
          onChange={(value) => setFormData(prev => ({ ...prev, studentId: value }))}
          placeholder="Select a student"
          required
          disabled={loadingStudents || !formData.classId}
          error={errors.studentId}
        />

        <Input
          label="Content"
          type="textarea"
          value={formData.content}
          onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
          placeholder="Enter diary entry content"
          required
          rows={6}
          error={errors.content}
        />

        {errors.submit && (
          <div className="text-red-600 text-sm">{errors.submit}</div>
        )}

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            loading={loading}
            disabled={loading || loadingClasses || loadingSubjects || loadingStudents}
            className="flex-1"
          >
            {loading ? <LoadingSpinner size="small" /> : null}
            {entryId ? "Update Entry" : "Create Entry"}
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