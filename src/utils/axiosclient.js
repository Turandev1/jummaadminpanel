// axiosClient.js
import axios from "axios";
import store, { logout, setauthdata } from "../redux/store";
import { refreshAccessToken } from "./authservice";
import { API_BASE_URL } from "./api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const newAccess = await refreshAccessToken();
      if (!newAccess) {
        store.dispatch(logout());
        return Promise.reject(error);
      }
      store.dispatch(
        setauthdata({
          ...store.getState().auth,
          accessToken: newAccess,
        })
      );
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);

export default api;
