import axios from "axios";
import { supabase } from "../lib/supabase";

const baseURL = import.meta.env.PROD
  ? "https://ai-interview-platform-ac5m.onrender.com/api"
  : "/api";

const api = axios.create({ baseURL });

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) config.headers.Authorization = `Bearer ${session.access_token}`;
  return config;
});

export default api;
