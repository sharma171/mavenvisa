import axios from "axios";

const axiosApi = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

axiosApi.interceptors.request.use(
  (config) => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        const token = user?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.warn("Failed to parse user token from localStorage", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// axiosApi.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     try {
//       if (error?.response?.status === 401) {
//         localStorage.removeItem("user");
//         window.location.href = "/login";
//       }
//     } catch (e) {
//       console.error("Error in response interceptor", e);
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosApi;
