import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import api from "../api/client";
import type { ResultOut } from "../types";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { HISTORY_KEY } from "../components/ScoreHistory";

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<ResultOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<ResultOut>(`/interviews/${id}/results`)
      .then(({ data }) => {
        setResult(data);
        const pct = Math.round((data.overall_score / data.max_score) * 100);
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
        if (!history.some((r: { id: string }) => r.id === id)) {
          history.push({
            id,
            role: data.role,
            score: pct,
            date: new Date().toISOString(),
            difficulty: data.difficulty,
          });
          localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        }
      })
      .catch(() => setError("Failed to load results."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
        Scoring your answers…
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-red-500">
        {error || "No results found."}
      </div>
    );
  }

  const radarData = result.scores.map((s, i) => ({
    question: `Q${i + 1}`,
    score: s.score,
    max: s.max_score,
  }));

  const pct = Math.round((result.overall_score / result.max_score) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <span className="font-semibold text-gray-900 dark:text-white">
            Results
          </span>
          <div className="flex items-center gap-3">
            <DarkModeToggle />
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              New interview
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Overall score */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-4 border-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {pct}%
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Overall score
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {result.overall_score} / {result.max_score}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {result.summary}
            </p>
          </div>
        </div>

        {/* Radar chart */}
        {radarData.length > 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Score breakdown
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="question" />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Per-question breakdown */}
        <div className="space-y-4">
          {result.scores.map((s, i) => (
            <div
              key={s.question_id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Question {i + 1}
                </span>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {s.score}/{s.max_score}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {s.feedback}
              </p>
              {s.strengths.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                    Strengths
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                    {s.strengths.map((str, j) => (
                      <li key={j}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}
              {s.improvements.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                    To improve
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                    {s.improvements.map((imp, j) => (
                      <li key={j}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
