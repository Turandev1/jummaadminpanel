// src/utils/axiosClient.js

import axios from "axios";
import store, { logout, setauthdata } from "../redux/store";
import { refreshAccessToken } from "./authservice";
import { API_BASE_URL } from "./api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request Interceptor: Her istekte Authorization başlığını ekle
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor: 401 hatasını yakala ve token yenile
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    // Hata 401 ise ve daha önce tekrar denenmemişse
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const newAccess = await refreshAccessToken();

      if (!newAccess) {
        // Token yenilenemezse, oturumu kapat ve hatayı reddet
        store.dispatch(logout());
        return Promise.reject(error);
      }

      // Sadece accessToken'ı güncelle, mevcut kullanıcı (user) ve rolü (role) koru
      store.dispatch(
        setauthdata({
          ...store.getState().auth,
          accessToken: newAccess,
        })
      );

      // Orijinal isteğin Authorization başlığını yeni token ile güncelle
      original.headers.Authorization = `Bearer ${newAccess}`;

      // İsteği yeni token ile tekrarla
      return api(original);
    }

    // Diğer hataları veya tekrar denenen istekleri reddet
    return Promise.reject(error);
  }
);

export default api;
