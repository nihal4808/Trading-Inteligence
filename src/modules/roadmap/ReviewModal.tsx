"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export interface ReviewFormData {
  review: string;
  reflection: string;
  mood: number;
  confidenceLevel: number;
  difficultyLevel: number;
  lessonsLearned: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  taskTitle: string;
  onClose: () => void;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  initialData?: Partial<ReviewFormData>;
}

export default function ReviewModal({
  isOpen,
  taskTitle,
  onClose,
  onSubmit,
  initialData,
}: ReviewModalProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    review: "",
    reflection: "",
    mood: 7,
    confidenceLevel: 7,
    difficultyLevel: 5,
    lessonsLearned: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-700">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-100">Review: {taskTitle}</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* What you learned */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              What did you learn?
            </label>
            <textarea
              value={formData.review}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, review: e.target.value }))
              }
              placeholder="Key concepts, insights, practical applications..."
              className="w-full h-24 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Personal reflection */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              Personal reflection
            </label>
            <textarea
              value={formData.reflection}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reflection: e.target.value }))
              }
              placeholder="How did this relate to your trading? What surprised you? What challenged you?"
              className="w-full h-24 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Lessons learned */}
          <div>
            <label className="block text-sm font-semibold text-neutral-300 mb-2">
              Key lessons / takeaways
            </label>
            <textarea
              value={formData.lessonsLearned}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lessonsLearned: e.target.value }))
              }
              placeholder="Most important points to remember..."
              className="w-full h-20 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-neutral-100 text-sm placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mood */}
            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2">
                Mood: <span className="text-blue-400">{formData.mood}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.mood}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mood: Number(e.target.value) }))
                }
                className="w-full"
              />
              <p className="text-xs text-neutral-500 mt-1">How did you feel?</p>
            </div>

            {/* Confidence */}
            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2">
                Confidence: <span className="text-blue-400">{formData.confidenceLevel}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.confidenceLevel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confidenceLevel: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
              <p className="text-xs text-neutral-500 mt-1">How confident?</p>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2">
                Difficulty: <span className="text-blue-400">{formData.difficultyLevel}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.difficultyLevel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    difficultyLevel: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
              <p className="text-xs text-neutral-500 mt-1">How difficult?</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end border-t border-neutral-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary px-4 py-2"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4 py-2"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
