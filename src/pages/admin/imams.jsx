import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URLS } from "../../utils/api";
import useAuth from "../../redux/authredux";
import api from "../../utils/axiosclient";
// ... (mevcut import'lar)
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";

const Imams = () => {
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [mescids, setmescids] = useState([]);
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchmescidler = async () => {
      try {
        const res = await api.get(API_URLS.ADMIN.GETMESCIDS, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setmescids(res.data?.mescids);
      } catch (error) {
        console.error(error);
      }
    };
    fetchmescidler();
  }, []);

  const updateLocation = (newLocation) => {
    setEditData((prev) => ({
      ...prev,
      mescid: {
        ...prev.mescid,
        location: newLocation,
      },
    }));
  };

  const handleEdit = (mescid) => {
    if (editId === mescid._id) {
      setEditId(null);
      return;
    }
    setEditId(mescid._id);
    setEditData(mescid);
  };

  // Mevcut handleChange'i koruyun.
  const handleChange = (e, field) => {
    setEditData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Yeni: TimePicker'dan gelen DayJS objesini işlemek için
  const handleTimeChange = (newTime, field) => {
    // newTime DayJS objesidir. 'HH:mm' formatına çevirip state'e kaydediyoruz.
    const formattedTime = newTime ? dayjs(newTime).format("HH:mm") : "";
    setEditData((prev) => ({ ...prev, [field]: formattedTime }));
  };
  // 💾 Kaydet (her alanı ayrı ayrı güncelle)
  const handleSave = async () => {
    try {
      const { name, surname, email, mescidname, azan, xutbe, namaz, mescid } =
        editData;

      const res = await api.patch(
        `${API_URLS.ADMIN.EDITMESCID}/${editId}`,
        {
          name,
          surname,
          email,
          mescidname,
          azan,
          xutbe,
          namaz,
          mescid: { location: mescid?.location }, // alt alan
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log("Güncellendi:", res.data);

      // Frontend state güncelle
      const updatedMescid = res.data?.updatedMescid;
      const updated = mescids.map((m) =>
        m._id === editId ? updatedMescid : m
      );

      setmescids(updated);
      setEditId(null);
    } catch (err) {
      console.error("Güncelleme hatası:", err);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto my-10">
      <h2 className="text-2xl font-bold text-center mb-4">Məscidlər</h2>

      {mescids.map((mescid) => {
        const isEditing = editId === mescid._id;

        return (
          <div
            key={mescid._id}
            className={`border rounded-lg shadow transition-all mx-4 duration-300 overflow-hidden ${
              isEditing ? "bg-blue-50" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-center px-4">
              <div>
                <p className="font-semibold text-lg">
                  Imam:{mescid.name || ""} {mescid.surname || ""}
                </p>

                <p className="text-base text-gray-600">
                  Mescid:{mescid.mescidname || ""} — Unvan:
                  {mescid.mescid?.location || ""}
                </p>
              </div>
              {/* Switch Toggle */}
              <div className="h-full">
                <div className="flex items-center justify-center gap-2 my-2">
                  <span className="text-lg font-medium">Aktiflik:</span>
                  <button
                    onClick={async () => {
                      try {
                        const updatedStatus = !mescid.isActive;
                        setmescids((prev) =>
                          prev.map((m) =>
                            m._id === mescid._id
                              ? { ...m, isActive: updatedStatus }
                              : m
                          )
                        );
                        // Backend'e PATCH isteği
                        await api.patch(
                          `${API_URLS.ADMIN.ACTIVATEMESCID}/${mescid._id}`,
                          {
                            isActive: updatedStatus,
                          }
                        );
                      } catch (error) {
                        console.error("Durum güncellenemedi:", error);
                      }
                    }}
                    className={`relative inline-flex h-6 w-12 items-center cursor-pointer rounded-full transition ${
                      mescid.isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        mescid.isActive ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => handleEdit(mescid)}
                  className="bg-blue-500 cursor-pointer text-white w-full py-1 mb-2 rounded hover:bg-blue-600 text-lg transition"
                >
                  {isEditing ? "Kapat" : "Değiştir"}
                </button>
              </div>
            </div>

            {isEditing && (
              <div className="p-4 border-t bg-white flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Ad
                    </label>
                    <input
                      value={editData.name || ""}
                      onChange={(e) => handleChange(e, "name")}
                      placeholder="İsim"
                      className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none duration-300 transition-all ease-in-out"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Soyad
                    </label>
                    <input
                      value={editData.surname || ""}
                      onChange={(e) => handleChange(e, "surname")}
                      placeholder="Soyisim"
                      className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none duration-300 transition-all ease-in-out"
                    />
                  </div>

                  {/* <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      E-posta
                    </label>
                    <input
                      value={editData.email || ""}
                      onChange={(e) => handleChange(e, "email")}
                      placeholder="Email"
                      type="email"
                      className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
                    />
                  </div> */}

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Məscid adı
                    </label>
                    <input
                      value={editData.mescidname || ""}
                      onChange={(e) => handleChange(e, "mescidname")}
                      placeholder="Camii Adı"
                      className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none duration-300 transition-all ease-in-out"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Konum
                    </label>
                    <input
                      value={editData.mescid?.location || ""}
                      onChange={(e) => updateLocation(e.target.value)}
                      placeholder="Konum"
                      className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none duration-300 transition-all ease-in-out"
                    />
                  </div>

                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="tr"
                  >
                    {/* ⏰ Azan Saati (TimePicker) */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Azan Saatı
                      </label>
                      <MobileTimePicker
                        minutesStep={1}
                        value={
                          editData.azan ? dayjs(editData.azan, "HH:mm") : null
                        }
                        onChange={(newTime) =>
                          handleTimeChange(newTime, "azan")
                        }
                        label="Azan Saati"
                        slotProps={{
                          textField: { size: "small", fullWidth: true },
                        }}
                        ampm={false} // 24 saat formatı için
                      />
                    </div>

                    {/* ⏰ Xutbe Saati (TimePicker) */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Xutbə Saatı
                      </label>
                      <MobileTimePicker
                        minutesStep={1}
                        value={
                          editData.xutbe ? dayjs(editData.xutbe, "HH:mm") : null
                        }
                        onChange={(newTime) =>
                          handleTimeChange(newTime, "xutbe")
                        }
                        label="Xutbe Saati"
                        slotProps={{
                          textField: { size: "small", fullWidth: true },
                        }}
                        ampm={false}
                      />
                    </div>

                    {/* ⏰ Namaz Saati (TimePicker) */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Namaz Saatı
                      </label>
                      <MobileTimePicker
                        minutesStep={1}
                        value={
                          editData.namaz ? dayjs(editData.namaz, "HH:mm") : null
                        }
                        onChange={(newTime) =>
                          handleTimeChange(newTime, "namaz")
                        }
                        label="Namaz Saati"
                        slotProps={{
                          textField: { size: "small", fullWidth: true },
                        }}
                        ampm={false}
                      />
                    </div>
                  </LocalizationProvider>
                </div>

                <div className="flex justify-end mt-4 gap-2">
                  <button
                    onClick={() => setEditId(null)}
                    className="px-3 py-1 rounded cursor-pointer bg-gray-300 hover:bg-gray-400 transition text-sm"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 rounded cursor-pointer bg-green-500 hover:bg-green-600 text-white transition text-sm"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Imams;
