"use client";
import React, { useEffect, useState } from "react";
import ContentSidebar from "../../components/ContentSidebar";
import { db } from "../../../../lib/firebaseClient";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth } from "../../../../components/firebase";

export default function VideoManagement() {
  // State declarations
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  // Upload form state (placeholder)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  // Subjects for main page filter
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  // Subjects for upload modal filter
  const [uploadSubjects, setUploadSubjects] = useState<any[]>([]);
  const [loadingUploadSubjects, setLoadingUploadSubjects] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  // Uploading state for modal
  const [uploading, setUploading] = useState(false);
  // Filter state
  const [filterClass, setFilterClass] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("");
  // Client-only render guard
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

  // Fetch classes for the logged-in user's school (on mount)
  useEffect(() => {
    async function fetchClasses() {
      setLoadingClasses(true);
      try {
        const user = auth.currentUser;
        if (!user) return;
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const schoolID = userSnap.exists() ? userSnap.data().schoolId : null;
        if (!schoolID) return;
        const q = query(collection(db, "classes"), where("schoolId", "==", schoolID));
        const snap = await getDocs(q);
        setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {}
      setLoadingClasses(false);
    }
    fetchClasses();
  }, []);

  // Fetch subjects for the main page filter
  useEffect(() => {
    async function fetchSubjectsForMainPage() {
      setLoadingSubjects(true);
      try {
        if (!filterClass) {
          setSubjects([]);
          setLoadingSubjects(false);
          return;
        }
        const classRef = doc(db, "classes", filterClass);
        const q = query(
          collection(db, "subjects"),
          where("assClass", "array-contains", classRef)
        );
        const snap = await getDocs(q);
        setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {}
      setLoadingSubjects(false);
    }
    fetchSubjectsForMainPage();
  }, [filterClass]);

  // Fetch subjects for the upload modal filter
  useEffect(() => {
    async function fetchSubjectsForUploadModal() {
      setLoadingUploadSubjects(true);
      try {
        if (!selectedClass) {
          setUploadSubjects([]);
          setLoadingUploadSubjects(false);
          return;
        }
        const classRef = doc(db, "classes", selectedClass);
        const q = query(
          collection(db, "subjects"),
          where("assClass", "array-contains", classRef)
        );
        const snap = await getDocs(q);
        setUploadSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {}
      setLoadingUploadSubjects(false);
    }
    fetchSubjectsForUploadModal();
  }, [selectedClass]);

  // Fetch videos for the user's school
  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      setError(null);
      try {
        const user = auth.currentUser;
        if (!user) return;
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const schoolID = userSnap.exists() ? userSnap.data().schoolId : null;
        if (!schoolID) return;
        // Fetch videos (contents where video == true and schoolID matches)
        const q = query(
          collection(db, "contents"),
          where("video", "==", true),
          where("schoolID", "==", schoolID)
        );
        const snap = await getDocs(q);
        const videosData = await Promise.all(
          snap.docs.map(async (docSnap) => {
            const d = docSnap.data();
            let className = "";
            if (d.classId) {
              try {
                const classSnap = await getDoc(d.classId);
                className = classSnap.exists() ? (classSnap.data() as any).name || "" : "";
              } catch {}
            }
            let subjectName = "";
            if (d.subjectId) {
              try {
                const subjectSnap = await getDoc(d.subjectId);
                subjectName = subjectSnap.exists() ? (subjectSnap.data() as any).name || "" : "";
              } catch {}
            }
            return {
              id: docSnap.id,
              title: d.title,
              description: d.description,
              className,
              subjectName,
              videoUrl: d.url || "#",
              createdAt: d.createdAt
            };
          })
        );
        setVideos(videosData);
      } catch (e) {
        setError("Failed to fetch videos.");
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  // Filtered videos
  const filteredVideos = videos.filter((video: any) => {
    if (filterClass && video.className !== (classes.find((c: any) => c.id === filterClass)?.name || "")) return false;
    if (filterSubject && video.subjectName !== (subjects.find((s: any) => s.id === filterSubject)?.name || "")) return false;
    return true;
  });

  // Prevent hydration mismatch: only render after client mount
  if (!hasMounted) return null;

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <ContentSidebar />
      <main className="flex-1 bg-gray-50 p-10">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">Video Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Videos Count */}
          <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg flex flex-col items-center border border-gray-100 group overflow-hidden transform transition-transform duration-200 hover:scale-105">
            <div className="absolute left-0 top-0 h-1/2 w-2 bg-blue-500 rounded-l-2xl transition-all duration-200 group-hover:h-full"></div>
            <div className="text-4xl font-bold text-blue-700 mb-2">{loading ? "-" : filteredVideos.length}</div>
            <div className="text-gray-600">Total Videos Uploaded</div>
          </div>
          {/* Upload New Video */}
          <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg flex flex-col items-center border border-gray-100 group overflow-hidden transform transition-transform duration-200 hover:scale-105">
            <div className="absolute left-0 top-0 h-1/2 w-2 bg-green-500 rounded-l-2xl transition-all duration-200 group-hover:h-full"></div>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow hover:bg-blue-700 transition text-lg mb-2" onClick={() => setShowModal(true)}>Upload New Video</button>
            <div className="text-gray-600">Upload video lectures for your classes.</div>
          </div>
        </div>
        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <select
            value={filterClass}
            onChange={e => {
              setFilterClass(e.target.value);
              setFilterSubject("");
            }}
            className="border rounded px-3 py-2"
            disabled={loadingClasses}
          >
            <option value="">All Classes</option>
            {classes.map((cls: any) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          {filterClass && (
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="border rounded px-3 py-2"
              disabled={loadingSubjects}
            >
              <option value="">All Subjects</option>
              {subjects.length === 0 && <option disabled>No subjects found for this class</option>}
              {subjects.map((sub: any) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          )}
        </div>
        {/* Videos List */}
        <div>
          {loading ? (
            <div className="text-center text-gray-400 text-lg">Loading videos...</div>
          ) : error ? (
            <div className="text-center text-red-500 text-lg">{error}</div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center text-gray-400 text-lg">No videos found for the selected filter.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVideos.map((video: any) => (
                <div key={video.id} className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow flex flex-col border border-gray-100 relative">
                  {/* Date bubble in top right */}
                  <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {video.createdAt ? (() => {
                      const date = new Date(video.createdAt.toDate ? video.createdAt.toDate() : video.createdAt);
                      const day = date.getDate();
                      const month = date.toLocaleDateString('en-US', { month: 'short' });
                      const year = date.getFullYear();
                      return `${day} ${month} ${year}`;
                    })() : 'No date'}
                  </div>
                  <div className="font-bold text-lg text-blue-800 mb-1">{video.title}</div>
                  <div className="text-gray-600 mb-2">{video.description}</div>
                  <div className="flex gap-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${video.className === 'class 12' ? 'bg-blue-100 text-blue-700' : video.className === 'Class 11' ? 'bg-yellow-100 text-yellow-700' : video.className === 'Class 10' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'}`}>
                      {video.className}
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">{video.subjectName}</span>
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-600 transition text-center">Download</a>
                    <button className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-semibold shadow hover:bg-red-200 transition text-center border border-red-200" onClick={() => alert('Delete functionality not implemented yet.')}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Upload Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm overflow-auto">
            <div className="relative w-full max-w-2xl mx-auto p-0">
              <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-100 p-0 flex flex-col animate-fadeIn overflow-hidden max-h-[90vh] relative">
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-2">
                  <h2 className="text-2xl font-bold text-gray-800">Upload New Video</h2>
                  <button
                    className="bg-white/70 hover:bg-gray-100 text-blue-500 rounded-full p-2 shadow-md border border-gray-200 transition"
                    onClick={() => setShowModal(false)}
                    aria-label="Close"
                  >
                    <svg width="1.5em" height="1.5em" viewBox="0 0 24 24"><path fill="currentColor" d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"/></svg>
                  </button>
                </div>
                {/* Uploading overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-20">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <div className="text-blue-700 font-semibold">Uploading...</div>
                  </div>
                )}
                {/* Content */}
                <div className="px-8 pt-2 pb-6 overflow-y-auto">
                  {/* File Upload Area */}
                  <div className="w-full bg-blue-100/80 border-2 border-dashed border-blue-100 rounded-2xl flex flex-col items-center justify-center py-8 mb-6 shadow-sm">
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="mb-2 text-blue-300"><path fill="currentColor" d="M12 16v-8m0 0-3 3m3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <div className="text-gray-500 text-lg mb-2">Drop video to upload or click</div>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        required={!youtubeUrl}
                      />
                      <span className="inline-block bg-blue-100 text-blue-700 font-semibold px-6 py-2 rounded-xl shadow hover:bg-blue-200 hover:text-blue-800 transition cursor-pointer">Upload Video</span>
                    </label>
                    {file && <div className="mt-2 text-blue-600 font-semibold">{file.name}</div>}
                  </div>
                  <div className="text-center text-gray-500 text-sm mb-6">OR</div>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-1">YouTube URL</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYoutubeUrl(e.target.value)}
                      className="w-full bg-blue-100/80 backdrop-blur border border-blue-100 rounded-xl px-5 py-3 text-base font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow"
                      required={!file}
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter a valid YouTube URL</p>
                  </div>
                  {/* Details Section */}
                  <div className="mb-4">
                    <div className="text-blue-700 font-bold text-lg mb-2">Details</div>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!title || !description || !selectedClass || !selectedSubject || (!file && !youtubeUrl)) {
                        alert("Please fill all required fields and either upload a video file or provide a YouTube URL.");
                        return;
                      }
                      setUploading(true);
                      try {
                        const user = auth.currentUser;
                        if (!user) throw new Error("User not logged in");
                        const userSnap = await getDoc(doc(db, "users", user.uid));
                        if (!userSnap.exists()) throw new Error("User doc not found");
                        const schoolID = userSnap.data().schoolId;
                        let url = youtubeUrl;
                        
                        if (file) {
                          const storageMod = await import("firebase/storage");
                          const { ref, uploadBytes, getDownloadURL } = storageMod;
                          const storageRef = ref(
                            (await import("../../../../components/firebase")).storage,
                            `videos/${user.uid}/${Date.now()}_${file.name}`
                          );
                          await uploadBytes(storageRef, file);
                          url = await getDownloadURL(storageRef);
                        }
                        const { addDoc, serverTimestamp } = await import("firebase/firestore");
                        await addDoc(collection(db, "contents"), {
                          title,
                          description,
                          url,
                          createdBy: doc(db, "users", user.uid),
                          createdAt: serverTimestamp(),
                          classId: doc(db, "classes", selectedClass),
                          subjectId: doc(db, "subjects", selectedSubject),
                          schoolID,
                          video: true
                        });
                        setShowModal(false);
                        setTitle("");
                        setDescription("");
                        setSelectedClass("");
                        setSelectedSubject("");
                        setFile(null);
                        setYoutubeUrl("");
                        // Refetch videos
                        setLoading(true);
                        const q = query(
                          collection(db, "contents"),
                          where("video", "==", true),
                          where("schoolID", "==", schoolID)
                        );
                        const snap = await getDocs(q);
                        const videosData = await Promise.all(
                          snap.docs.map(async (docSnap) => {
                            const d = docSnap.data();
                            let className = "";
                            if (d.classId) {
                              try {
                                const classSnap = await getDoc(d.classId);
                                className = classSnap.exists() ? (classSnap.data() as any).name || "" : "";
                              } catch {}
                            }
                            let subjectName = "";
                            if (d.subjectId) {
                              try {
                                const subjectSnap = await getDoc(d.subjectId);
                                subjectName = subjectSnap.exists() ? (subjectSnap.data() as any).name || "" : "";
                              } catch {}
                            }
                            return {
                              id: docSnap.id,
                              title: d.title,
                              description: d.description,
                              className,
                              subjectName,
                              videoUrl: d.url || "#",
                              createdAt: d.createdAt
                            };
                          })
                        );
                        setVideos(videosData);
                        setLoading(false);
                      } catch (err: any) {
                        alert(err.message || "Upload failed");
                      } finally {
                        setUploading(false);
                      }
                    }}
                  >
                    {/* Class/Subject Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="relative">
                        <select
                          className="w-full bg-blue-100/80 backdrop-blur border border-blue-100 rounded-xl px-5 py-3 text-base font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow"
                          value={selectedClass}
                          onChange={e => {
                            setSelectedClass(e.target.value);
                            setSelectedSubject("");
                          }}
                          disabled={loadingClasses}
                        >
                          <option value="">Select Class</option>
                          {classes.map((cls: any) => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="relative">
                        {selectedClass && (
                          <select
                            className="border rounded px-3 py-2 w-full"
                            value={selectedSubject}
                            onChange={e => setSelectedSubject(e.target.value)}
                            disabled={!selectedClass || loadingUploadSubjects}
                          >
                            <option value="">Select Subject</option>
                            {uploadSubjects.length === 0 && <option disabled>No subjects found for this class</option>}
                            {uploadSubjects.map((sub: any) => (
                              <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    {/* Title */}
                    <div className="relative mb-6">
                      <label className="block text-gray-700 font-semibold mb-1">Title</label>
                      <input
                        className="w-full bg-blue-100/80 backdrop-blur border border-blue-100 rounded-xl px-5 py-3 text-base font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow"
                        value={title}
                        onChange={e => setTitle(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                        required
                      />
                    </div>
                    {/* Description */}
                    <div className="relative mb-2">
                      <label className="block text-gray-700 font-semibold mb-1">Description</label>
                      <textarea
                        className="w-full bg-blue-100/80 backdrop-blur border border-blue-100 rounded-xl px-5 py-3 text-base font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow min-h-[90px]"
                        value={description}
                        onChange={e => setDescription(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                        required
                      />
                    </div>
                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-end gap-4 mt-4">
                      <button type="button" className="text-blue-400 font-semibold px-6 py-2 rounded-xl hover:bg-blue-50 transition" onClick={() => setShowModal(false)}>Cancel</button>
                      <button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-300 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-400 transition disabled:opacity-60">Upload</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
