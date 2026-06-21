import axios from "axios";
import { supabase } from "../lib/supabase";

// VITE_API_URL wins when set (e.g. the Docker build passes "/api" so nginx can
// proxy to the backend container). Otherwise fall back to the hosted Render
// backend in production and the Vite dev proxy locally.
const baseURL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD
    ? "https://ai-interview-platform-ac5m.onrender.com/api"
    : "/api");

const api = axios.create({ baseURL });

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) config.headers.Authorization = `Bearer ${session.access_token}`;
  return config;
});

export default api;
