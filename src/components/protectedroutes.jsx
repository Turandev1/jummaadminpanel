// src/components/common/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import useAuth from "../redux/authredux";

const ProtectedRoute = ({ allowedRole, children }) => {
  const { role, user } = useAuth();

  if (!role || !user) {
    return <Navigate to="/" replace />;
  } // login değilse anasayfaya

  
  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  } // rol uyuşmuyorsa da

  return children;
};

export default ProtectedRoute;
