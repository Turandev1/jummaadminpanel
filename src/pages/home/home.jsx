import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import mescidaglogo from "../../assets/mescidag.png";
import axios from "axios";
import { API_URLS } from "../../utils/api";
import { Navigate, useNavigate } from "react-router-dom";
import useGetClientInfo from "../../components/osinfo";
import { Eye, EyeOff, LogIn, ShieldCheck, LockKeyhole } from "lucide-react";
import { useDispatch } from "react-redux";
import { setauthdata } from "../../redux/store";

// İmam Login
const ImamLogin = () => {
  const { browser, os } = useGetClientInfo();
  const [loading, setloading] = useState(false);
  const [show, setshow] = useState(false);
  const navigate = useNavigate();
  const [form, setform] = useState({
    email: "",
    password: "",
  });

  const handlechange = (e) => {
    const { name, value } = e.target;
    setform((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("İmam login fonksiyonu çalıştı");

    try {
      setloading(true);
      const res = await axios.post(API_URLS.IMAM.IMAMLOGIN, {
        email: form.email,
        password: form.password,
        platform: "web",
        os,
        browser,
        isWeb: true,
      });

      const data = res.data;
      console.log("data:", data);

      localStorage.setItem("accessToken", data.accessToken),
        localStorage.setItem("role", data?.user?.role);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Giriş ugurludur");
      navigate("/imam");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.hata);
    } finally {
      setloading(false);
    }
  };

  const isdisabled = !form.email || !form.password;

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border">
      <h2 className="text-2xl font-bold text-center mb-6">İmam Girişi</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handlechange}
          autoComplete="email"
          className="border p-2 rounded-md  duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <div className="relative">
          <input
            name="password"
            onChange={handlechange}
            type={!show ? "password" : "text"}
            value={form.password}
            autoComplete="new-password"
            placeholder="Şifrə"
            className="border p-2 rounded-md w-full  duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              setshow(!show);
            }}
            className="absolute right-2 top-2 opacity-70 cursor-pointer"
          >
            {!show ? "Göstər" : "Gizle"}
          </button>
        </div>
        <button
          disabled={isdisabled}
          type="submit"
          className={`bg-green-500 cursor-pointer text-white p-2 rounded-md hover:bg-green-600 duration-200 ${
            isdisabled ? "opacity-50" : "opacity-100"
          }`}
        >
          {loading ? "Giriş edilir" : "Giriş et"}
        </button>
      </form>
    </div>
  );
};

// Satıcı Login

const SaticiLogin = () => {
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
      toast.success('Giriş uğurludur')
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
            className={`flex items-center justify-center gap-2 cursor-pointer bg-green-600 text-white font-medium py-3 rounded-md transition-all ${
              isDisabled || loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-green-700 hover:scale-[1.02]"
            }`}
          >
            {loading ? (
              <span className="animate-pulse">Giriş edilir...</span>
            ) : (
              <>
                <LogIn size={18} /> Giriş et
              </>
            )}
          </button>
        </form>

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
            className={`flex items-center justify-center gap-2 bg-green-600 text-white font-medium py-3 rounded-md transition-all ${
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
  const [activeRole, setActiveRole] = useState("satici");

  const roles = [
    { key: "satici", label: "Satıcı" },
    { key: "admin", label: "Admin" },
  ];

  const renderLogin = () => {
    switch (activeRole) {
      case "satici":
        return <SaticiLogin />;
      case "admin":
        return <AdminLogin />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center">
      <nav className="h-20 w-full flex items-center justify-center bg-green-500">
        <img src={mescidaglogo} alt="logo" className="h-16" />
      </nav>

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
      <div className="w-full">{renderLogin()}</div>
    </div>
  );
}
