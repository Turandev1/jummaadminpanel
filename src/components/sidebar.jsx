// src/components/common/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import useAuth from "../redux/authredux";
import { fonts } from "../../fonts";

const Sidebar = () => {
  const location = useLocation();
  const { role } = useAuth();

  // Role'e göre menü öğeleri
  const menuItems = {
    admin: [
      { to: "/admin", label: "Admin panel" },
      { to: "/admin/iane", label: "Ianə" },
      { to: "/admin/qeydiyyat", label: "Qeydiyyat" },
      { to: "/admin/mescids", label: "Mescidler" },
      { to: "/admin/ianeqoy", label: "Iane qoy" },
      { to: "/admin/dailycounter", label: "Sayaç" },
      // { to: "/admin/users", label: "İstifadəçilər" },
      // { to: "/admin/admins", label: "Adminlər" },
    ],
    imam: [
      { to: "/imam", label: "İmam paneli" },
      { to: "/imam/ianeqoy", label: "Ianə" },
      // { to: "/imam/messages", label: "Mesajlar" },
    ],
    satici: [
      { to: "/satici", label: "Profil" },
      { to: "/satici/statistika", label: "Statistika" },
      { to: "/satici/addproduct", label: "Məhsul əlavə et" },
      { to: "/satici/products", label: "Məhsullar" },
      { to: "/satici/orders", label: "Sifarişlər" },
    ],
  };

  const currentMenu = menuItems[role] || [];

  return (
    <div className="w-64 h-screen hidden sm:flex bg-gray-800 text-white flex-col px-6 pt-16">
      <h2 className="text-xl font-semibold mb-6 text-center capitalize">
        {role || "Panel"}
      </h2>

      <nav className="flex flex-col gap-2">
        {currentMenu.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{fontFamily:fonts.meriendasemi}}
            className={clsx(
              "p-2 rounded duration-300 text-xl hover:bg-gray-700",
              location.pathname === item.to && "bg-gray-700"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
