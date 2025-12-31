// src/components/common/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import useAuth from "../redux/authredux";
import { fonts } from "../../fonts";
// İkonların import edilməsi
import {
  LayoutDashboard,
  HeartHandshake,
  UserPlus,
  Building2,
  PlusCircle,
  MessageSquare,
  Users,
  ShoppingBag,
  Hash,
  User,
  PackagePlus,
  Package,
  ShieldCheck,
  MessageCircle,
  MessageCircleCode,
  MessageCirclePlus,
  MessagesSquare,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const { role } = useAuth();

  // Role görə menyu elementləri və ikonlar
  const menuItems = {
    admin: [
      { to: "/admin", label: "Admin panel", icon: LayoutDashboard },
      { to: "/admin/iane", label: "Ianə", icon: HeartHandshake },
      { to: "/admin/qeydiyyat", label: "Qeydiyyat", icon: UserPlus },
      { to: "/admin/mescids", label: "Mescidlər", icon: Building2 },
      { to: "/admin/ianeqoy", label: "Iane qoy", icon: PlusCircle },
      {
        to: "/admin/istifadecimesajlari",
        label: "Müraciətlər",
        icon: MessagesSquare,
      },
      { to: "/admin/sellers", label: "Satıcılar", icon: Users },
      { to: "/admin/orders", label: "Sifarişlər", icon: ShoppingBag },
      { to: "/admin/dailycounter", label: "Sayaç", icon: Hash },
    ],
    imam: [
      { to: "/imam", label: "İmam paneli", icon: ShieldCheck },
      { to: "/imam/ianeqoy", label: "Ianə", icon: HeartHandshake },
    ],
    satici: [
      { to: "/satici", label: "Profil", icon: User },
      { to: "/satici/addproduct", label: "Məhsul əlavə et", icon: PackagePlus },
      { to: "/satici/products", label: "Məhsullar", icon: Package },
      { to: "/satici/orders", label: "Sifarişlər", icon: ShoppingBag },
    ],
  };

  const currentMenu = menuItems[role] || [];

  return (
    <div className="w-64 h-screen hidden sm:flex bg-gray-900 text-gray-100 flex-col px-4 pt-10 border-r border-gray-700">
      <div className="mb-10 px-2">
        <h2 className="text-2xl font-bold tracking-wider text-blue-400 capitalize">
          {role || "Panel"}
        </h2>
        <p className="text-xs text-gray-500 mt-1">Xoş gəlmisiniz</p>
      </div>

      <nav className="flex flex-col gap-1">
        {currentMenu.map((item) => {
          const Icon = item.icon; // İkonu komponent kimi istifadə edirik
          const isActive = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              style={{ fontFamily: fonts.poppinslight }}
              className={clsx(
                "flex items-center gap-3 p-3 rounded-lg duration-200 group",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-gray-800 text-gray-400 hover:text-white"
              )}
            >
              <Icon
                size={20}
                className={clsx(
                  "duration-200",
                  isActive
                    ? "text-white"
                    : "text-gray-500 group-hover:text-blue-400"
                )}
              />
              <span className="text-[17px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Alt hissədə əlavə nəsə (məsələn çıxış düyməsi) qoymaq üçün boşluq */}
      <div className="mt-auto mb-6 px-2">
        <div className="h-[1px] bg-gray-800 w-full mb-4" />
        <p className="text-[10px] text-gray-600 text-center">
          © 2025 İdarəetmə Paneli
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
