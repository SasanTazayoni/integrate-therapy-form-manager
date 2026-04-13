import axios from "axios";
import { TOKEN_KEY } from "./authFrontend";

const rawBase = (import.meta.env.VITE_API_URL as string) || "/";
const base = rawBase.replace(/\/+$/, "") || "/";

const api = axios.create({ baseURL: base });

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
