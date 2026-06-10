import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import type { Interview } from "../types";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { ScoreHistory } from "../components/ScoreHistory";

const DIFFICULTIES = ["junior", "mid-level", "senior"];

export default function Dashboard() {
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("mid-level");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState<{
    name: string;
    text: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5 MB.");
      return;
    }
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post<{ text: string; filename: string }>(
        "/resume/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setResumeFile({ name: file.name, text: data.text });
    } catch {
      setError("Failed to upload resume. Check the file format.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function startInterview() {
    if (!role.trim()) return setError("Please enter a role.");
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post<Interview>("/interviews/start", {
        role,
        difficulty,
        num_questions: numQuestions,
        resume_text: resumeFile?.text ?? "",
      });
      navigate(`/interview/${data.id}`);
    } catch {
      setError("Failed to start interview. Check the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
        <span className="font-semibold text-gray-900 dark:text-white">
          AI Interview
        </span>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <button
            onClick={logout}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-lg mx-auto mt-12 px-4 pb-12">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Start an interview
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          Claude will generate questions tailored to the role.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4 mb-6">
          {/* Resume upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resume{" "}
              <span className="font-normal text-gray-400 dark:text-gray-500">
                (optional)
              </span>
            </label>
            {resumeFile ? (
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg px-3 py-2">
                <svg
                  className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-indigo-700 dark:text-indigo-300 truncate flex-1">
                  {resumeFile.name}
                </span>
                <button
                  onClick={() => setResumeFile(null)}
                  className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full border border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
                >
                  {uploading ? "Uploading…" : "Upload PDF or DOCX (max 5 MB)"}
                </button>
              </>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Frontend Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Questions ({numQuestions})
            </label>
            <input
              type="range"
              min={3}
              max={10}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={startInterview}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? "Generating questions…" : "Start interview"}
          </button>
        </div>

        <ScoreHistory />
      </main>
    </div>
  );
}
