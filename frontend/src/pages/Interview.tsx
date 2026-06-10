import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import type { NextQuestion } from "../types";
import { DarkModeToggle } from "../components/DarkModeToggle";

export default function Interview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<NextQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchNext = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<NextQuestion>(
        `/interviews/${id}/next-question`,
      );
      if (data.completed) {
        navigate(`/results/${id}`);
      } else {
        setQuestion(data);
        setAnswer("");
      }
    } catch {
      setError("Failed to load question. Check the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchNext();
  }, [fetchNext]);

  async function submitAnswer() {
    if (!question?.id || !answer.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/interviews/${id}/answer`, {
        question_id: question.id,
        answer_text: answer,
      });
      await fetchNext();
    } catch {
      setError("Failed to save answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
        {question ? "Loading next question…" : "Loading questions…"}
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-red-500">
        {error}
      </div>
    );
  }

  const number = question?.number ?? 1;
  const total = question?.total ?? 1;
  const isLast = number === total;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Question {number} of {total}
          </span>
          <div className="flex items-center gap-3">
            <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${(number / total) * 100}%` }}
              />
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow p-8">
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            {question?.text}
          </p>
          <textarea
            rows={6}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here…"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <button
            onClick={submitAnswer}
            disabled={submitting || !answer.trim()}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {submitting
              ? "Saving…"
              : isLast
                ? "Finish & see results"
                : "Next question"}
          </button>
        </div>
      </main>
    </div>
  );
}
