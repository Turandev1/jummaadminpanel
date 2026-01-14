import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAuth from "../../redux/authredux";
import { API_URLS } from "../../utils/api";
import { useDispatch } from "react-redux";
import {  logoutUser, setauthdata } from "../../redux/store";
import api from "../../utils/axiosclient";

const Adminpage = () => {
  const { user, accessToken } = useAuth();
  const [editable, setEditable] = useState(false);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    surname: "",
    email: "",
    username: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const editadmin = async (id, name, surname, email, username) => {
    try {
      const res = await api.patch(
        API_URLS.ADMIN.EDITADMIN,
        {
          id,
          name,
          surname,
          email,
          username,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      return res.data;
    } catch (err) {
      console.error("Edit admin errr:", err);
      throw err;
    }
  };

  const handleSave = async () => {
    try {
      const res = await editadmin(
        formData.id,
        formData.name,
        formData.surname,
        formData.email,
        formData.username
      );

      if (res?.success) {
        dispatch(
          setauthdata({
            user: res?.admin || formData,
            role: "admin",
          })
        );
        toast.success("Bilgilər uğurla dəyişdirildi");
      } else {
        toast.error("Xəta baş verdi");
      }
    } catch (error) {
      console.error(error);
      toast.error("server xetasi");
    } finally {
      setEditable(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      surname: user?.surname || "",
      email: user?.email || "",
      username: user?.username || "",
    });
    setEditable(false);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        id: user._id,
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        username: user.username || "",
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 transition-all">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">👑 Admin Paneli</h1>
          <button
            onClick={() => dispatch(logoutUser())}
            className="px-4 py-2 bg-red-500 text-white rounded-lg cursor-pointer hover:bg-red-600 transition"
          >
            Çıxış et
          </button>
        </div>

        {/* Info Section */}
        <div className="space-y-5">
          <div>
            <label className="block text-gray-600 mb-1 font-medium">Ad</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!editable}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                editable
                  ? "border-blue-400 focus:ring-2 focus:ring-blue-300"
                  : "bg-gray-100 border-gray-200 cursor-not-allowed"
              }`}
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Soyad
            </label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              disabled={!editable}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                editable
                  ? "border-blue-400 focus:ring-2 focus:ring-blue-300"
                  : "bg-gray-100 border-gray-200 cursor-not-allowed"
              }`}
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={!editable}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                editable
                  ? "border-blue-400 focus:ring-2 focus:ring-blue-300"
                  : "bg-gray-100 border-gray-200 cursor-not-allowed"
              }`}
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">
              E-posta
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!editable}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                editable
                  ? "border-blue-400 focus:ring-2 focus:ring-blue-300"
                  : "bg-gray-100 border-gray-200 cursor-not-allowed"
              }`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          {!editable ? (
            <button
              onClick={() => setEditable(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition cursor-pointer"
            >
              Bilgiləri Dəyiş
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition cursor-pointer"
              >
                Qeyd et
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer"
              >
                Ləğv et
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Adminpage;
