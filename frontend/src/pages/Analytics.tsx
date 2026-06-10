import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { HISTORY_KEY, type ScoreRecord } from "../components/ScoreHistory";

function getTrend(scores: number[]): {
  label: string;
  color: string;
  arrow: string;
} {
  if (scores.length < 2)
    return { label: "Not enough data", color: "gray", arrow: "" };
  const n = scores.length;
  const sumX = (n * (n - 1)) / 2;
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
  const sumY = scores.reduce((a, b) => a + b, 0);
  const sumXY = scores.reduce((sum, y, i) => sum + i * y, 0);
  const denom = n * sumX2 - sumX * sumX;
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  if (slope > 2) return { label: "Improving", color: "green", arrow: "↑" };
  if (slope < -2) return { label: "Declining", color: "red", arrow: "↓" };
  return { label: "Consistent", color: "yellow", arrow: "→" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface RoleTooltipProps {
  active?: boolean;
  payload?: {
    payload: {
      fullRole: string;
      avgScore: number;
      count: number;
      isStrongest: boolean;
    };
  }[];
}

function RoleTooltip({ active, payload }: RoleTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs shadow">
      <p className="font-medium text-gray-900 dark:text-white mb-1">
        {d.fullRole}
      </p>
      <p className="text-gray-600 dark:text-gray-400">Avg: {d.avgScore}%</p>
      <p className="text-gray-600 dark:text-gray-400">
        {d.count} interview{d.count !== 1 ? "s" : ""}
      </p>
      {d.isStrongest && (
        <p className="text-indigo-600 dark:text-indigo-400 font-medium mt-1">
          ⭐ Strongest role
        </p>
      )}
    </div>
  );
}

interface LineTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function LineTooltip({ active, payload, label }: LineTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-xs shadow">
      <p className="text-gray-500 dark:text-gray-400">Interview {label}</p>
      <p className="font-medium text-indigo-600 dark:text-indigo-400">
        {payload[0].value}%
      </p>
    </div>
  );
}

const TREND_STYLES: Record<string, string> = {
  Improving:
    "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30",
  Declining: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30",
  Consistent:
    "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30",
  "Not enough data":
    "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700",
};

export default function Analytics() {
  const navigate = useNavigate();
  const raw = localStorage.getItem(HISTORY_KEY);
  const history: ScoreRecord[] = raw ? JSON.parse(raw) : [];

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            ← Dashboard
          </button>
          <span className="font-semibold text-gray-900 dark:text-white">
            My Progress
          </span>
          <DarkModeToggle />
        </nav>
        <div className="flex flex-col items-center justify-center mt-32 text-center px-4">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No interviews yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Complete your first interview to see role-based analytics here.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Start an interview
          </button>
        </div>
      </div>
    );
  }

  // Group by role
  const grouped = history.reduce<Record<string, ScoreRecord[]>>((acc, r) => {
    if (!acc[r.role]) acc[r.role] = [];
    acc[r.role].push(r);
    return acc;
  }, {});

  // Sort each role's records by date ascending
  Object.values(grouped).forEach((records) =>
    records.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    ),
  );

  // Role comparison data
  const roleData = Object.entries(grouped).map(([role, records]) => ({
    role: role.length > 14 ? role.substring(0, 14) + "…" : role,
    fullRole: role,
    avgScore: Math.round(
      records.reduce((s, r) => s + r.score, 0) / records.length,
    ),
    count: records.length,
    isStrongest: false,
  }));

  const strongestIdx = roleData.reduce(
    (maxI, r, i) => (r.avgScore > roleData[maxI].avgScore ? i : maxI),
    0,
  );
  roleData[strongestIdx].isStrongest = true;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            ← Dashboard
          </button>
          <span className="font-semibold text-gray-900 dark:text-white">
            My Progress
          </span>
          <DarkModeToggle />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Role Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Role Comparison
            </h2>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
              ⭐ {roleData[strongestIdx].fullRole} — Your strongest role
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            Average score % per role
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={roleData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="role" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip content={<RoleTooltip />} />
              <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                {roleData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.isStrongest ? "#4f46e5" : "#a5b4fc"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Role summary row */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {roleData.map((r) => (
              <div
                key={r.fullRole}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3"
              >
                <p
                  className="text-xs font-medium text-gray-900 dark:text-white truncate"
                  title={r.fullRole}
                >
                  {r.fullRole}
                  {r.isStrongest && " ⭐"}
                </p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {r.avgScore}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {r.count} interview{r.count !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Per-role sections */}
        {Object.entries(grouped).map(([role, records]) => {
          const scores = records.map((r) => r.score);
          const trend = getTrend(scores);
          const lineData = records.map((r, i) => ({
            n: i + 1,
            score: r.score,
          }));

          return (
            <div
              key={role}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"
            >
              {/* Role header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {role}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {records.length} interview{records.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${TREND_STYLES[trend.label]}`}
                >
                  {trend.arrow} {trend.label}
                </span>
              </div>

              {/* Line chart */}
              {records.length > 1 && (
                <div className="mb-4">
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="n"
                        tick={{ fontSize: 11 }}
                        label={{
                          value: "Interview #",
                          position: "insideBottom",
                          offset: -2,
                          fontSize: 10,
                        }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11 }}
                        unit="%"
                      />
                      <Tooltip content={<LineTooltip />} />
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
              )}

              {/* Interview list */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {records.map((r, i) => (
                  <div
                    key={r.id}
                    className="flex justify-between items-center py-2"
                  >
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Interview {i + 1} ·{" "}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(r.date)}
                      </span>
                      {r.difficulty && (
                        <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 capitalize">
                          {r.difficulty}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {Math.round(r.score / 10)}/10
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
