import axios from "axios";

const rawBase = (import.meta.env.VITE_API_URL as string) || "/";
const base = rawBase.replace(/\/+$/, "") || "/";


const api = axios.create({
  baseURL: base,
  withCredentials: true,
});

export default api;
