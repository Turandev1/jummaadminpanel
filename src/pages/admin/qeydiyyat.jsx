import React, { useState } from "react";
import axios from "axios";
import { API_URLS } from "../../utils/api";
import { toast } from "react-toastify";
import useAuth from "../../redux/authredux";
import api from "../../utils/axiosclient";

const Mescidqeyd = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [mescid, setMescid] = useState("");
  const [loading, setLoading] = useState(false);

  const mescidQeydet = async (e) => {
    e.preventDefault();

    if (!name || !surname || !mescid) {
      toast.warn("Bütün xanaları doldurun.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(API_URLS.ADMIN.MESCIDQEYDET, {
        name,
        surname,
        mescid,
      });

      if (res.data?.success) {
        toast.success(res.data.mesaj || "Qeydiyyat uğurludur");
        setName("");
        setSurname("");
        setMescid("");
      } else {
        toast.error(res.data?.mesaj || "Qeydiyyat uğursuzdur");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server xətası baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-50">
      <form
        onSubmit={mescidQeydet}
        className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Mescid Qeydiyyatı
        </h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ad"
          className="border px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          placeholder="Soyad"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          className="border px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          placeholder="Mescid adı"
          value={mescid}
          onChange={(e) => setMescid(e.target.value)}
          className="border px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          disabled={loading}
          className={`py-2 rounded-lg text-white transition cursor-pointer ${
            loading
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Göndərilir..." : "Qeyd et"}
        </button>
      </form>
    </div>
  );
};

const SaticiSignup = () => {
  const [ad, setad] = useState("");
  const [soyad, setsoyad] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  const saticiqeydiyyat = async (e) => {
    e.preventDefault();

    if (!ad || !soyad || !email || !password) {
      toast.warn("Bütün xanaları doldurun.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        API_URLS.ADMIN.SATICISIGNUP,
        {
          ad,
          soyad,
          email,
          password,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (res.data?.success) {
        toast.success(res.data.mesaj || "Qeydiyyat uğurludur");
        setad("");
        setsoyad("");
        setemail("");
        setpassword("");
      } else {
        toast.error(res.data?.hata || "Qeydiyyat uğursuzdur");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server xətası baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-50">
      <form
        onSubmit={saticiqeydiyyat}
        className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Satici Qeydiyyatı
        </h2>

        <input
          type="text"
          value={ad}
          onChange={(e) => setad(e.target.value)}
          placeholder="Ad"
          className="border px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          placeholder="Soyad"
          value={soyad}
          onChange={(e) => setsoyad(e.target.value)}
          className="border px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setemail(e.target.value)}
          className="border px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div>
          <input
            type="text"
            placeholder="Password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            className="border px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`py-2 rounded-lg text-white transition cursor-pointer ${
            loading
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Göndərilir..." : "Qeyd et"}
        </button>
      </form>
    </div>
  );
};

const AdminSignup = () => {
  const [name, setad] = useState("");
  const [surname, setsoyad] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();
  const [username, setusername] = useState("");

  const adminqeydiyyat = async (e) => {
    e.preventDefault();

    if (!name || !surname || !email || !password) {
      toast.warn("Bütün xanaları doldurun.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.put(
        API_URLS.ADMIN.ADMINSIGNUP,
        {
          name,
          surname,
          email,
          password,
          username,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (res.data?.success) {
        toast.success(res.data.mesaj || "Qeydiyyat uğurludur");
        setad("");
        setsoyad("");
        setemail("");
        setpassword("");
        setusername('')
      } else {
        toast.error(res.data?.hata || "Qeydiyyat uğursuzdur");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server xətası baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-50">
      <form
        onSubmit={adminqeydiyyat}
        className="bg-white p-6 rounded-2xl shadow-md flex flex-col gap-4 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Admin Qeydiyyatı
        </h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setad(e.target.value)}
          placeholder="Ad"
          className="border px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          placeholder="Soyad"
          value={surname}
          onChange={(e) => setsoyad(e.target.value)}
          className="border px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          autoComplete="email"
          placeholder="Username"
          value={username}
          onChange={(e) => setusername(e.target.value)}
          className="border px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setemail(e.target.value)}
          className="border px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div>
          <input
            type="text"
            placeholder="Password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            className="border px-3 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`py-2 rounded-lg text-white transition cursor-pointer ${
            loading
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {loading ? "Göndərilir..." : "Qeyd et"}
        </button>
      </form>
    </div>
  );
};

const Qeydiyyat = () => {
  const [role, setRole] = useState("imam");

  const renderLogin = () => {
    switch (role) {
      case "imam":
        return <Mescidqeyd />;
      case "admin":
        return <AdminSignup />;
      case "satici":
        return <SaticiSignup />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex justify-center gap-8">
        <button
          onClick={() => setRole("imam")}
          className={`px-4 py-2 rounded cursor-pointer ${
            role === "imam" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Mescid
        </button>
        <button
          onClick={() => setRole("admin")}
          className={`px-4 py-2 rounded cursor-pointer ${
            role === "admin" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Admin
        </button>
        <button
          onClick={() => setRole("satici")}
          className={`px-4 py-2 rounded cursor-pointer ${
            role === "satici" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Satıcı
        </button>
      </nav>

      {/* Login/Signup bölümü */}
      <div className="flex-1 flex items-center justify-center p-6">
        {renderLogin()}
      </div>
    </div>
  );
};

export default Qeydiyyat;
