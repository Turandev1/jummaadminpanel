import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import mescidaglogo from "../../assets/mescidag.png";
import axios from "axios";
import { API_URLS } from "../../utils/api";
import { Navigate, useNavigate } from "react-router-dom";
import useGetClientInfo from "../../components/osinfo";
import {
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  LockKeyhole,
  User,
  Mail,
  Lock,
  ArrowLeftCircle,
  ArrowRightCircle,
  ArrowRight,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { setauthdata } from "../../redux/store";
import api from "../../utils/axiosclient";

const SaticiRegister = ({ setView }) => {
  const [showpassword, setshowpassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  // const enabled=formData.name||formData.surname||formData.email||formData.password

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(API_URLS.SATICI.SATICISIGNUP, {
        ad: formData.name,
        soyad: formData.surname,
        email: formData.email,
        password: formData.password,
      });

      const data = res.data;

      if (data.success) {
        toast.success("Qeydiyyat uğurla başa çatdı. Hesabınıza daxil olun", {
          autoClose: 3000,
        });
      }
      setView("login");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.hata || "Qeydiyyat zamanı xəta baş verdi"
      );
    }
  };

  return (
    <div className="w-full flex justify-center items-center mt-8 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-green-100">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
          Satıcı Qeydiyyatı
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-600">Ad</label>
            <div className="flex items-center bg-gray-100 gap-2 border rounded-lg px-3 py-2 focus-within:border-green-500 transition">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Adınızı daxil edin"
                className="w-full outline-none text-gray-700"
                required
              />
            </div>
          </div>

          {/* Surname */}
          <div>
            <label className="text-sm font-medium text-gray-600">Soyad</label>
            <div className="flex items-center bg-gray-100 gap-2 border rounded-lg px-3 py-2 focus-within:border-green-500 transition">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Soyadınızı daxil edin"
                className="w-full outline-none text-gray-700"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <div className="flex items-center bg-gray-100 gap-2 border rounded-lg px-3 py-2 focus-within:border-green-500 transition">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email daxil edin"
                className="w-full outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-600">Şifrə</label>
            <div className="flex items-center bg-gray-100 gap-2 border rounded-lg px-3 py-2 focus-within:border-green-500 transition">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showpassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Şifrənizi daxil edin"
                className="w-full outline-none"
                required
              />
              <button
                className="cursor-pointer"
                type="button"
                onClick={() => setshowpassword(!showpassword)}
              >
                {showpassword ? "Gizlə" : "Göstər"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full cursor-pointer bg-green-600 text-white py-2 rounded-lg text-lg font-medium hover:bg-green-700 transition-all"
          >
            Qeydiyyat
          </button>
        </form>

        {/* Register CTA */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => setView("login")}
            className="text-green-600 flex flex-row justify-center gap-x-5 text-xl border rounded-2xl mt-4 py-2 w-full cursor-pointer font-semibold hover:text-green-700 hover:scale-110 transition-all"
          >
            Əsas səhifəyə qayıt
            <ArrowRight size={30} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Satıcı Login

const SaticiLogin = ({ setView }) => {
  const [loading, setLoading] = useState(false);
  const { browser, os } = useGetClientInfo();
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        API_URLS.SATICI.LOGIN,
        {
          email: form.email,
          password: form.password,
          isWeb: true,
          os,
          browser,
          platform: "web",
        },
        { withCredentials: true }
      );
      const data = res.data;

      toast.success(`Giriş uğurludur. Xoş gəldin ${data?.user?.ad}`);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("role", data.user.role);

      dispatch(
        setauthdata({
          user: data.user,
          role: "satici",
          accessToken: data.accessToken,
        })
      );

      navigate("/satici");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.hata || "Giriş başarısız!");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !form.email || !form.password;

  return (
    <div className="max-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-50 pt-14 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-green-100 shadow-2xl rounded-2xl p-8">
        <div className="flex flex-col items-center">
          <div className="bg-green-600 text-white p-3 rounded-full mb-3 shadow-md">
            <LockKeyhole size={28} />
          </div>
          <h2 className="text-3xl font-bold text-center text-green-700 mb-2">
            Satıcı Girişi
          </h2>
          <p className="text-center text-gray-500 mb-6 text-sm">
            Hesabınıza giriş etmək üçün bilgilərinizi daxil edin
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              E-poçt ünvanı
            </label>
            <input
              type="email"
              name="email"
              placeholder="ornək@satici.com"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-200 duration-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-md p-3 outline-none transition-all"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Şifrə
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-200 duration-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-md p-3 outline-none transition-all pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-green-500 transition"
              >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isDisabled || loading}
            className={`flex text-2xl items-center justify-center gap-2 cursor-pointer bg-green-600 text-white font-medium py-3 rounded-md transition-all ${
              isDisabled || loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-green-700 hover:scale-[1.02]"
            }`}
          >
            {loading ? (
              <span className="animate-pulse">Giriş edilir...</span>
            ) : (
              <>
                <LogIn size={24} /> Giriş et
              </>
            )}
          </button>
        </form>
        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-600"></div>
          <span className="text-gray-400 text-sm">və ya</span>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>

        {/* Register CTA */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-gray-600">Hesabın yoxdur?</span>
          <button
            type="button"
            onClick={() => setView("register")}
            className="text-green-600 cursor-pointer font-semibold hover:text-green-800 hover:scale-110 transition-all"
          >
            Qeydiyyatdan keç
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          © {new Date().getFullYear()} Satıcı Paneli
        </p>
      </div>
    </div>
  );
};

