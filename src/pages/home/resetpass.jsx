import { useState } from "react";
import {
  Mail,
  LockKeyhole,
  Loader2,
  KeyRound,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { API_URLS } from "../../utils/api";
import api from "../../utils/axiosclient";
import { useNavigate } from "react-router-dom";
// Bu importları kendi projenizdeki yollara göre ayarlayın
// import api from '../utils/axiosClient';
// import { API_URLS } from '../utils/api';

// Dummy API istemcisi ve URL'ler varsayımı

const Resetpass = () => {
  const [step, setStep] = useState("email"); // 'email', 'code', 'new_password', 'success'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showpassword, setshowpassword] = useState(false);
  const [showconfirmpassword, setshowconfirmpassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Step 1: E-posta Gönderme ---
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!form.email) return toast.error("E-poçt sahəsi doldurulmalıdır.");

    try {
      setLoading(true);
      // API_URLS.SATICI.SEND_CODE endpoint'ine e-posta gönderilir
      const res = await api.post(API_URLS.SATICI.SEND_CODE, {
        email: form.email,
      });

      if (res.data?.success) {
        toast.success("Doğrulama kodu e-poçt ünvanınıza göndərildi.");
        setStep("code");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.hata || "Kod göndərmə uğursuzdur!");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Kodu Doğrulama ---
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (form.code.length !== 6)
      return toast.error("Doğrulama kodu 6 haneli olmalıdır.");

    try {
      setLoading(true);
      // API_URLS.SATICI.VERIFY_CODE endpoint'ine e-posta ve kod gönderilir
      const res = await api.post(API_URLS.SATICI.VERIFY_CODE, {
        email: form.email,
        code: form.code,
      });

      if (res.data?.success) {
        toast.success("Kod doğrulandı. Yeni şifrenizi belirleyebilirsiniz.");
        setStep("new_password");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.hata || "Kod doğrulama başarısız!");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3: Şifreyi Sıfırlama ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (form.password.length < 6)
      return toast.error("Şifre en az 6 simvol olmalıdır.");
    if (form.password !== form.confirmPassword)
      return toast.error("Şifreler eşleşmiyor.");

    try {
      setLoading(true);
      // API_URLS.SATICI.RESET_PASSWORD endpoint'ine gerekli bilgiler gönderilir
      const res = await api.post(API_URLS.SATICI.RESET_PASSWORD, {
        email: form.email,
        code: form.code, // Güvenlik için kodu tekrar gönderiyoruz
        password: form.password,
      });

      if (res.data?.success) {
        toast.success(
          "Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz."
        );
        setStep("success");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.hata || "Şifre sıfırlama başarısız!");
    } finally {
      setLoading(false);
    }
  };

  // --- UI Render Fonksiyonları ---

  const renderTitle = () => {
    switch (step) {
      case "email":
        return "E-poçt ünvanınızı girin";
      case "code":
        return "Doğrulama kodunu yazın";
      case "new_password":
        return "Yeni şifrənizi yazın";
      case "success":
        return "Uğurlu";
      default:
        return "Şifrə Sıfırlama";
    }
  };

  const renderIcon = () => {
    switch (step) {
      case "email":
        return <Mail size={28} />;
      case "code":
        return <KeyRound size={28} />;
      case "new_password":
        return <LockKeyhole size={28} />;
      case "success":
        return <CheckCircle size={28} />;
      default:
        return <LockKeyhole size={28} />;
    }
  };

  const renderContent = () => {
    switch (step) {
      case "email":
        return (
          <form onSubmit={handleSendCode} className="space-y-6">
            <p className="text-gray-500 text-sm mb-4 text-center">
              Hesabınızla əlaqələndirilmiş e-poçt ünvanını yazın. Sizə bir
              doğrulama kodu göndəriləcək.
            </p>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3.5 text-green-500"
                size={20}
              />
              <input
                type="email"
                name="email"
                placeholder="satıcı@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:border-green-500 rounded-lg outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center cursor-pointer gap-2 py-3 text-lg font-semibold rounded-lg transition-all 
                ${
                  loading
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 shadow-md"
                }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <KeyRound size={20} />
              )}
              {loading ? "Kod Göndərilir..." : "Kod Göndər"}
            </button>
          </form>
        );

      case "code":
        return (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <p className="text-gray-500 text-sm mb-4 text-center">
              <span className="font-semibold text-green-600">{form.email}</span>{" "}
              ünvanınıza 6 rəqəmli bir kod gönderdik. Zəhmət olmasa kodu yazın.
            </p>
            <div className="relative">
              <KeyRound
                className="absolute left-3 top-3.5 text-green-500"
                size={20}
              />
              <input
                type="text"
                name="code"
                placeholder="6 xanalı kod"
                value={form.code}
                onChange={handleChange}
                maxLength={6}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border text-center text-xl font-mono tracking-widest border-gray-300 focus:border-green-500 rounded-lg outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || form.code.length !== 6}
              className={`w-full flex items-center cursor-pointer justify-center gap-2 py-3 text-lg font-semibold rounded-lg transition-all 
                ${
                  loading || form.code.length !== 6
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 shadow-md"
                }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <CheckCircle size={20} />
              )}
              {loading ? "Doğrulanır..." : "Kodu Doğrula"}
            </button>
            <p className="text-center text-sm text-gray-400">
              Kodu almadınızmı?{" "}
              <button
                type="button"
                onClick={handleSendCode}
                className="text-green-600 cursor-pointer hover:text-green-700 font-medium"
              >
                Təkrar göndər
              </button>
            </p>
          </form>
        );

      case "new_password":
        return (
          <div className="space-y-6">
            <p className="text-gray-500 text-sm mb-4 text-center">
              Yeni şifrəniz ən az 6 rəqəm və ya hərfdən ibarət olmalıdır və
              güclü bir parol seçməlisiniz.
            </p>
            {/* Yeni Şifre */}
            <div className="relative">
              <LockKeyhole
                className="absolute left-3 top-3.5 text-green-500"
                size={20}
              />
              <input
                type={showpassword ? "text" : "password"}
                name="password"
                placeholder="Yeni Şifre (Min 6 simvol)"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:border-green-500 rounded-lg outline-none transition-all"
                required
              />
              <button
                className="absolute right-5 top-3 cursor-pointer transition-all duration-300 hover:text-green-500"
                onClick={() => setshowpassword(!showpassword)}
              >
                {showpassword ? "Gizlət" : "Göstər"}
              </button>
            </div>

            {/* Şifre Doğrulama */}
            <div className="relative">
              <LockKeyhole
                className="absolute left-3 top-3.5 text-green-500"
                size={20}
              />
              <input
                type={showconfirmpassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Şifreyi Tekrar Girin"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:border-green-500 rounded-lg outline-none transition-all"
                required
              />
              <button
                className="absolute right-5 top-3 cursor-pointer transition-all duration-300 hover:text-green-500"
                onClick={() => setshowconfirmpassword(!showconfirmpassword)}
              >
                {showconfirmpassword ? "Gizlət" : "Göstər"}
              </button>
            </div>

            <button
              type="submit"
              onClick={handleResetPassword}
              disabled={
                loading ||
                form.password !== form.confirmPassword ||
                form.password.length < 6
              }
              className={`w-full flex items-center cursor-pointer justify-center gap-2 py-3 text-lg font-semibold rounded-lg transition-all 
                ${
                  loading ||
                  form.password !== form.confirmPassword ||
                  form.password.length < 6
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 shadow-md"
                }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <LockKeyhole size={20} />
              )}
              {loading ? "Şifrə sıfırlanır..." : "Şifrəni sıfırla"}
            </button>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="text-green-500 mx-auto" size={60} />
            <h3 className="text-2xl font-bold text-green-700">
              Proses uğurla başa çatdı!
            </h3>
            <p className="text-gray-600">Şifrəniz uğurla dəyişdirildi.</p>
            {/* Buraya useNavigate ile Giriş sayfasına yönlendirme eklenebilir. */}
            <button
              onClick={() => navigate("/")}
              className="mt-4 bg-green-600 cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
            >
              Giriş səhifəsinə get
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-xl p-8 transition-all duration-500 ease-in-out">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4 shadow-lg">
            {renderIcon()}
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
            {renderTitle()}
          </h2>
          <div className="text-sm font-medium text-gray-400 flex justify-center gap-2">
            <span>
              Addım{" "}
              {step === "email"
                ? 1
                : step === "code"
                ? 2
                : step === "new_password"
                ? 3
                : 4}
              /3
            </span>
            {step !== "success" && (
              <span className="text-green-500">
                {step === "email"
                  ? "E-poçt"
                  : step === "code"
                  ? "Kod"
                  : "Şifrə"}
              </span>
            )}
          </div>
        </div>

        {/* Content/Form */}
        {renderContent()}

        {/* Footer Linki */}
        {step === "email" && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-gray-500 hover:text-green-600 cursor-pointer hover:scale-110 transition-all"
            >
              Giriş səhifəsinə geri qayıt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resetpass;
