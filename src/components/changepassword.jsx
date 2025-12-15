import { useState } from "react";
import { toast } from "react-toastify";
import api from "../utils/axiosclient";
import { API_URLS } from "../utils/api";

const ChangePassword = ({ defaultEmail }) => {
  const [form, setForm] = useState({
    email: defaultEmail || "",
    password: "",
    newpassword: "",
    confirmpassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { email, password, newpassword, confirmpassword } = form;

    // ---- VALIDATION ----
    if (!email || !password || !newpassword || !confirmpassword) {
      return toast.error("Bütün sahələri doldurun.");
    }

    if (newpassword.length < 6) {
      return toast.error("Yeni şifrə minimum 6 simvol olmalıdır.");
    }

    if (newpassword !== confirmpassword) {
      return toast.error("Yeni şifrələr uyğun gəlmir.");
    }

    try {
      setLoading(true);

      const res = await api.post(API_URLS.SATICI.CHANGE_PASSWORD, {
        email,
        password,
        newpassword,
        confirmpassword,
      });

      const data = res.data;

      if (data.success) {
        toast.success("Şifrə uğurla dəyişdirildi.");

        setForm({
          ...form,
          password: "",
          newpassword: "",
          confirmpassword: "",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Şifrə dəyişdirilə bilmədi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mt-8">
      <h2 className="text-lg font-semibold mb-4">Şifrəni dəyiş</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* EMAIL */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            placeholder="Email"
          />
        </div>

        {/* OLD PASSWORD */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Köhnə şifrə</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            placeholder="Köhnə şifrə"
          />
        </div>

        {/* NEW PASSWORD */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Yeni şifrə</label>
          <input
            type="password"
            name="newpassword"
            value={form.newpassword}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            placeholder="Yeni şifrə"
          />
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm text-gray-600 mb-1">
            Yeni şifrə (təkrar)
          </label>
          <input
            type="password"
            name="confirmpassword"
            value={form.confirmpassword}
            onChange={handleChange}
            className="border rounded-md px-3 py-2"
            placeholder="Yeni şifrəni təkrar edin"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 bg-indigo-600 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-indigo-800 transition disabled:opacity-50"
      >
        {loading ? "Dəyişdirilir..." : "Şifrəni dəyiş"}
      </button>
    </div>
  );
};

export default ChangePassword;
