import axios from "axios";
import store, { logoutUser } from "../redux/store"; // Redux store-u import et
import { setauthdata } from "../redux/store"; // Action-ları import et
import { API_BASE_URL } from "./api";

// 1. Axios instansiyası yaradiriq
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cookie-ləri göndərmək üçün mütləqdir
});

// 2. Request Interceptor: Hər sorğuya Access Tokeni əlavə edir
api.interceptors.request.use(
  (config) => {
    const state = store.getState().auth;
    const token = state.accessToken;

    // Əgər token varsa və header-də yoxdursa, əlavə et
    if (token && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Dəyişənlər: Refresh prosesini idarə etmək üçün
let isRefreshing = false;
let failedQueue = [];

// Gözləyən sorğuları növbəyə yığan funksiya
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

// 3. Response Interceptor: 401 xətalarını tutur
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log("Interceptor isledi");
    // Əgər xəta 401-dirsə və bu sorğu hələ retry olunmayıbsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Əgər artıq refresh prosesi gedirsə, bu sorğununun cavabını növbəyə at
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
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
        // Redux-dan rolu götürək
        const state = store.getState().auth;
        const role = state.role;

        if (!role) throw new Error("Rol tapılmadı");
        console.log("baseurl:", API_BASE_URL);
        // Refresh token endpointinə sorğu atırıq
        // Cookie avtomatik gedəcək (withCredentials: true)
        const response = await axios.post(
          `${API_BASE_URL}/webapi/${role}/refreshToken`,
          {},
          { withCredentials: true },
        );
        const { accessToken, user } = response.data;
        console.log("data:");
        console.log("accessToken", accessToken);
        // Yeni məlumatları Redux-a yazırıq
        store.dispatch(setauthdata({ accessToken, user, role }));

        // Queue-da gözləyən digər sorğuları azad edirik
        processQueue(null, accessToken);

        // Uğursuz olan original sorğunu yeni tokenlə yenidən göndəririk
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;
        return api(originalRequest);
      } catch (err) {
        // Refresh uğursuz oldusa, istifadəçini logout edirik
        store.dispatch(logoutUser());
        processQueue(err, null);
        console.log("interceptor ugursuz");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