// Admin Login
const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Admin login fonksiyonu çalıştı");

    try {
      setLoading(true);
      const res = await axios.post(API_URLS.ADMIN.ADMINLOGIN, form, {
        withCredentials: true,
      });
      const data = res.data;
      console.log("user:", data.user);
      console.log("data:", data);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("role", data?.user?.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch(
        setauthdata({
          user: data.user,
          role: data?.user?.role,
          accessToken: data?.accessToken,
        })
      );
      navigate("/admin");
      toast.success("Giriş başarılı!");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.hata || "Giriş başarısız!");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !form.email || !form.password;

  return (
    <div className="max-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50 px-4 pt-14">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-600 text-white p-3 rounded-full mb-3 shadow-md">
            <LockKeyhole size={28} />
          </div>
          <h2 className="text-3xl text-gray-800 tracking-tight">
            Admin Girişi
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-poppins">
            Admin panelinə çatmaq üçün admin bilgilərinizi daxil edin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Input */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              E-poçt ünvanı
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@sayt.com"
              required
              autoComplete="email"
              className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-md p-3 outline-none transition-all"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Şifrə
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-md p-3 outline-none transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-3 text-gray-500 hover:text-green-500 transition"
              >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isDisabled || loading}
            className={`flex items-center justify-center gap-2 text-2xl bg-green-600 text-white font-medium py-3 rounded-md transition-all ${
              isDisabled || loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-green-700 hover:scale-[1.02]"
            }`}
          >
            {loading ? "Giriş edilir..." : "Giriş et"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6 tracking-tight">
          © {new Date().getFullYear()} Admin Paneli
        </p>
      </div>
    </div>
  );
};

// Home Component
export default function Home() {
  const [view, setView] = useState("login"); // home | login | register
  const [activeRole, setActiveRole] = useState("satici");

  const roles = [
    { key: "satici", label: "Satıcı" },
    { key: "admin", label: "Admin" },
  ];

  const renderContent = () => {
    if (view === "register") return <SaticiRegister setView={setView} />;

    if (view === "login")
      return (
        <>
          {/* Switch Buttons */}
          <div className="flex gap-6 mt-6 w-full max-w-md justify-center">
            {roles.map((role) => (
              <button
                key={role.key}
                onClick={() => setActiveRole(role.key)}
                className={`pb-2 px-4 text-lg font-medium transition-all cursor-pointer duration-300 ${
                  activeRole === role.key
                    ? "border-b-4 border-green-600"
                    : "border-b-4 border-gray-300"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          {/* Login Form */}
          <div className="w-full">
            {activeRole === "satici" ? (
              <SaticiLogin setView={setView} />
            ) : (
              <AdminLogin />
            )}
          </div>
        </>
      );
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center">
      <nav className="h-20 w-full flex items-center justify-center bg-green-500">
        <img src={mescidaglogo} alt="logo" className="h-16" />
      </nav>

      {renderContent()}
    </div>
  );
}
