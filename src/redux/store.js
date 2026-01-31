// src/redux/store.js
import {
  configureStore,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  role: localStorage.getItem("role") || null,
  accessToken: localStorage.getItem("accessToken") || null,
};

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, getState }) => {
    const { auth } = getState();
    try {
      if (auth.role && auth.user) {
        const userId = auth.user.id || auth.user._id;
        await axios.post(
          `${API_BASE_URL}/webapi/${auth.role}/adminpanellogout`,
          { userId },
          { withCredentials: true }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Nəticədən asılı olmayaraq lokal məlumatları silirik
      dispatch(logout());
      // Lazım olsa yönləndirmə bura da qoyula bilər
    }
  }
);

const authslice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setauthdata: (state, action) => {
      const { user, role, accessToken } = action.payload;

      if (user !== undefined) {
        state.user = { ...state.user, ...user };
        localStorage.setItem("user", JSON.stringify(state.user));
      }

      if (role !== undefined) {
        state.role = role;
        localStorage.setItem("role", state.role);
      }

      if (accessToken !== undefined) {
        state.accessToken = accessToken;
        localStorage.setItem("accessToken", state.accessToken);
      }
    },

    clearAuthData: (state) => {
      state.user = null;
      state.accessToken = null;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.accessToken = null;
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("accessToken");
    },
  },
});

export const { setauthdata, logout, clearAuthData } = authslice.actions;

const store = configureStore({
  reducer: {
    auth: authslice.reducer,
  },
});

export default store;
