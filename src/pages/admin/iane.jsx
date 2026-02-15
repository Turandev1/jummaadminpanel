import React, { useEffect, useState } from "react";
import { API_URLS } from "../../utils/api";
import useAuth from "../../redux/authredux";
import api from "../../utils/axiosclient";
import { toast } from "react-toastify";

const Iane = () => {
  // State-lər
  const [ianeler, setIaneler] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [deletemenu, setDeletemenu] = useState(null); // ID saxlamaq üçün 'null' istifadə edilir
  const { accessToken } = useAuth();

  const sortIaneler = (list) => {
    // Görülməyənlər (isread: false) yuxarıda olsun
    return [...list].sort((a, b) => (a.isread ? 1 : 0) - (b.isread ? 1 : 0));
  };

  useEffect(() => {
    const fetchIaneler = async () => {
      try {
        const res = await api.get(API_URLS.ADMIN.GETIANELER, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const allIaneler = res.data?.imams || [];

        const sorted = sortIaneler(allIaneler);
        setIaneler(sorted);
      } catch (err) {
        console.error("İanələri gətirmə xətası:", err);
      }
    };
    fetchIaneler();
  }, []);

  const deleteiane = async (id) => {
    try {
      await api.delete(
        `${API_URLS.ADMIN.DELETEIANE}/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      toast.success("Uğurla silindi");
      // DB'den sildikten sonra state'i güncelle
      setIaneler((prev) => prev.filter((iane) => iane._id !== id));
      setDeletemenu(null); // Modal'ı kapat
      // Yenilənmiş siyahını gətirmək üçün fetchIaneler() çağırıla bilər, lakin filterləmək kifayət olmalıdır.
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const updateIaneStatusLocally = (id, key, value) => {
    setIaneler((prev) => {
      const updated = prev.map((iane) =>
        iane._id === id ? { ...iane, [key]: value } : iane,
      );
      // isread dəyişəndə sıralama yenilənməlidir
      if (key === "isread") return sortIaneler(updated);
      return updated;
    });
  };

  // Görüldü/Görülmədi
  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(
        `${API_URLS.ADMIN.MARKASREAD}/${id}`,
        {},

        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      updateIaneStatusLocally(id, "isread", true);
    } catch (err) {
      console.error("Görüldü işarələmə xətası:", err);
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      await api.patch(
        `${API_URLS.ADMIN.MARKASUNREAD}/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      updateIaneStatusLocally(id, "isread", false);
    } catch (err) {
      console.error("Görülmədi işarələmə xətası:", err);
    }
  };

  // Qəbul etmə/Rədd etmə/Bitdi
  const handleApprove = async (id) => {
    try {
      await api.patch(
        `${API_URLS.ADMIN.APPROVEIANE}/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      updateIaneStatusLocally(id, "status", "approved");
    } catch (err) {
      console.error("Qəbul etmə xətası:", err);
    }
  };

  const handlereject = async (id) => {
    try {
      await api.patch(
        `${API_URLS.ADMIN.REJECTIANE}/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      updateIaneStatusLocally(id, "status", "rejected");
    } catch (err) {
      console.error("Rədd etmə xətası:", err);
    }
  };

  const handleComplete = async (id, currentState) => {
    try {
      const newState = currentState === "completed" ? "continue" : "completed";
      await api.patch(
        `${API_URLS.ADMIN.MARKASCOMPLETED}/${id}`,
        {
          status: newState,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      updateIaneStatusLocally(id, "state", newState);
    } catch (err) {
      console.error("Bitdi/Devam xətası:", err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id],
    );
  };

  // Rəng və Mətn Funksiyaları
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-700 border border-green-300";
      case "rejected":
        return "bg-red-100 text-red-700 border border-red-300";
      case "completed":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  const statusText = (status) => {
    switch (status) {
      case "continue":
        return "Davam edir";
      case "completed":
        return "Bitdi";
      default:
        return "Bilinmir";
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900 border-b-4 border-indigo-500 pb-2">
        🕌 İanələr Paneli
      </h1>

      <div className="space-y-4">
        {ianeler.length === 0 && (
          <p className="text-center text-gray-500 text-xl py-10">
            Hal-hazırda heç bir ianə yoxdur.
          </p>
        )}

        {ianeler.map((iane) => {
          const expanded = expandedIds.includes(iane._id);
          const statusBadgeClass = getStatusBadge(iane.status);
          // const isCompleted = iane.status === "completed";

          return (
            <div
              key={iane._id}
              className={`
                p-5 mb-4 border-t-4 rounded-xl shadow-lg transition-all duration-300 ease-in-out
                ${
                  iane.isread
                    ? "bg-white border-gray-200 hover:shadow-xl" // Oxunmuş
                    : "bg-blue-50 border-indigo-500 hover:shadow-2xl" // Yeni/Oxunmamış
                }
                ${expanded ? "ring-2 ring-indigo-300" : ""}
              `}
            >
              {/* 💻 Əsas Sətir */}
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Başlıq, Mövzu və Yeni Etiketi */}
                <div className="col-span-12 md:col-span-3 flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-1">
                      {iane.basliq}
                    </h2>
                    {!iane.isread && (
                      <span className="text-xs font-semibold bg-indigo-600 text-white px-2 py-0.5 rounded-full w-fit animate-pulse">
                        YENİ
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                    {iane.movzu}
                  </p>
                </div>

                {/* İmam & Məscid */}
                <div className="hidden lg:block col-span-2 text-sm text-gray-700 truncate">
                  <p className="font-semibold truncate">{iane.imamname}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {iane.mescid}
                  </p>
                </div>

                {/* Məbləğ & Tarix */}
                <div className="col-span-6 md:col-span-2 text-right items-center flex flex-col">
                  <p className="font-extrabold text-2xl text-indigo-600">
                    {iane.yigilanmebleg || 0} ₼
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(iane.createdAt).toLocaleDateString("az-AZ", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="col-span-5 md:col-span-3 text-center">
                  <span
                    className={`text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider ${statusBadgeClass}`}
                  >
                    {statusText(iane.state)}
                  </span>
                </div>

                {/* Genişləndir Düyməsi */}
                <div className="col-span-1 md:col-span-2 flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(iane._id);
                    }}
                    className="p-2 ml-4 rounded-full cursor-pointer bg-indigo-100 hover:bg-indigo-200 transition text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label={expanded ? "Gizlət" : "Genişləndir"}
                  >
                    <svg
                      className={`w-6 h-6 transform transition-transform duration-300 ${
                        expanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* --- Genişləndirilmiş Detaylar və Əməliyyat Paneli --- */}
              {expanded && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-sm">
                    {/* Detal Qrup 1: Əsas Məlumat */}
                    <div className="lg:col-span-2 space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-extrabold text-lg text-gray-700 mb-2 border-b pb-1">
                        📋 Ətraflı Məlumat
                      </h4>
                      <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">
                          İmam:
                        </span>{" "}
                        {iane.imamname} {iane.imamsurname}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">
                          Məscid:
                        </span>{" "}
                        {iane.mescid}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">
                          Yaradılma:
                        </span>{" "}
                        {new Date(iane.createdAt).toLocaleString("az-AZ")}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">
                          Yenilənmə:
                        </span>{" "}
                        {new Date(iane.updatedAt).toLocaleString("az-AZ")}
                      </p>
                    </div>

                    {/* Əməliyyatlar Qrupu */}
                    <div className="lg:col-span-2 flex flex-col gap-3 p-4 bg-white rounded-lg border shadow-sm">
                      <h4 className="font-extrabold text-lg text-gray-700 mb-2 border-b pb-1">
                        ⚙️ Əməliyyatlar
                      </h4>

                      {/* Sıra 2: Qəbul/Rədd & Bitdi Butonu */}
                      <div className="flex gap-3">
                        {/* Bitdi / Devam edir Butonu */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComplete(iane._id, iane.state);
                          }}
                          className={`flex-1 text-base cursor-pointer px-4 py-2 rounded-xl transition font-semibold shadow-md ${
                            iane.state === "completed"
                              ? "bg-gray-500 hover:bg-gray-600 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {iane.state === "completed"
                            ? "🔄 Davam etdir"
                            : "✅ Ianeni bitir"}
                        </button>
                      </div>

                      {/* Sıra 3: Dəyiş/Sil (Diqqətli Əməliyyatlar) */}
                      <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                        <button className="flex-1 px-4 py-2 cursor-pointer rounded-xl hover:bg-indigo-500 duration-300 bg-indigo-400 text-white text-base font-semibold shadow-md">
                          📝 Dəyiş
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletemenu(iane._id);
                          }}
                          className="flex-1 px-4 py-2 cursor-pointer rounded-xl bg-red-600 text-white hover:bg-red-700 duration-300 text-base font-semibold shadow-md"
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Şəkillər Seksiyası */}
                  {iane.photos && iane.photos.length > 0 && (
                    <div className="mt-8 pt-5 border-t border-gray-200">
                      <h4 className="font-extrabold text-lg mb-4 text-gray-700">
                        🖼️ Şəkillər ({iane.photos.length}):
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        {iane.photos.map((photo, index) => (
                          <div
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPhoto(photo);
                            }}
                            className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-4 border-white hover:border-indigo-500 transition shadow-lg transform hover:scale-105"
                          >
                            <img
                              src={photo.url}
                              alt={photo.name || "İanə şəkli"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Şəkil Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-5xl w-full flex flex-col items-center border">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-20 bg-white cursor-pointer text-gray-900 rounded-full w-10 h-10 md:w-12 md:h-12 text-2xl font-bold hover:bg-gray-200 transition shadow-lg flex items-center justify-center"
            >
              ✕
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="rounded-xl max-h-[85vh] object-contain shadow-2xl border-4 border-white"
            />
            <p className="text-white mt-4 text-base font-medium text-center">
              {selectedPhoto.name}
            </p>
          </div>
        </div>
      )}

      {/* Silmə Təsdiqi Modal */}
      {deletemenu && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center transform scale-100 transition-transform duration-300">
            <div className="mb-4 text-red-500 text-5xl">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Silməyi Təsdiqləyin
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              **Bu ianəni silmək istədiyinizə əminsinizmi?** Silindikdən sonra
              geri qaytarıla bilməz.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletemenu(null);
                }}
                className="px-6 py-2 cursor-pointer rounded-xl bg-gray-200 hover:bg-gray-300 transition font-semibold text-gray-700"
              >
                Ləğv et
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteiane(deletemenu);
                }}
                className="px-6 py-2 cursor-pointer rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-semibold shadow-lg"
              >
                
                Bəli, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Iane;
