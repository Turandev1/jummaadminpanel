import axios from "axios";
import store, { logout, setauthdata } from "../redux/store";
import { refreshAccessToken } from "./authservice";
import { API_BASE_URL } from "./api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- YENİ MƏNTİQ BAŞLAYIR ---
let isRefreshing = false;
let failedQueue = [];

// Gözləyən sorğuları növbəyə salmaq və sonra icra etmək üçün funksiya
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response Interceptor
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Əgər xəta 401-dirsə və bu sorğu hələ təkrar olunmayıbsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Əgər hazırda başqa bir sorğu tokeni yeniləyirsə, bu sorğunu növbəyə atırıq
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = "Bearer " + token;
              resolve(api(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tokeni yeniləyirik
        const newAccess = await refreshAccessToken();

        if (!newAccess) {
          // Token yenilənmədi -> Logout
          processQueue(new Error("Token yenilənmədi"), null);
          store.dispatch(logout());
          return Promise.reject(error);
        }

        // Uğurlu oldu -> Redux-u yenilə
        store.dispatch(
          setauthdata({
            ...store.getState().auth,
            accessToken: newAccess,
          })
        );

        // Növbədə gözləyən digər sorğuları buraxırıq (yeni tokenlə)
        processQueue(null, newAccess);

        // İndiki sorğunu təkrar göndəririk
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);

      } catch (err) {
        processQueue(err, null);
        store.dispatch(logout());
        return Promise.reject(err);
      } finally {
        isRefreshing = false; // Proses bitdi
      }
    }

    return Promise.reject(error);
  }
);

export default api;