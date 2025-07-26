"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../../lib/firebaseClient";
import { useAuth } from "../../contexts/AuthContext";
import Input from "../shared/Input";
import Select from "../shared/Select";
import LoadingSpinner from "../shared/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faCheck,
  faTimes,
  faUsers,
  faBook,
  faFileAlt,
  faCloudUpload,
  faSpinner,
  faExclamationTriangle,
  faTrash,
  faFile,
  faClipboard,
  faCalendarDay
} from "@fortawesome/free-solid-svg-icons";

interface DiaryFormProps {
  entryId?: string;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Option {
  value: string;
  label: string;
}

export default function DiaryForm({ entryId, initialData, onSuccess, onCancel }: DiaryFormProps) {
  const { user, schoolId, loading: authLoading } = useAuth();
  
  // Debug logging
  console.log("DiaryForm auth state:", { user: user?.uid, schoolId, authLoading });
  
  // Form data
  const [formData, setFormData] = useState({
    classId: initialData?.classId || "",
    subjectId: initialData?.subjectId || "",
    content: initialData?.content || "",
  });

  const [classes, setClasses] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && schoolId) {
      fetchClasses();
    } else if (!authLoading && !schoolId) {
      console.error("No schoolId available after auth loading complete");
      setErrors({ classes: "School ID not found. Please ensure you're logged in properly." });
    }
  }, [schoolId, authLoading]);

  useEffect(() => {
    if (formData.classId) {
      fetchSubjectsForClass(formData.classId);
    } else {
      setSubjects([]);
    }
  }, [formData.classId]);

  const fetchClasses = async () => {
    if (!schoolId) {
      console.error("No schoolId available for fetching classes");
      setErrors({ classes: "School ID not found. Please ensure you're logged in properly." });
      return;
    }
    
    console.log("Fetching classes for school:", schoolId);
    setLoadingData(true);
    try {
      const classesQuery = query(
        collection(db, "classes"),
        where("schoolId", "==", doc(db, "school", schoolId))
      );
      const classesSnapshot = await getDocs(classesQuery);
      
      console.log("Classes found:", classesSnapshot.size);
      
      const classOptions: Option[] = classesSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log("Class data:", data);
        return {
          value: doc.id,
          label: data.name || "Unknown Class"
        };
      });
      
      setClasses(classOptions);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setErrors({ classes: "Failed to load classes" });
    } finally {
      setLoadingData(false);
    }
  };

  const fetchSubjectsForClass = async (classId: string) => {
    if (!schoolId || !classId) {
      console.error("Missing schoolId or classId for fetching subjects:", { schoolId, classId });
      return;
    }
    
    console.log("Fetching subjects for class:", classId, "school:", schoolId);
    try {
      const subjectsQuery = query(
        collection(db, "subjects"),
        where("schoolId", "==", doc(db, "school", schoolId)),
        where("assClass", "array-contains", doc(db, "classes", classId))
      );
      const subjectsSnapshot = await getDocs(subjectsQuery);
      
      console.log("Subjects found:", subjectsSnapshot.size);
      
      const subjectOptions: Option[] = subjectsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log("Subject data:", data);
        return {
          value: doc.id,
          label: data.name || "Unknown Subject"
        };
      });
      
      setSubjects(subjectOptions);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setErrors({ subjects: "Failed to load subjects for this class" });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (file.size > maxSize) {
        setErrors({ file: `File size must be less than ${maxSize / (1024 * 1024)}MB` });
        return;
      }
      
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setErrors({ file: "Please select a valid file (PDF, Word, Text, or Image)" });
        return;
      }
      
      setSelectedFile(file);
      setErrors({ ...errors, file: "" });
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string }> => {
    const storage = getStorage();
    const fileRef = ref(storage, `diary/daily/${schoolId}/${Date.now()}_${file.name}`);
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      
      setUploadProgress(100);
      return { url: downloadURL, name: file.name };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.classId) {
      newErrors.classId = "Class is required";
    }

    if (!formData.subjectId) {
      newErrors.subjectId = "Subject is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Daily notes content is required";
    } else if (formData.content.length < 10 || formData.content.length > 2000) {
      newErrors.content = "Content must be between 10 and 2000 characters";
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
      let attachmentUrl = "";
      let attachmentName = "";

      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile);
        attachmentUrl = uploadResult.url;
        attachmentName = uploadResult.name;
      }

      const entryData = {
        classId: doc(db, "classes", formData.classId),
        subjectId: doc(db, "subjects", formData.subjectId),
        schoolId: doc(db, "school", schoolId!),
        createdBy: doc(db, "users", user!.uid),
        content: formData.content.trim(),
        attachments: attachmentUrl ? [{
          name: attachmentName,
          url: attachmentUrl,
          type: selectedFile?.type || "",
          size: selectedFile?.size || 0
        }] : [],
        ...(entryId 
          ? { updatedAt: serverTimestamp() }
          : { createdAt: serverTimestamp() }
        ),
      };

      if (entryId) {
        await updateDoc(doc(db, "diary_entries", entryId), entryData);
      } else {
        await addDoc(collection(db, "diary_entries"), entryData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving diary entry:", error);
      setErrors({ submit: "Failed to save diary entry. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while authentication is in progress
  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-4xl mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please log in to access the diary form.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faCalendarDay} className="text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {entryId ? "Edit Daily Notes" : "Create Daily Notes"}
              </h2>
              <p className="text-blue-100 text-sm">
                {entryId ? "Update your daily notes" : "Record your daily teaching notes and observations"}
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Class & Subject */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faUsers} className="text-green-600 text-sm" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Class & Subject</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            {/* Daily Notes Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faClipboard} className="text-blue-600 text-sm" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Daily Notes</h3>
              </div>
              
              <Input
                label="Today's Notes"
                type="textarea"
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="Record your daily teaching notes, observations, student progress, activities completed, or any important notes for today..."
                rows={8}
                required
                error={errors.content}
              />
            </div>

            {/* File Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faFileAlt} className="text-indigo-600 text-sm" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Attachment</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 file-upload-area ${
                    selectedFile 
                      ? "border-green-300 bg-green-50" 
                      : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                  }`}>
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <FontAwesomeIcon icon={faFile} className="text-green-600 text-xl" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <FontAwesomeIcon icon={faCloudUpload} className="text-blue-600 text-2xl" />
                        </div>
                        <p className="text-gray-700 font-medium mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">
                          PDF, Word, Text, or Image files (max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {uploading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faSpinner} className="text-blue-600 animate-spin" />
                        <span className="text-sm font-medium text-blue-900">Uploading...</span>
                      </div>
                      <span className="text-sm text-blue-700 font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 progress-bar"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {errors.file && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>{errors.file}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Data Loading Errors */}
            {(errors.classes || errors.subjects) && (
              <div className="space-y-2">
                {errors.classes && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>{errors.classes}</span>
                  </div>
                )}
                {errors.subjects && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <span>{errors.subjects}</span>
                  </div>
                )}
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-200">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>{errors.submit}</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="bg-gray-50 border-t border-gray-200 p-6 rounded-b-xl">
        <div className="flex gap-4">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || loadingData || uploading}
            className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed btn-loading ${
              loading || uploading ? "animate-pulse" : ""
            }`}
          >
            {loading || uploading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faCheck} />
            )}
            {loading || uploading ? "Processing..." : (entryId ? "Update Notes" : "Save Daily Notes")}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading || uploading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faTimes} />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 