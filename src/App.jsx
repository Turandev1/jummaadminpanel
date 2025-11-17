// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "react-toastify/ReactToastify.css";
import Mainrouter from "./routes/mainrouter";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import useAuth from "./redux/authredux";
import { useDispatch } from "react-redux";
import { initAuth } from "./utils/authservice";

// fonts.js
export const fonts = {
  meriendasemi: "merienda-semibold",
  oreganoregular: "oregano-regular",
  arimamedium: "arima-medium",
  loraitalic: "lora-italic-variable",
  loramediumitalic: "lora-medium-italic",
  lorabolditalic: "lora-bold-italic",
  arimabold: "arima-bold",
  interbolditalic: "inter-bold-italic",
  interlightitalic: "inter-light-italic",
};

function App() {
  const { logout } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    const kontrolet = async () => {
      const ok = await initAuth();
      if (!ok) dispatch(logout());
    };
    kontrolet();
  }, []);

  return (
    <BrowserRouter>
      <Mainrouter />
    </BrowserRouter>
  );
}

export default App;
