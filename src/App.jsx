// src/App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import "react-toastify/ReactToastify.css";
import Mainrouter from "./routes/mainrouter";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import useAuth from "./redux/authredux";
import { useDispatch } from "react-redux";
import { onMessageListener, requestForToken } from "../firebase";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import api from "./utils/axiosclient";
import { setauthdata } from "./redux/store";

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const { role } = useAuth();
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
    const checkuser = async () => {
      if (!role) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get(`/webapi/${role}/getme`);
        if (res.data.success) {
          dispatch(
            setauthdata({
              user: res.data.user,
              role: res.data.role,
            })
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    checkuser();
  }, [dispatch, role]);

  // Əgər yoxlama hələ bitməyibsə, ekranı göstərmə (və ya Loading spinner qoy)
  if (isLoading) {
    return (
      <div className="flex justify-center mt-20 gap-x-7">
        Yüklənir...
        <Loader2 className="animate-spin text-green-600" />
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
