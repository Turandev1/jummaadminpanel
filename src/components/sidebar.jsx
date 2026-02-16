// src/components/common/Sidebar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import useAuth from "../redux/authredux";
import { fonts } from "../../fonts";
import {
  LayoutDashboard,
  HeartHandshake,
  UserPlus,
  PlusCircle,
  Users,
  ShoppingBag,
  Hash,
  User,
  Package,
  ShieldCheck,
  MessagesSquare,
  LucidePackagePlus,
  ChevronLeft,  // Yeni ikon
  ChevronRight,
  ExpandIcon,
  ListCollapseIcon, // Yeni ikon
} from "lucide-react";
import { PiMosqueLight } from "react-icons/pi";
import { IoIosSend } from "react-icons/io";
import { GiArabicDoor } from "react-icons/gi";
import { TbLayoutSidebarLeftCollapseFilled, TbLayoutSidebarLeftExpand } from "react-icons/tb";

const Sidebar = () => {
  const location = useLocation();
  const { role } = useAuth();
  
  // Localstorage-dan vəziyyəti oxuyuruq
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true"; // Localstorage string saxladığı üçün müqayisə edirik
  });

  // Vəziyyət dəyişəndə localstorage-a yazırıq
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isCollapsed);
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const menuItems = {
    admin: [
      { to: "/admin", label: "Admin panel", icon: LayoutDashboard },
      { to: "/admin/iane", label: "İanələr", icon: HeartHandshake },
      { to: "/admin/qeydiyyat", label: "Qeydiyyat", icon: UserPlus },
      { to: "/admin/mescids", label: "Mescidlər", icon: PiMosqueLight },
      { to: "/admin/namazgahlar", label: "Namazgahlar", icon: GiArabicDoor },
      { to: "/admin/ianeqoy", label: "Iane qoy", icon: PlusCircle },
      { to: "/admin/istifadecimesajlari", label: "Müraciətlər", icon: MessagesSquare },
      { to: "/admin/sellers", label: "Satıcılar", icon: Users },
      { to: "/admin/orders", label: "Sifarişlər", icon: ShoppingBag },
      { to: "/admin/sendnotifications", label: "Bildiriş göndər", icon: IoIosSend },
      { to: "/admin/dailycounter", label: "Sayaç", icon: Hash },
    ],
    imam: [
      { to: "/imam", label: "İmam paneli", icon: ShieldCheck },
      { to: "/imam/ianeqoy", label: "İanələr", icon: HeartHandshake },
    ],
    satici: [
      { to: "/satici", label: "Profil", icon: User },
      { to: "/satici/addproduct", label: "Məhsul əlavə et", icon: LucidePackagePlus },
      { to: "/satici/products", label: "Məhsullar", icon: Package },
      { to: "/satici/orders", label: "Sifarişlər", icon: ShoppingBag },
    ],
  };

  const currentMenu = menuItems[role] || [];

  return (
    <div
      className={clsx(
        "h-screen hidden sm:flex bg-gray-900 text-gray-100 flex-col pt-10 border-r border-gray-700 transition-all duration-300 relative",
        isCollapsed ? "w-16 px-2" : "w-64 px-4" // w-14 çox dar ola bilər deyə w-16 tövsiyə edilir
      )}
    >
      {/* Collapse Düyməsi */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-12 bg-blue-400 text-white rounded-xl p-1 border-2 border-gray-900 hover:bg-blue-600 transition-colors z-50"
      >
        {isCollapsed ? <TbLayoutSidebarLeftExpand size={22} /> : <TbLayoutSidebarLeftCollapseFilled size={22} />}
      </button>

      {/* Header Hissəsi */}
      <div className={clsx("mb-10 px-2 transition-all", isCollapsed && "items-center flex flex-col")}>
        <h2 className={clsx(
          "font-bold tracking-wider text-blue-400 capitalize transition-all",
          isCollapsed ? "text-xs" : "text-2xl"
        )}>
          {isCollapsed ? role?.[0] : role || "Panel"}
        </h2>
        {!isCollapsed && <p className="text-xs text-gray-500 mt-1">Xoş gəlmisiniz</p>}
      </div>

      {/* Naviqasiya */}
      <nav className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
        {currentMenu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : ""} // Bağlı olanda üzərinə gələndə ad görünsün
              style={{ fontFamily: fonts.poppinslight }}
              className={clsx(
                "flex items-center gap-3 p-3 rounded-lg duration-200 group relative",
                isActive
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-blue-800 text-gray-400 hover:text-white",
                isCollapsed && "justify-center"
              )}
            >
              <Icon
                size={22}
                className={clsx(
                  "duration-200 min-w-[22px]",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-gray-100"
                )}
              />
              {!isCollapsed && (
                <span className="text-[17px] whitespace-nowrap overflow-hidden transition-opacity duration-300">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Alt hissə */}
      <div className="mt-auto mb-6 px-2">
        <div className="h-[1px] bg-gray-800 w-full mb-4" />
        <p className={clsx("text-[10px] text-gray-600 text-center", isCollapsed && "hidden")}>
          © 2025 İdarəetmə Paneli
        </p>
      </div>
    </div>
  );
};

export default Sidebar;