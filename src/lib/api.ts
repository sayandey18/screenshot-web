import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
if (!backendUrl) {
  throw new Error("Backend URL is required. Set it in your environment before starting the app.");
}

export const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});
