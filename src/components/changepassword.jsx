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
  const [showoldpass, setshowoldpass] = useState(false);
  const [shownewpass, setshownewpass] = useState(false);
  const [showconfirmpass, setshowconfirmpass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enableform, setenableform] = useState(false);

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

      const res = await api.patch(API_URLS.SATICI.CHANGEPASSWORD, {
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
    <div className="bg-white shadow-lg rounded-xl p-6 mt-8 mb-20 relative">
      <h2 className="text-lg font-semibold mb-4">Şifrəni dəyiş</h2>

      <button
        onClick={() => setenableform(true)}
        className={`absolute right-5 top-3 px-8 py-2 cursor-pointer hover:scale-110 duration-200 transition-all rounded-full bg-indigo-500 text-white ${
          enableform ? "hidden" : ""
        }`}
      >
        DƏYİŞ
      </button>

      <form
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          enableform ? "" : "opacity-50"
        }`}
      >
        {/* EMAIL */}
        <div className="flex flex-col md:col-span-1">
          <label className="text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            name="email"
            autoComplete="off"
            value={form.email}
            disabled={!enableform}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 outline-none focus:bg-green-100 focus:ring-2 focus:ring-green-400 duration-300 transition-all"
            placeholder="Email"
          />
        </div>

        {/* OLD PASSWORD */}
        <div className="flex relative flex-col">
          <label className="text-sm text-gray-600 mb-1">Köhnə şifrə</label>
          <input
            type={showoldpass ? "text" : "password"}
            name="password"
            value={form.password}
            autoComplete="off"
            onChange={handleChange}
            disabled={!enableform}
            className="border rounded-md px-3 py-2 outline-none focus:bg-green-100 focus:ring-2 focus:ring-green-400 duration-300 transition-all"
            placeholder="Köhnə şifrə"
          />
          <button
            type="button"
            disabled={!enableform}
            onClick={() => setshowoldpass(!showoldpass)}
            className="absolute right-3 bottom-3 cursor-pointer hover:scale-115 duration-300 transition-all ease-in-out"
          >
            {showoldpass ? "Gizlət" : "Göstər"}
          </button>
        </div>

        {/* NEW PASSWORD */}
        <div className="flex relative flex-col">
          <label className="text-sm text-gray-600 mb-1">Yeni şifrə</label>
          <input
            type={shownewpass ? "text" : "password"}
            name="newpassword"
            autoComplete="new-password"
            value={form.newpassword}
            onChange={handleChange}
            disabled={!enableform}
            className="border rounded-md px-3 py-2 outline-none focus:bg-green-100 focus:ring-2 focus:ring-green-400 duration-300 transition-all"
            placeholder="Yeni şifrə"
          />
          <button
            type="button"
            disabled={!enableform}
            onClick={() => setshownewpass(!shownewpass)}
            className="absolute right-3 bottom-3 cursor-pointer hover:scale-115 duration-300 transition-all ease-in-out"
          >
            {shownewpass ? "Gizlət" : "Göstər"}
          </button>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="flex relative flex-col md:col-span-1">
          <label className="text-sm text-gray-600 mb-1">
            Yeni şifrə (təkrar)
          </label>
          <input
            type={showconfirmpass ? "text" : "password"}
            name="confirmpassword"
            autoComplete="new-password"
            value={form.confirmpassword}
            onChange={handleChange}
            disabled={!enableform}
            className="border rounded-md px-3 py-2 outline-none focus:bg-green-100 focus:ring-2 focus:ring-green-400 duration-300 transition-all"
            placeholder="Yeni şifrəni təkrar edin"
          />
          <button
            type="button"
            disabled={!enableform}
            onClick={() => setshowconfirmpass(!showconfirmpass)}
            className="absolute right-3 bottom-3 cursor-pointer hover:scale-115 duration-300 transition-all ease-in-out"
          >
            {showconfirmpass ? "Gizlət" : "Göstər"}
          </button>
        </div>
      </form>

      <button
        onClick={handleSubmit}
        disabled={loading || !enableform}
        className={`mt-6 bg-indigo-600 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-indigo-800 transition disabled:opacity-50 ${
          enableform ? "" : "opacity-50"
        }`}
      >
        {loading ? "Dəyişdirilir..." : "Şifrəni dəyiş"}
      </button>
      <button
        onClick={() => setenableform(false)}
        disabled={loading || !enableform}
        className={`mt-6 bg-indigo-600 cursor-pointer text-white mx-6 px-6 py-2 rounded-lg hover:bg-indigo-800 transition disabled:opacity-50 ${
          enableform ? "" : "hidden"
        }`}
      >
        Ləğv et
      </button>
    </div>
  );
};

export default ChangePassword;
