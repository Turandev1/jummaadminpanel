// src/App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import "react-toastify/ReactToastify.css";
import Mainrouter from "./routes/mainrouter";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import useAuth from "./redux/authredux";
import { useDispatch } from "react-redux";
import { initAuth } from "./utils/authservice";

function App() {
  const { logout } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    const kontrolet = async () => {
      const ok = await initAuth();
      if (!ok) dispatch(logout());
    };
    kontrolet();
  }, []); // Bağımlılık dizisi boş olduğu için sadece mount edildiğinde çalışır

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        style={{ zIndex: 200000 }}
      />

      <BrowserRouter>
        <Mainrouter />
      </BrowserRouter>
    </>
  );
}

export default App;
