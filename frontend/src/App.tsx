import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import Results from "./pages/Results";
import Analytics from "./pages/Analytics";
import { useAuthStore } from "./store/authStore";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const session = useAuthStore((s) => s.session);
  return session ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/interview/:id"
          element={
            <PrivateRoute>
              <Interview />
            </PrivateRoute>
          }
        />
        <Route
          path="/results/:id"
          element={
            <PrivateRoute>
              <Results />
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
