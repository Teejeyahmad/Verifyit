import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 20000,
  withCredentials: true,
});

// // Attach JWT token to every request automatically
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('vi_token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// Handle 401 globally — redirect to login when token expires
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("vi_business");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
