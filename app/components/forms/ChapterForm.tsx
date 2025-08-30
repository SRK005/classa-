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

interface ChapterFormProps {
  chapterId?: string;
  initialData?: {
    name: string;
    description: string;
    subjectId: string;
    orderIndex: number;
    classId?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ClassOption {
  value: string;
  label: string;
}

interface SubjectOption {
  value: string;
  label: string;
}

export default function ChapterForm({ chapterId, initialData, onSuccess, onCancel }: ChapterFormProps) {
  const { user, schoolId } = useAuth();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    subjectId: initialData?.subjectId || "",
    orderIndex: initialData?.orderIndex || 1,
    classId: initialData?.classId || "",
  });
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, [schoolId]);

  const fetchClasses = async () => {
    if (!schoolId) return;
    
    setLoadingClasses(true);
    try {
      const classesQuery = query(
        collection(db, "classes"),
        where("schoolId", "==", doc(db, "school", schoolId))
      );
      const classesSnapshot = await getDocs(classesQuery);
      
      const classOptions: ClassOption[] = classesSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().name
      }));
      
      setClasses(classOptions);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setErrors({ classes: "Failed to load classes" });
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchSubjects = async () => {
    if (!schoolId) return;
    
    setLoadingSubjects(true);
    try {
      const subjectsQuery = query(
        collection(db, "subjects"),
        where("schoolId", "==", doc(db, "school", schoolId))
      );
      const subjectsSnapshot = await getDocs(subjectsQuery);
      
      const subjectOptions: SubjectOption[] = subjectsSnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().name
      }));
      
      setSubjects(subjectOptions);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setErrors({ subjects: "Failed to load subjects" });
    } finally {
      setLoadingSubjects(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Chapter name is required";
    }

    if (!formData.subjectId) {
      newErrors.subjectId = "Subject is required";
    }

    if (!schoolId) {
      newErrors.school = "School ID is required";
    }

    if (formData.classId && !classes.some(c => c.value === formData.classId)) {
      newErrors.classId = "Invalid class selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const chapterData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        subjectId: doc(db, "subjects", formData.subjectId),
        schoolId: doc(db, "school", schoolId!),
        orderIndex: formData.orderIndex,
        classId: formData.classId ? doc(db, "classes", formData.classId) : null,
        createdBy: doc(db, "users", user!.uid),
        ...(chapterId 
          ? { updatedAt: serverTimestamp() }
          : { createdAt: serverTimestamp() }
        ),
      };

      if (chapterId) {
        await updateDoc(doc(db, "chapters", chapterId), chapterData);
      } else {
        await addDoc(collection(db, "chapters"), chapterData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving chapter:", error);
      setErrors({ submit: "Failed to save chapter. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title={chapterId ? "Edit Chapter" : "Create New Chapter"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Subject"
          options={subjects}
          value={formData.subjectId}
          onChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
          placeholder="Select a subject"
          required
          disabled={loadingSubjects}
        />

        <Input
          label="Chapter Name"
          type="text"
          value={formData.name}
          onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
          placeholder="Enter chapter name"
          required
          error={errors.name}
        />

        <Input
          label="Description"
          type="textarea"
          value={formData.description}
          onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
          placeholder="Enter chapter description (optional)"
          rows={3}
        />

        <Input
          label="Order Index"
          type="number"
          value={formData.orderIndex.toString()}
          onChange={(value) => setFormData(prev => ({ ...prev, orderIndex: parseInt(value) || 1 }))}
          placeholder="Enter order index (1, 2, 3, ...)"
          required
        />

        <Select
          label="Class"
          options={classes}
          value={formData.classId}
          onChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}
          placeholder="Select a class"
          disabled={loadingClasses}
          error={errors.classId}
        />

        {errors.submit && (
          <div className="text-red-600 text-sm">{errors.submit}</div>
        )}

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            loading={loading}
            disabled={loading || loadingSubjects}
            className="flex-1"
          >
            {loading ? <LoadingSpinner size="small" /> : null}
            {chapterId ? "Update Chapter" : "Create Chapter"}
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