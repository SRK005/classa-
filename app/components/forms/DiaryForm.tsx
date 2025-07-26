"use client";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebaseClient";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../shared/LoadingSpinner";
import React from "react";

interface DiaryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DiaryForm: React.FC<DiaryFormProps> = ({ onSuccess, onCancel }) => {
  const { user, schoolId, loading: authLoading } = useAuth();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (authLoading) {
    return <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>;
  }
  if (!user) {
    return <div className="h-full flex items-center justify-center text-red-500">Please log in to access the diary form.</div>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!note.trim()) {
      setError("Note is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "diary_entries"), {
        note: note.trim(),
        userId: user.uid,
        schoolId: schoolId,
        createdAt: serverTimestamp(),
      });
      setNote("");
      onSuccess?.();
    } catch (err) {
      setError("Failed to save diary entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Daily Diary Note</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
          rows={5}
          value={note}
          onChange={e => setNote(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
          {loading ? "Saving..." : "Save Note"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium">Cancel</button>
        )}
      </div>
    </form>
  );
};

export default DiaryForm; 