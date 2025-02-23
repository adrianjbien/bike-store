import axios from "axios";

const API_URL = "http://localhost:3000";

// Tworzenie instancji axios z tokenem
const api = axios.create({
  baseURL: API_URL,
});

// Middleware do ustawiania tokenu
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Pobierz token z localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
