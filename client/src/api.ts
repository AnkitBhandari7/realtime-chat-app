
import axios from "axios";

//  Changed default port from 5000 to 5001
const baseURL =
  (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/+$/, "");

console.log(" API Base URL:", baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true, //  Enable if using cookies
});

//  Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log(" API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      data: config.data,
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure Content-Type is set
    config.headers["Content-Type"] = "application/json";

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

//  Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error(" Response Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

export default api;