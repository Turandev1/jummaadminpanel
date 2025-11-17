import axios from "axios";
import store from "../redux/store";
import { logout, setauthdata } from "../redux/store";
import { API_BASE_URL } from "./api";

export async function refreshAccessToken() {
  const state = store.getState().auth;
  try {
    // refresh token cookie’de olduğundan ayrıca body göndermiyoruz
    const res = await axios.post(
      `${API_BASE_URL}/webapi/${state.role}/refreshToken`,
      {},
      { withCredentials: true }
    );

    return res.data?.accessToken || null;
  } catch (err) {
    // admin refresh olmadıysa satıcıyı deneyelim
    console.error(err);
    console.log("error:", err.response.data.hata);
  }
}

export async function initAuth() {
  const state = store.getState().auth;

  if (!state?.accessToken) return false;

  try {
    console.log("role:", state.role);
    const res = await axios.get(`${API_BASE_URL}/webapi/${state.role}/getme`, {
      headers: {
        Authorization: `Bearer ${state.accessToken}`,
      },
    });

    if (res.data?.success) return true;
    console.log("sdadksdkd");
    const newAccess = await refreshAccessToken();
    console.log("newaccesstoken:", newAccess);
    if (!newAccess) {
      store.dispatch(logout());
      return false;
    }

    store.dispatch(
      setauthdata({
        user: res.data.user,
        role: state.role,
        accessToken: newAccess,
      })
    );

    return true;
  } catch (err) {
    // token expired → refresh dene
    console.log('err:',err.response?.data)
    const newAccess = await refreshAccessToken();
    if (!newAccess) {
      store.dispatch(logout());
      return false;
    }

    const res2 = await axios.get(`${API_BASE_URL}/webapi/${state.role}/getme`, {
      headers: { Authorization: `Bearer ${newAccess}` },
    });

    store.dispatch(
      setauthdata({
        user: res2.data.user,
        role: res2.data.role,
        accessToken: newAccess,
      })
    );

    return true;
  }
}
