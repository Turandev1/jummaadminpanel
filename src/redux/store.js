// src/redux/store.js
import { configureStore, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  role: localStorage.getItem("role") || null,
  accessToken: localStorage.getItem("accessToken") || null,
};



export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, rejectWithValue,getState }) => {
    try {
      const state=getState()
      const role=state.auth.role
      console.log('role',role)
      // 1. Backend-ə logout sorğusu göndəririk
      await axios.post(
        `${API_BASE_URL}/webapi/${role}/adminpanellogout`,
        {},
        { withCredentials: true } // Cookie göndərmək üçün mütləqdir
      );
      
      // 2. Uğurlu olsa, lokal təmizləməni işə salırıq
      dispatch(logout()); 
      return true;

    } catch (error) {
      // API xəta versə belə (məs: internet yoxdur), istifadəçini localdan çıxarmalıyıq
      dispatch(logout());
      return rejectWithValue(error.response?.data || "Xəta baş verdi");
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
