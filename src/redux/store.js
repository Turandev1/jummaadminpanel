// src/redux/store.js
import { configureStore, createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  role: localStorage.getItem("role") || null,
  accessToken: localStorage.getItem("accessToken") || null,
};

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
