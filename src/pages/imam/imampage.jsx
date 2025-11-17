import React, { useState } from "react";
import { API_URLS } from "../../utils/api";
import { toast } from "react-toastify";
import useAuth from "../../redux/authredux";

const Imampage = () => {
  const { user, logout, editimamacc } = useAuth();
  const [editable, setEditable] = useState(false);
  const [isloading, setisloading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
    phone: user?.phone || "",
    mescid: user?.mescid?.name || "",
    location: user?.mescid?.location || "",
    latitude: user?.mescid?.latitude || "",
    longitude: user?.mescid?.longitude || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setisloading(true);
    try {
      const res = await editimamacc(
        formData.name,
        formData.surname,
        formData.email,
        formData.phone,
        formData.mescid,
        formData.location,
        formData.latitude,
        formData.longitude
      );

      if (res.success) {
        toast.success(res.message || "Bilgiler başarıyla güncellendi ✅");
        setEditable(false);
      } else {
        // Backend mesajı varsa onu göster, yoksa default
        toast.error(res.message || "Güncelleme başarısız ❌");
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      // Backend hata mesajı varsa onu göster, yoksa default
      const backendMsg = error.response?.data?.message || error.message;
      toast.error(backendMsg || "Bir hata oluştu!");
    } finally {
      setisloading(false);
    }

    setEditable(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      surname: user?.surname || "",
      email: user?.email || "",
      phone: user?.phone || "",
      mescid: user?.mescid?.name || "",
      location: user?.mescid?.location || "",
      latitude: user?.mescid?.latitude || "",
      longitude: user?.mescid?.longitude || "",
    });
    setEditable(false);
  };

  return (
    <div className="bg-gray-100 p-6 flex flex-col items-center justify-start w-full">
      <div className="w-full">
        {/* logout button */}
        <div className="w-full mt-4 flex justify-end">
          <button
            onClick={logout}
            className="border cursor-pointer w-28 h-10 ease-in-out transition-all hover:text-white hover:bg-red-500 hover:rounded-3xl"
          >
            Çıxış et
          </button>
        </div>

        <div>
          {/* Bilgiler */}
          <h1 className="text-3xl font-bold mb-6">İmam Bilgileri</h1>
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl">
            <div className="flex flex-col gap-4">
              <div>
                {editable ? (
                  <div>
                    <label className="font-semibold text-gray-700">Ad:</label>
                    <input
                      type="text"
                      placeholder="Ad yaz"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border px-2 py-1 rounded mt-1"
                    />
                  </div>
                ) : (
                  <div className="flex flex-row">
                    <label className="font-semibold text-gray-700">Ad:</label>
                    <p className="ml-1">{formData.name}</p>
                  </div>
                )}
              </div>

              <div>
                {editable ? (
                  <div>
                    <label className="font-semibold text-gray-700">
                      Soyad:
                    </label>
                    <input
                      type="text"
                      name="surname"
                      placeholder="Soyad yaz"
                      value={formData.surname}
                      onChange={handleChange}
                      className="w-full border px-2 py-1 rounded mt-1"
                    />
                  </div>
                ) : (
                  <div className="flex flex-row">
                    <label className="font-semibold text-gray-700">
                      Soyad:
                    </label>
                    <p className="ml-1">{formData.surname}</p>
                  </div>
                )}
              </div>

              <div>
                {editable ? (
                  <div>
                    <label className="font-semibold text-gray-700">
                      Email:
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border px-2 py-1 rounded mt-1"
                    />
                  </div>
                ) : (
                  <div className="flex flex-row">
                    <label className="font-semibold text-gray-700">
                      Email:
                    </label>
                    <p className="ml-1">{formData.email}</p>
                  </div>
                )}
              </div>

              <div>
                {editable ? (
                  <div>
                    <label className="font-semibold text-gray-700">
                      Telefon Nömrəsi:
                    </label>
                    <input
                      type="number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border px-2 py-1 rounded mt-1"
                    />
                  </div>
                ) : (
                  <div className="flex flex-row">
                    <label className="font-semibold text-gray-700">
                      Telefon Nömrəsi:
                    </label>
                    <p className="ml-1">{formData.phone}</p>
                  </div>
                )}
              </div>

              <div>
                {editable ? (
                  <div>
                    <label className="font-semibold text-gray-700">
                      Məscid:
                    </label>
                    <input
                      type="text"
                      name="mescid"
                      value={formData.mescid}
                      onChange={handleChange}
                      className="w-full border px-2 py-1 rounded mt-1"
                    />
                  </div>
                ) : (
                  <div className="flex flex-row">
                    <label className="font-semibold text-gray-700">
                      Məscid:
                    </label>
                    <p className="ml-1">{formData.mescid}</p>
                  </div>
                )}
              </div>

              <div>
                {editable ? (
                  <div>
                    <label className="font-semibold text-gray-700">
                      Məscidin məkanı:
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full border px-2 py-1 rounded mt-1"
                    />
                  </div>
                ) : (
                  <div className="flex flex-row">
                    <label className="font-semibold text-gray-700">
                      Məscidin məkanı:
                    </label>
                    <p className="ml-1">{formData.location}</p>
                  </div>
                )}
              </div>

              <div>
                {editable ? (
                  <div>
                    <label className="font-semibold text-gray-700">
                      Latitude:
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      className="w-full border px-2 py-1 rounded mt-1"
                    />
                  </div>
                ) : (
                  <div className="flex flex-row">
                    <label className="font-semibold text-gray-700">
                      Latitude:
                    </label>
                    <p className="ml-1">{formData.latitude}</p>
                  </div>
                )}
              </div>

              <div>
                {editable ? (
                  <div>
                    <label className="font-semibold text-gray-700">
                      Longitude:
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      className="w-full border px-2 py-1 rounded mt-1"
                    />
                  </div>
                ) : (
                  <div className="flex flex-row">
                    <label className="font-semibold text-gray-700">
                      Longitude :
                    </label>
                    <p className="ml-1">{formData.longitude}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Butonlar */}
            <div className="mt-6 flex gap-2">
              {!editable ? (
                <button
                  onClick={() => setEditable(true)}
                  className="w-full bg-blue-500 cursor-pointer text-white py-2 rounded hover:bg-blue-600"
                >
                  Dəyiştir
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-green-500 cursor-pointer text-white py-2 rounded hover:bg-green-600"
                  >
                    {isloading ? "Qeyd edilir..." : "Qeyd et"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-300 cursor-pointer text-black py-2 rounded hover:bg-gray-400"
                  >
                    Ləğv et
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Imampage;
