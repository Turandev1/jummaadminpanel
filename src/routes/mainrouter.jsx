import { ToastContainer } from "react-toastify";
import React, { useEffect } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "../pages/home/home";
import Imampage from "../pages/imam/imampage";
import Saticipage from "../pages/satici/saticipage";
import Adminpage from "../pages/admin/adminpage";
import Sidebar from "../components/sidebar";
import ProtectedRoute from "../components/protectedroutes";
import Imammesaj from "../pages/imam/imammesaj";
import Ianeqoy from "../pages/imam/ianeqoy";
import Users from "../pages/admin/users";
import Iane from "../pages/admin/iane";
import Qeydiyyat from "../pages/admin/qeydiyyat";
import Dashboard from "../pages/satici/dashboard";
import Ianeyerlestir from "../pages/admin/ianeqoy";
import useAuth from "../redux/authredux";
import Sifarisler from "../pages/satici/sifarisler";
import Imams from "../pages/admin/imams";
import AddMehsul from "../pages/satici/addmehsul";
import Mehsullarr from "../pages/satici/mehsullarr";
import DailyCounter from "../pages/admin/dailycounter";
import Usermessages from "../pages/admin/usermessages";
import Resetpass from "../pages/home/resetpass";
import Saticilar from "../pages/admin/saticilar";
import Sifarisleradmin from "../pages/admin/sifarisler";
import Sendnotifications from "../pages/admin/sendnotifications";
import Namazgahlar from "../pages/admin/namazgahlar";

const DashboardLayout = () => {
  return (
    <div className="flex overflow-hidden h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export const ImamRoutes = () => (
  <Routes>
    <Route
      element={
        <ProtectedRoute allowedRole="imam">
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Imampage />} />
      <Route path="messages" element={<Imammesaj />} />
      <Route path="ianeqoy" element={<Ianeqoy />} />
      {/* imam alt sayfalar buraya */}
    </Route>
  </Routes>
);

export const AdminRoutes = () => (
  <Routes>
    <Route
      element={
        <ProtectedRoute allowedRole="admin">
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Adminpage />} />
      <Route path="users" element={<Users />} />
      <Route path="qeydiyyat" element={<Qeydiyyat />} />
      <Route path="iane" element={<Iane />} />
      <Route path="mescids" element={<Imams />} />
      <Route path="ianeqoy" element={<Ianeyerlestir />} />
      <Route path="istifadecimesajlari" element={<Usermessages />} />
      <Route path="dailycounter" element={<DailyCounter />} />
      <Route path="sellers" element={<Saticilar />} />
      <Route path="orders" element={<Sifarisleradmin />} />
      <Route path="sendnotifications" element={<Sendnotifications />} />
      <Route path="namazgahlar" element={<Namazgahlar />} />
      {/* admin alt sayfalar */}
    </Route>
  </Routes>
);

export const SaticiRoutes = () => (
  <Routes>
    <Route
      element={
        <ProtectedRoute allowedRole="satici">
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="statistika" element={<Saticipage />} />
      <Route path="addproduct" element={<AddMehsul />} />
      <Route path="products" element={<Mehsullarr />} />
      <Route path="orders" element={<Sifarisler />} />
      {/* satıcı alt sayfalar */}
    </Route>
  </Routes>
);

const Mainrouter = () => {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa yönlendirme yapma
    if (!user || !role) return;

    // Eğer zaten kendi rolünün rotasındaysa yönlendirme yapma
    if (
      (role === "imam" && location.pathname.startsWith("/imam")) ||
      (role === "admin" && location.pathname.startsWith("/admin")) ||
      (role === "satici" && location.pathname.startsWith("/satici"))
    ) {
      return;
    }

    // Eğer home veya başka yerdeyse, rolüne göre yönlendir
    if (role === "imam") navigate("/imam", { replace: true });
    else if (role === "admin") navigate("/admin", { replace: true });
    else if (role === "satici") navigate("/satici", { replace: true });
  }, [user, role, location.pathname, navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resetpassword" element={<Resetpass />} />
        {/* Login olmuşsa paneline yönlendir */}
        <Route
          path="panel"
          element={
            role === "imam" ? (
              <Navigate to="/imam" />
            ) : role === "admin" ? (
              <Navigate to="/admin" />
            ) : role === "satici" ? (
              <Navigate to="/satici" />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Korunan panel rotaları */}
        <Route path="/imam/*" element={<ImamRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/satici/*" element={<SaticiRoutes />} />
      </Routes>
    </>
  );
};

export default Mainrouter;
