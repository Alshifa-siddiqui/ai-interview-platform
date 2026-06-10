import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const HISTORY_KEY = "interview_score_history";

export interface ScoreRecord {
  id: string;
  role: string;
  score: number;
  timestamp: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ScoreRecord }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs shadow">
      <p className="font-medium text-gray-900 dark:text-white">{d.role}</p>
      <p className="text-indigo-600 dark:text-indigo-400">{d.score}%</p>
    </div>
  );
}

export function ScoreHistory() {
  const raw = localStorage.getItem(HISTORY_KEY);
  const history: ScoreRecord[] = raw ? JSON.parse(raw) : [];

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Score History
        </h2>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Complete your first interview to see progress
        </p>
      </div>
    );
  }

  const data = history.map((r) => ({ ...r, date: formatDate(r.timestamp) }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
      <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        Score History
      </h2>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 4, fill: "#4f46e5" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
