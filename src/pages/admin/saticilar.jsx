import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URLS } from "../../utils/api";
import api from "../../utils/axiosclient";
import { toast } from "react-toastify";
import Detailmodal from "../../components/detailmodal";
import useAuth from "../../redux/authredux";

// Backend URL

export default function Saticilar() {
  const [saticilar, setSaticilar] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blockreason, setblockreason] = useState("");
  const [warningtitle, setwarningtitle] = useState("");
  const [warningbody, setwarningbody] = useState("");
  const [isblock, setisblock] = useState(false);
  const [iswarning, setiswarning] = useState(false);
  const [urunler, setUrunler] = useState([]);
  const [urunLoading, setUrunLoading] = useState(false);
  const [urunError, setUrunError] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [detailmodal, setdetailmodal] = useState(false);
  const [togllingid, settogllingid] = useState(null);
  const { user, accessToken } = useAuth();
  const [blockLoadingId, setBlockLoadingId] = useState(null);

  const fetchSaticiUrunleri = async (saticiId) => {
    const controller = new AbortController();
    try {
      setUrunLoading(true);
      setUrunError("");

      const res = await api.get(
        API_URLS.ADMIN.GETSATİCİPRODUCTS + `/${saticiId}`,
        { signal: controller.signal }
      );

      setUrunler(res.data.urunler || []);
    } catch (err) {
      console.error(err);
      setUrunError("Məhsullar yüklənmədi");
    } finally {
      setUrunLoading(false);
    }
    return controller.abort();
  };

  useEffect(() => {
    if (selected?._id) {
      setUrunler([]);
      fetchSaticiUrunleri(selected._id);
    }
  }, [selected]);

  const fetchSaticilar = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_URLS.ADMIN.GETSATICILAR);
      setSaticilar(res.data.saticilar);
    } catch (err) {
      console.error(err);
      setError("Satıcılar yüklənərkən xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  const block = async (saticiId) => {
    try {
      if (!saticiId) {
        toast.error("Satıcı seçilməyib");
        return;
      }

      if (!blockreason.trim()) {
        toast.error("Bloklama səbəbi yazılmalıdır");
        return;
      }

      if (selected?.blocked?.isBlocked) {
        toast.error("Bu satıcı artıq bloklanıb");
        return;
      }

      await api.patch(API_URLS.ADMIN.BLOCKSATICI, {
        saticiId,
        reason: blockreason,
      });

      // UI yenilə
      await fetchSaticilar();

      setSelected((prev) => ({
        ...prev,
        blocked: {
          isBlocked: true,
          reason: blockreason,
          blockedAt: new Date(),
        },
        isActive: false,
      }));

      setblockreason("");
      setisblock(false);

      toast.success("Satıcı bloklandı");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Satıcı bloklanarkən xəta baş verdi"
      );
    }
  };

  const unblock = async (saticiId) => {
    try {
      if (!saticiId) {
        toast.error("Satıcı seçilməyib");
        return;
      }

      if (!selected?.blocked?.isBlocked) {
        toast.error("Bu satıcı bloklu deyil");
        return;
      }

      await api.patch(API_URLS.ADMIN.BLOCKDANCIXART, {
        saticiId,
      });

      // UI yenilə
      await fetchSaticilar();

      setSelected((prev) => ({
        ...prev,
        blocked: {
          isBlocked: false,
          reason: null,
          blockedAt: null,
        },
        isActive: true,
      }));

      toast.success("Satıcı blokdan çıxarıldı");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Satıcı blokdan çıxarılarkən xəta baş verdi"
      );
    }
  };

  const warn = async (saticiId) => {
    try {
      if (!saticiId) {
        toast.error("Satıcı seçilməyib");
        return;
      }

      if (!warningtitle.trim() || !warningbody.trim()) {
        toast.error("Başlıq və mətn boş ola bilməz");
        return;
      }

      await api.patch(API_URLS.ADMIN.WARNSATICI, {
        saticiId,
        title: warningtitle,
        message: warningbody,
      });

      toast.success("Xəbərdarlıq göndərildi");

      setwarningtitle("");
      setwarningbody("");
      setiswarning(false);

      await fetchSaticilar();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Xəbərdarlıq göndərilərkən xəta baş verdi"
      );
    }
  };

  const openDetailModal = (mehsul) => {
    setEditingProduct(null); // ehtiyac varsa edit modal bağlanır
    setdetailmodal(mehsul);
  };

  const onToggleBlock = async (id, currentValue) => {
    // Double click engeli
    if (blockLoadingId === id) return;

    // Optimistic UI için eski değer
    const previousValue = currentValue;

    try {
      setBlockLoadingId(id);

      // 🔁 OPTIMISTIC UPDATE
      setUrunler((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isBlocked: !currentValue } : p))
      );

      const res = await api.patch(
        API_URLS.ADMIN.TOGGLEBLOCKPRODUCT,
        { productId: id },
        { timeout: 8000 } // UX: uzun bekleme kontrolü
      );

      toast.success(res?.data?.message || "Ürün blok durumu güncellendi");
    } catch (error) {
      // 🔙 ROLLBACK
      setUrunler((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isBlocked: previousValue } : p))
      );

      /* -------------------- HATA AYRIŞTIRMA -------------------- */

      // Network yok
      if (!error.response) {
        toast.error("İnternet bağlantısı yok");
      }
      // Yetki
      else if (error.response.status === 403) {
        toast.error("Bu işlem için yetkiniz yok");
      }
      // Bulunamadı
      else if (error.response.status === 404) {
        toast.error("Ürün bulunamadı");
      }
      // Backend mesajı
      else if (error.response.data?.message) {
        toast.error(error.response.data.message);
      }
      // Fallback
      else {
        toast.error("Bloklama uğursuzdur");
      }

      /* -------------------- GELİŞMİŞ LOG -------------------- */
      console.group("🔴 ToggleBlock Error");
      console.error("Product ID:", id);
      console.error("Error:", error);
      console.error("Response:", error.response);
      console.groupEnd();
    } finally {
      setBlockLoadingId(null);
    }
  };

  const handletogglestatus = async (id) => {
    settogllingid(id);
    try {
      const res = await api.patch(
        API_URLS.ADMIN.TOGGLEPRODUCTSTATUS,
        { id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (res.data.success) {
        toast.success("Status uğurla dəyişdi", { autoClose: 800 });

        // 👇 YERLİ VƏZİYYƏTİ YENİLƏMƏK
        setUrunler((prevMehsullar) => {
          // Köhnə siyahının üzərində map edirik
          return prevMehsullar.map((mehsul) => {
            // Əgər ID uyğundursa, isActive dəyərini əksinə çeviririk
            if (mehsul._id === id) {
              // ...mehsul ilə digər dəyərləri saxlayırıq, isActive-i isə yeniləyirik
              return { ...mehsul, isActive: !mehsul.isActive };
            }
            // Digər məhsulları olduğu kimi qaytarırıq
            return mehsul;
          });
        });
        settogllingid(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      settogllingid(null);
    }
  };

  useEffect(() => {
    fetchSaticilar();
  }, []);

  const UrunCard = React.memo(({ urun }) => {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => openDetailModal(urun)}
        className="bg-white min-w-40 w-full h-52 border rounded-xl shadow hover:shadow-2xl hover:shadow-indigo-500 transition cursor-pointer"
      >
        <img
          loading="lazy"
          width={300}
          height={160}
          src={
            urun.productphotos?.[0]?.secure_url ||
            "https://via.placeholder.com/200"
          }
          alt={urun.ad}
          className="w-full h-full object-cover rounded-t-xl"
        />

        <div className="py-3 ">
          <h4 className="font-medium truncate">{urun.mehsuladi}</h4>

          <div className="flex justify-between items-center mt-2 gap-2 text-xs">
            {/* Fiyat */}

            {/* Blok durumu */}
            <span
              className={`px-2 py-1 rounded ${
                urun.isBlocked
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {urun.isBlocked ? "Bloklu" : "Bloklu deyil"}
            </span>

            {/* Aktiv durumu */}
            <span
              className={`px-2 py-1 rounded ${
                urun.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {urun.isActive ? "Aktiv" : "Deaktiv"}
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            {/* Blokla */}
            <button
              disabled={blockLoadingId === urun._id}
              onClick={(e) => {
                e.stopPropagation();
                onToggleBlock(urun._id, urun.isBlocked);
              }}
              className={`flex-1 text-xs px-0 py-2 rounded font-medium transition
    ${
      blockLoadingId === urun._id
        ? "bg-gray-300 cursor-not-allowed"
        : urun.isBlocked
        ? "bg-blue-500 text-white hover:bg-blue-600"
        : "bg-red-500 text-white hover:bg-red-600"
    }`}
            >
              {blockLoadingId === urun._id
                ? "İşlənir..."
                : urun.isBlocked
                ? "Bloku aç"
                : "Blokla"}
            </button>

            {/* Aktiv / Deaktiv */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handletogglestatus(urun._id);
              }}
              className={`flex-1 text-xs px-2 py-2 cursor-pointer rounded font-medium transition
      ${
        urun.isActive
          ? "bg-yellow-500 text-white hover:bg-yellow-700"
          : "bg-green-500 text-white hover:bg-green-700"
      }`}
            >
              {urun.isActive ? "Deaktiv et" : "Aktiv et"}
            </button>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sol Liste */}
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">Satıcılar</h1>
          <p className="text-gray-500 text-sm">
            Platformdaki bütün satıcı profilleri
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin border-4 border-gray-300 border-t-gray-600 rounded-full w-10 h-10"></div>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="space-y-3">
              {saticilar.map((s) => (
                <div
                  key={s._id}
                  onClick={() => setSelected(s)}
                  className={`flex items-center gap-4 p-4 border rounded cursor-pointer hover:shadow-md transition ${
                    selected?._id === s._id
                      ? "border-green-700 bg-green-200"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={
                      s.profilephoto?.secure_url ||
                      "https://via.placeholder.com/50"
                    }
                    alt={s.ad}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {s.ad} {s.soyad}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {s.market?.ad || "Market yok"}
                    </div>
                  </div>
                  {s.isVerified && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Təsdiqli
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sağ Detay */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selected ? (
          <div>
            <div className="flex items-center gap-6 mb-6">
              <img
                src={
                  selected.profilephoto?.secure_url ||
                  "https://via.placeholder.com/100"
                }
                alt={selected.ad}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="w-full">
                <h2 className="text-2xl font-bold">
                  {selected.ad} {selected.soyad}
                </h2>
                <p className="text-gray-500">{selected.email}</p>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex flex-row w-full justify-between items-center">
                    <h3>Email doğrulama:</h3>
                    <span
                      className={`py-1 px-4 rounded text-white ${
                        selected.isActive ? "bg-blue-500" : "bg-gray-400"
                      }`}
                    >
                      {selected.isActive ? "Aktiv" : "Passiv"}
                    </span>
                  </div>
                  <div className="flex flex-row w-full justify-between items-center">
                    <h3>Hesab vəziyyəti:</h3>
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        selected.isVerified ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {selected.isVerified ? "Təsdiqlənib" : "Təsdiqsiz"}
                    </span>
                  </div>
                  <div className="flex flex-row w-full justify-between items-center">
                    <h3>Bloklandı:</h3>
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        selected.blocked.isBlocked
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                    >
                      {selected.blocked.isBlocked ? "Bloklandı" : "Bloklanmadı"}
                    </span>
                  </div>
                  {/* <button className="border rounded-xl mx-4 py-2 hover:bg-indigo-500 hover:text-white transition-all duration-300 ">
                    Satıcını sil
                  </button> */}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-6">
              <Info label="Market" value={selected.market?.ad} />
              <Info label="Telefon" value={selected.phone || "—"} />
              <Info
                label="Qeydiyyat tarixi"
                value={new Date(selected.createdAt).toLocaleDateString()}
              />
              <Info
                label="Market açıqlaması"
                value={selected.market?.aciqlama || "—"}
              />
              <Info label="Haqqında" value={selected.market?.haqqinda || "—"} />
              <Info label="Telefon" value={selected.phone || "—"} />
            </div>
            <div className="grid grid-cols-2 mt-4">
              <button
                onClick={() => setiswarning(!iswarning)}
                className="border cursor-pointer rounded-xl mx-4 py-2 hover:bg-indigo-500 hover:text-white transition-all duration-300 "
              >
                {iswarning ? "Bağla" : "Xəbərdarlıq et"}
              </button>
              {selected.blocked.isBlocked ? (
                <button
                  onClick={() => unblock(selected._id)}
                  className="border cursor-pointer rounded-xl mx-4 py-2 hover:bg-red-500 hover:text-white transition-all duration-300 "
                >
                  Blokdan çıxart
                </button>
              ) : (
                <button
                  onClick={() => setisblock(!isblock)}
                  className="border cursor-pointer rounded-xl mx-4 py-2 hover:bg-red-500 hover:text-white transition-all duration-300 "
                >
                  {isblock ? "Bağla" : "Satıcını blokla"}
                </button>
              )}
            </div>
            {isblock && (
              <div className="fixed my-4 bg-white backdrop-blur-2xl">
                <h2>Satıcı bloklanacaq. Davam edilsinmi?</h2>
                <div className="px-5 pt-3 flex flex-col">
                  <label>Bloklamanın səbəbini yazın</label>
                  <textarea
                    rows={4}
                    className="border focus:ring-2 outline-0 focus:ring-indigo-700 py-1 px-3 duration-300 transition-all rounded-lg"
                    name="blockreason"
                    numberoflines={4}
                    value={blockreason}
                    placeholder="Məs:Uyğunsuz məhsul satışı"
                    onChange={(e) => setblockreason(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => block(selected._id)}
                  className="border cursor-pointer rounded-xl mx-4 py-2 px-12 my-4 hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                  Blokla
                </button>
              </div>
            )}
            {iswarning && (
              <div className="fixed bg-white p-6 rounded-xl shadow-xl">
                <h2 className="text-lg font-semibold mb-3">
                  Satıcıya xəbərdarlıq göndər
                </h2>

                <input
                  className="border w-full mb-3 px-3 py-2 rounded transition-all outline-0 duration-300 focus:ring-2 focus:ring-indigo-600"
                  placeholder="Başlıq"
                  value={warningtitle}
                  onChange={(e) => setwarningtitle(e.target.value)}
                />

                <textarea
                  rows={4}
                  className="border w-full px-3 py-2 rounded transition-all outline-0 duration-300 focus:ring-2 focus:ring-indigo-600"
                  placeholder="Xəbərdarlıq mətni"
                  value={warningbody}
                  onChange={(e) => setwarningbody(e.target.value)}
                />

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => warn(selected._id)}
                    className="px-6 py-2 rounded bg-yellow-500 text-white cursor-pointer"
                  >
                    Göndər
                  </button>
                  <button
                    onClick={() => setiswarning(false)}
                    className="px-6 py-2 rounded border cursor-pointer"
                  >
                    Ləğv et
                  </button>
                </div>
              </div>
            )}

            {/* SATIÇININ MƏHSULLARI */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4">
                Satıcının məhsulları
              </h3>

              {urunLoading ? (
                <div className="flex gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-56 h-40 bg-gray-200 animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              ) : urunError ? (
                <div className="text-red-500">{urunError}</div>
              ) : urunler.length === 0 ? (
                <div className="text-gray-400">
                  Bu satıcının hələ məhsulu yoxdur
                </div>
              ) : (
                <div className="flex gap-6 overflow-x-auto pb-3 pt-4 h-96">
                  {urunler.map((urun) => (
                    <UrunCard key={urun._id} urun={urun} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Soldan bir satıcı seçin
          </div>
        )}
      </div>
      {detailmodal && (
        <Detailmodal
          mehsul={detailmodal}
          onClose={() => setdetailmodal(null)}
        />
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
