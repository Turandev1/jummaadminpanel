// src/utils/authservice.js

import axios from "axios";
import store from "../redux/store";
import { logout, setauthdata } from "../redux/store";
import { API_BASE_URL } from "./api";

export async function refreshAccessToken() {
  const state = store.getState().auth;
  // Rol veya Refresh Token yoksa deneme
  if (!state.role) return null;

  try {
    // refresh token cookie’de olduğundan ayrıca body göndermiyoruz
    // Rol bilgisini kullanarak doğru endpoint'e istek atılır.
    const res = await axios.post(
      `${API_BASE_URL}/webapi/${state.role}/refreshToken`,
      {},
      { withCredentials: true }
    );

    // Yorumdaki "admin refresh olmadıysa satıcıyı deneyelim" mantığı tehlikelidir ve iptal edilmiştir.
    // Kullanıcının kayıtlı rolü neyse sadece onu deneriz.
    return res.data?.accessToken || null;
  } catch (err) {
    console.error(
      "Token yenileme başarısız oldu:",
      err.response?.data?.hata || err.message
    );
    // Yenileme başarısız olursa null döndür.
    return null;
  }
}

export async function initAuth() {
  const state = store.getState().auth;
  const { accessToken, role } = state;

  // Erişim belirteci veya rol bilgisi yoksa
  if (!accessToken || !role) return false;

  let currentAccessToken = accessToken;

  try {
    // 1. Erişim belirteci ile getme denemesi
    const res = await axios.get(`${API_BASE_URL}/webapi/${role}/getme`, {
      headers: {
        Authorization: `Bearer ${currentAccessToken}`,
      },
    });

    // 2. Başarılıysa
    if (res.data?.success) {
      console.log(res.data.role);
      return true;
    }

    // 3. Başarısız ama 401 değilse (sunucu hatası vb.)
    return false;
  } catch (err) {
    // 4. Hata yakalandı (Büyük olasılıkla 401 - Token süresi doldu)
    console.log(
      "initAuth hatası yakalandı. Token yenileme deneniyor.",
      err.response?.data?.hata
    );

    // 5. Token yenileme denemesi
    const newAccess = await refreshAccessToken();
    if (!newAccess) {
      store.dispatch(logout()); // Yenileme başarısızsa logout
      return false;
    }

    // 6. Yeni Token ile kullanıcı verilerini tekrar al
    try {
      const res2 = await axios.get(`${API_BASE_URL}/webapi/${role}/getme`, {
        headers: { Authorization: `Bearer ${newAccess}` },
      });

      // 7. Yeni kullanıcı verileri ve token ile Redux'u güncelle
      // Rolü ve kullanıcı verilerini, son başarılı getme isteğinden gelenlerle güncelle.
      store.dispatch(
        setauthdata({
          user: res2.data.user,
          role: role, // Rol bilgisi mevcut state'ten korunur.
          accessToken: newAccess,
        })
      );

      return true; // Oturum başarıyla yenilendi ve doğrulandı
    } catch (err2) {
      // 8. Yeni token ile getme başarısız olursa (yeni token geçersiz vb.)
      console.error(
        "Yeni token ile kullanıcı verisi alınamadı. Oturum kapatılıyor.",
        err2.response?.data
      );
      store.dispatch(logout());
      return false;
    }
  }
}
