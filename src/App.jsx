// src/App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import "react-toastify/ReactToastify.css";
import Mainrouter from "./routes/mainrouter";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import useAuth from "./redux/authredux";
import { useDispatch } from "react-redux";
import { initAuth } from "./utils/authservice";
import { onMessageListener, requestForToken } from "../firebase";
import { useState } from "react";

function App() {
  const { logout } = useAuth();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Səhifə yüklənəndə tokeni istəyirik
    requestForToken();

    // Sayt açıq olanda bildiriş gəlsə:
    onMessageListener()
      .then((payload) => {
        alert(`${payload.notification.title}: ${payload.notification.body}`);
      })
      .catch((err) => console.log("Xəta: ", err));
  }, []);

  useEffect(() => {
    const kontrolet = async () => {
      try {
        const ok = await initAuth();
        if (!ok) {
          // initAuth onsuz da logout edir, amma hər ehtimala qarşı:
          dispatch(logout());
        }
      } catch (error) {
        console.error("Auth check failed", error);
        dispatch(logout());
      } finally {
        // İstər uğurlu olsun, istər xəta -> Yüklənməni bitir
        setIsLoading(false);
      }
    };
    kontrolet();
  }, [dispatch]);

  // Əgər yoxlama hələ bitməyibsə, ekranı göstərmə (və ya Loading spinner qoy)
  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
      >
        Yüklənir...
      </div>
    );
  }

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
