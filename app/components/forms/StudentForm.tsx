"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs, getDoc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db, auth } from "../../../lib/firebaseClient";
import { useAuth } from "../../contexts/AuthContext";
import FormCard from "../shared/FormCard";
import Input from "../shared/Input";
import Select from "../shared/Select";
import Button from "../shared/Button";
import LoadingSpinner from "../shared/LoadingSpinner";

interface StudentFormProps {
  studentId?: string;
  initialData?: {
    name: string;
    email: string;
    phone: string;
    rollNumber: string;
    classId: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    dateOfBirth: any;
    address: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ClassOption {
  value: string;
  label: string;
}

interface ExistingParent {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: string[];
}

export default function StudentForm({ studentId, initialData, onSuccess, onCancel }: StudentFormProps) {
  const { user, schoolId } = useAuth();
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    rollNumber: initialData?.rollNumber || "",
    classId: initialData?.classId || "",
    parentName: initialData?.parentName || "",
    parentPhone: initialData?.parentPhone || "",
    parentEmail: initialData?.parentEmail || "",
    dateOfBirth: initialData?.dateOfBirth ? 
      (initialData.dateOfBirth.toDate ? initialData.dateOfBirth.toDate().toISOString().split('T')[0] : "") : "",
    address: initialData?.address || "",
  });
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingParent, setLoadingParent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingParent, setExistingParent] = useState<ExistingParent | null>(null);

  useEffect(() => {
    fetchClasses();
  }, [schoolId]);

  // Lookup existing parent when parent email changes
  useEffect(() => {
    if (formData.parentEmail && formData.parentEmail.includes('@') && formData.parentEmail.includes('.')) {
      lookupExistingParent(formData.parentEmail);
    } else {
      setExistingParent(null);
    }
  }, [formData.parentEmail]);

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

  const lookupExistingParent = async (email: string) => {
    setLoadingParent(true);
    try {
      const parentQuery = query(
        collection(db, "parents"),
        where("email", "==", email.trim().toLowerCase())
      );
      const parentSnapshot = await getDocs(parentQuery);
      
      if (!parentSnapshot.empty) {
        const parentDoc = parentSnapshot.docs[0];
        const parentData = parentDoc.data();
        
        setExistingParent({
          id: parentDoc.id,
          name: parentData.name,
          email: parentData.email,
          phone: parentData.phone,
          children: parentData.children || []
        });
        
        // Auto-fill parent information
        setFormData(prev => ({
          ...prev,
          parentName: parentData.name,
          parentPhone: parentData.phone
        }));
      } else {
        setExistingParent(null);
      }
    } catch (error) {
      console.error("Error looking up parent:", error);
    } finally {
      setLoadingParent(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Student name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Student email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = "Roll number is required";
    }

    if (!formData.classId) {
      newErrors.classId = "Class is required";
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = "Parent name is required";
    }

    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = "Parent phone is required";
    }

    if (!formData.parentEmail.trim()) {
      newErrors.parentEmail = "Parent email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.parentEmail)) {
      newErrors.parentEmail = "Please enter a valid parent email address";
    }

    if (!schoolId) {
      newErrors.school = "School ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createFirebaseUser = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // User already exists, that's okay for our use case
        return null;
      }
      throw error;
    }
  };

  const formatDateOfBirth = (dateString: string) => {
    // Convert date to DDMMYYYY format for password
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const currentUser = auth.currentUser;

    try {
      // For editing, we don't create new users
      if (studentId) {
        const studentData = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || null,
          rollNumber: formData.rollNumber.trim(),
          classId: doc(db, "classes", formData.classId),
          parentName: formData.parentName.trim(),
          parentPhone: formData.parentPhone.trim(),
          parentEmail: formData.parentEmail.trim().toLowerCase(),
          dateOfBirth: new Date(formData.dateOfBirth),
          address: formData.address.trim() || null,
          schoolId: doc(db, "school", schoolId!),
          createdBy: doc(db, "users", user!.uid),
          updatedAt: serverTimestamp(),
        };

        await updateDoc(doc(db, "students", studentId), studentData);
        onSuccess?.();
        return;
      }

      // For new student creation
      const dobPassword = formatDateOfBirth(formData.dateOfBirth);
      const parentPassword = "password";

      // Create student Firebase Auth user
      const studentUser = await createFirebaseUser(
        formData.email.trim().toLowerCase(), 
        dobPassword, 
        formData.name.trim()
      );

      // Create or update parent
      let parentId = existingParent?.id;
      let parentUser = null;

      if (existingParent) {
        // Parent exists, just update if needed
        const parentData = {
          name: formData.parentName.trim(),
          phone: formData.parentPhone.trim(),
          updatedAt: serverTimestamp(),
        };
        await updateDoc(doc(db, "parents", existingParent.id), parentData);
        parentId = existingParent.id;
      } else {
        // Create new parent
        parentUser = await createFirebaseUser(
          formData.parentEmail.trim().toLowerCase(), 
          parentPassword, 
          formData.parentName.trim()
        );

        const parentData = {
          name: formData.parentName.trim(),
          email: formData.parentEmail.trim().toLowerCase(),
          phone: formData.parentPhone.trim(),
          children: [],
          schoolId: doc(db, "school", schoolId!),
          createdBy: doc(db, "users", user!.uid),
          createdAt: serverTimestamp(),
        };

        const parentDocRef = await addDoc(collection(db, "parents"), parentData);
        parentId = parentDocRef.id;
      }

      // Create student document
      const studentData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        rollNumber: formData.rollNumber.trim(),
        classId: doc(db, "classes", formData.classId),
        parentId: doc(db, "parents", parentId!),
        parentName: formData.parentName.trim(),
        parentPhone: formData.parentPhone.trim(),
        parentEmail: formData.parentEmail.trim().toLowerCase(),
        dateOfBirth: new Date(formData.dateOfBirth),
        address: formData.address.trim() || null,
        schoolId: doc(db, "school", schoolId!),
        createdBy: doc(db, "users", user!.uid),
        createdAt: serverTimestamp(),
      };

      const studentDocRef = await addDoc(collection(db, "students"), studentData);

      // Update parent's children array
      if (parentId) {
        const parentDoc = await getDoc(doc(db, "parents", parentId));
        if (parentDoc.exists()) {
          const currentChildren = parentDoc.data().children || [];
          const updatedChildren = [...currentChildren, studentDocRef.id];
          
          await updateDoc(doc(db, "parents", parentId), {
            children: updatedChildren,
            updatedAt: serverTimestamp(),
          });
        }
      }

      // Re-authenticate the original user
      if (currentUser) {
        try {
          await signOut(auth);
          // The AuthContext will handle re-authentication
        } catch (error) {
          console.error("Error signing out:", error);
        }
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving student:", error);
      setErrors({ submit: "Failed to save student. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title={studentId ? "Edit Student" : "Create New Student"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Student Name"
            type="text"
            value={formData.name}
            onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            placeholder="Enter student name"
            required
            error={errors.name}
          />

          <Input
            label="Roll Number"
            type="text"
            value={formData.rollNumber}
            onChange={(value) => setFormData(prev => ({ ...prev, rollNumber: value }))}
            placeholder="Enter roll number"
            required
            error={errors.rollNumber}
          />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Student Email"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
            placeholder="Enter student email address"
            required
            error={errors.email}
          />

          <Input
            label="Phone (Optional)"
            type="tel"
            value={formData.phone}
            onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
            placeholder="Enter phone number"
            error={errors.phone}
          />
        </div>

        <Input
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(value) => setFormData(prev => ({ ...prev, dateOfBirth: value }))}
          required
          error={errors.dateOfBirth}
        />

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
          
          <Input
            label="Parent Email"
            type="email"
            value={formData.parentEmail}
            onChange={(value) => setFormData(prev => ({ ...prev, parentEmail: value }))}
            placeholder="Enter parent email"
            required
            error={errors.parentEmail}
          />

          {loadingParent && (
            <div className="flex items-center gap-2 text-blue-600 text-sm mb-2">
              <LoadingSpinner size="small" />
              Looking up parent...
            </div>
          )}

          {existingParent && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
              <p className="text-green-800 font-medium">Existing Parent Found!</p>
              <p className="text-green-700 text-sm">
                {existingParent.name} - {existingParent.children.length} child(ren) already registered
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Parent Name"
              type="text"
              value={formData.parentName}
              onChange={(value) => setFormData(prev => ({ ...prev, parentName: value }))}
              placeholder="Enter parent name"
              required
              error={errors.parentName}
              disabled={loadingParent}
            />

            <Input
              label="Parent Phone"
              type="tel"
              value={formData.parentPhone}
              onChange={(value) => setFormData(prev => ({ ...prev, parentPhone: value }))}
              placeholder="Enter parent phone"
              required
              error={errors.parentPhone}
              disabled={loadingParent}
            />
          </div>
        </div>

        <Input
          label="Address (Optional)"
          type="textarea"
          value={formData.address}
          onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
          placeholder="Enter address"
          rows={3}
          error={errors.address}
        />

        {!studentId && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-blue-800 font-medium text-sm">Account Information:</p>
            <p className="text-blue-700 text-sm">
              • Student login: {formData.email} (Password: Date of Birth as DDMMYYYY)
            </p>
            <p className="text-blue-700 text-sm">
              • Parent login: {formData.parentEmail} (Password: password)
            </p>
          </div>
        )}

        {errors.submit && (
          <div className="text-red-600 text-sm">{errors.submit}</div>
        )}

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            loading={loading}
            disabled={loading || loadingClasses || loadingParent}
            className="flex-1"
          >
            {loading ? <LoadingSpinner size="small" /> : null}
            {studentId ? "Update Student" : "Create Student"}
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