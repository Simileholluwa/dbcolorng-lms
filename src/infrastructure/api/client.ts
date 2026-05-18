import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptors for Auth can be added here
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
