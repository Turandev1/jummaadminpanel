import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/axiosclient";
import { API_URLS } from "../../utils/api";
import useAuth from "../../redux/authredux";
import { Eye, InfoIcon, Loader2, Pencil, X } from "lucide-react";
import { toast } from "react-toastify";
import Detailmodal from "../../components/detailmodal";
import EditModal from "../../components/editmodal";

const Mehsullarr = () => {
  const { user, accessToken, setAuthData } = useAuth();
  const [mehsullar, setmehsullar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [detailmodal, setdetailmodal] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [togglingtukendiid, settogglingtukendiid] = useState(null);
  const [catdirilmamodal, setcatdirilmamodal] = useState(false);
  const [selfDeliveryFee, setSelfDeliveryFee] = useState("");
  const [freeThresholdType, setFreeThresholdType] = useState("yoxdur"); // 'price' və ya 'count'
  const [freeThresholdValue, setFreeThresholdValue] = useState("");
  // Function to fetch products

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const id = user.id || user._id;
      // Using the MOCK API Client
      const res = await api.get(`${API_URLS.SATICI.GETPRODUCTS}/${id}`);
      setmehsullar(
        Array.isArray(res.data?.mehsullar) ? res.data.mehsullar : []
      );
    } catch (error) {
      console.error("Məhsulları gətirərkən xəta baş verdi:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user._id, user.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    // Redux-dan gələn user obyektinin içində deliveryoptions varmı yoxla
    if (user?.deliveryoptions) {
      const {
        selfDeliveryFee,
        freeDeliveryThresholdAmount,
        freeDeliveryThresholdCount,
      } = user.deliveryoptions;

      // 1. Çatdırılma haqqını set et (input string gözlədiyi üçün toString istifadə edirik)
      setSelfDeliveryFee(selfDeliveryFee?.toString() || "");

      // 2. Threshold növünü və dəyərini təyin et
      if (freeDeliveryThresholdAmount && freeDeliveryThresholdAmount > 0) {
        setFreeThresholdType("price");
        setFreeThresholdValue(freeDeliveryThresholdAmount.toString());
      } else if (freeDeliveryThresholdCount && freeDeliveryThresholdCount > 0) {
        setFreeThresholdType("count");
        setFreeThresholdValue(freeDeliveryThresholdCount.toString());
      } else {
        setFreeThresholdType("yoxdur");
        setFreeThresholdValue("");
      }
    }
  }, [user]); // user obyekti Redux-da yeniləndikdə bu kod təkrar işləyəcək

  const handletogglestatus = async (id) => {
    setTogglingId(id);
    try {
      const res = await api.patch(
        API_URLS.SATICI.TOGGLEPRODUCTSTATUS,
        { id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (res.data.success) {
        toast.success("Status uğurla dəyişdi", { autoClose: 800 });

        // 👇 YERLİ VƏZİYYƏTİ YENİLƏMƏK
        setmehsullar((prevMehsullar) => {
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
        setTogglingId(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTogglingId(null);
    }
  };

  const toggletukendi = async (id) => {
    settogglingtukendiid(id);
    try {
      const res = await api.patch(
        API_URLS.SATICI.TOGGLEPRODUCTTUKENDI,
        { id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (res.data.success) {
        toast.success("Status uğurla dəyişdi", { autoClose: 800 });

        // 👇 YERLİ VƏZİYYƏTİ YENİLƏMƏK
        setmehsullar((prevMehsullar) => {
          // Köhnə siyahının üzərində map edirik
          return prevMehsullar.map((mehsul) => {
            // Əgər ID uyğundursa, isActive dəyərini əksinə çeviririk
            if (mehsul._id === id) {
              // ...mehsul ilə digər dəyərləri saxlayırıq, isActive-i isə yeniləyirik
              return { ...mehsul, mehsultukendi: !mehsul.mehsultukendi };
            }
            // Digər məhsulları olduğu kimi qaytarırıq
            return mehsul;
          });
        });
        settogglingtukendiid(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      settogglingtukendiid(null);
    }
  };

  const openEditModal = (mehsul) => {
    setEditingProduct(mehsul);
  };

  const closeEditModal = useCallback(() => {
    // useCallback eklenmesi opsiyoneldir, performans için faydalıdır.
    setEditingProduct(null); // 1. Modalı kapat
    fetchProducts(); // 2. Verileri yeniden çek (API çağrısını tekrar tetikle)
  }, [fetchProducts]);

  const fixedcategories = (category) => {
    switch (category) {
      case "qida":
        return "Qida";
      case "shexsibaxim":
        return "Şəxsi baxım";
      case "temizlikmehsullari":
        return "Təmizlik məhsulları";
      case "saglamliq":
        return "Sağlamlıq";
      case "islamieshyavekitablar":
        return "Islami əşya və kitablar";
      case "ushaqmehsullari":
        return "Uşaq məhsulları";
    }
  };

  const openDetailModal = (mehsul) => {
    setEditingProduct(null); // ehtiyac varsa edit modal bağlanır
    setdetailmodal(mehsul);
  };

  const changedeliveryoptions = async () => {
    // Validasiya: Əgər pulsuz çatdırılma növü seçilibsə, dəyər boş olmamalıdır
    if (
      freeThresholdType !== "yoxdur" &&
      (!freeThresholdValue || freeThresholdValue <= 0)
    ) {
      toast.error(
        "Zəhmət olmasa pulsuz çatdırılma üçün düzgün limit daxil edin!"
      );
      return;
    }

    // Yükləmə state-i əlavə edə bilərsiniz (məs: setSending(true))
    try {
      const payload = {
        saticiId: user.id || user._id,
        selfDeliveryFee: parseFloat(selfDeliveryFee) || 0,
        // Seçilən növə görə müvafiq backend sahəsini doldururuq
        freeDeliveryThresholdAmount:
          freeThresholdType === "price" ? parseFloat(freeThresholdValue) : null,
        freeDeliveryThresholdCount:
          freeThresholdType === "count" ? parseInt(freeThresholdValue) : null,
      };

      const res = await api.patch(
        API_URLS.SATICI.CHANGEDELIVERYOPTIONS,
        payload,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (res.data.success) {
        toast.success("Çatdırılma ayarları uğurla yeniləndi!", {
          autoClose: 2000,
        });
        setAuthData({
          user: {
            deliveryoptions: {
              deliveryType: "SELF",
              selfDeliveryFee: payload.selfDeliveryFee,
              freeDeliveryThresholdAmount: payload.freeDeliveryThresholdAmount,
              freeDeliveryThresholdCount: payload.freeDeliveryThresholdCount,
            },
          },
        });
        setcatdirilmamodal(false); // Modalı bağla
      } else {
        toast.error(res.data.mesaj || "Xəta baş verdi");
      }
    } catch (error) {
      console.error("Çatdırılma ayarları yenilənərkən xəta:", error);
      toast.error(error.response?.data?.message || "Serverlə əlaqə kəsildi");
    }
  };

  const ProductRow = ({ mehsul, index }) => (
    <div className="grid grid-cols-11 gap-4 items-center p-2 border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-150">
      {/* 2. Məhsul Adı (Name) - col-span-6 (Mobile: col-span-5) */}
      <div className="col-span-1 text-center font-bold text-gray-700">
        {index}.
      </div>

      <div className="col-span-2 font-semibold text-gray-800 truncate">
        {mehsul.mehsuladi}
      </div>

      {/* 3. Kateqoriya (Category) - col-span-3 (Hidden on mobile) */}
      <div className="col-span-2 text-center text-sm text-gray-600 truncate">
        {fixedcategories(mehsul.kateqoriya) || "—"}
      </div>

      {/* tukendi */}
      <div className="col-span-1 flex justify-center">
        {togglingtukendiid === mehsul._id ? (
          <Loader2 className="animate-spin text-indigo-500 w-6 h-6" />
        ) : (
          <label
            htmlFor={`tukendi-${mehsul._id}`}
            className="flex flex-col items-center cursor-pointer"
          >
            <p
              className={`${
                mehsul.mehsultukendi ? "text-red-500" : "text-green-500"
              }`}
            >
              {mehsul.mehsultukendi ? "Tükəndi" : "Tükənmədi"}
            </p>
            <div className="relative">
              <input
                type="checkbox"
                id={`tukendi-${mehsul._id}`}
                checked={mehsul.mehsultukendi}
                onChange={() => toggletukendi(mehsul._id)}
                className="sr-only"
              />
              <div
                className={`block ${
                  mehsul.mehsultukendi ? "bg-red-500" : "bg-green-500"
                } w-10 h-6 rounded-full transition-colors duration-300 shadow-inner`}
              ></div>
              <div
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow ${
                  mehsul.mehsultukendi ? "translate-x-0" : "translate-x-4"
                }`}
              ></div>
            </div>
          </label>
        )}
      </div>

      {/* 4. Qiymət (Price) - col-span-2 (Mobile: col-span-1) */}
      <div className="col-span-2 text-sm font-bold text-indigo-600 text-center">
        {mehsul.qiymet?.toFixed(2) || "0.00"} {mehsul.valyuta || "₼"}
      </div>

      {/* 5. Status (Toggle) - col-span-2 */}
      <div className="col-span-1 xl:col-span-2 flex justify-center">
        {togglingId === mehsul._id ? (
          <Loader2 className="animate-spin text-indigo-500 w-6 h-6" />
        ) : (
          <label
            htmlFor={`status-${mehsul._id}`}
            className="flex items-center cursor-pointer"
          >
            <div className="relative">
              <input
                type="checkbox"
                id={`status-${mehsul._id}`}
                checked={mehsul.isActive}
                onChange={() => handletogglestatus(mehsul._id)}
                className="sr-only"
              />
              <div
                className={`block ${
                  mehsul.isActive ? "bg-green-500" : "bg-red-400"
                } w-10 h-6 rounded-full transition-colors duration-300 shadow-inner`}
              ></div>
              <div
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow ${
                  mehsul.isActive ? "translate-x-4" : "translate-x-0"
                }`}
              ></div>
            </div>
          </label>
        )}
      </div>

      {/* 6. Action Buttons (View/Edit) - col-span-1 */}
      <div className="col-span-1  flex justify-center borde space-x-4 px-3 ml-auto">
        {/* View Details Button (Uses custom notification panel) */}
        <button
          onClick={() => openDetailModal(mehsul)}
          className="p-2 text-gray-500 border cursor-pointer hover:text-blue-600 hover:bg-blue-100 rounded-full transition duration-150"
          title="Detallara bax"
        >
          <Eye className="h-5 w-5" />
        </button>

        {/* Edit Button */}
        <button
          onClick={() => openEditModal(mehsul)}
          className="p-2 text-gray-500 border cursor-pointer hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition duration-150"
          title="Redaktə Et"
        >
          <Pencil className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="flex flex-row justify-between border-b border-indigo-500 mb-5 items-center">
        <h1 className="text-3xl font-extrabold text-gray-900 pb-2">
          Məhsullarım
        </h1>
        <button
          onClick={() => setcatdirilmamodal(true)}
          className="border py-2 px-6 mb-2 rounded-xl bg-gray-800 text-white cursor-pointer"
        >
          Self çatdırılma seçimləri
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-gray-100">
        {/* Header Row (12-column Grid) */}
        <div className="hidden sm:grid grid-cols-11 gap-4 py-4 px-2 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-t-2xl">
          <div className="col-span-1 text-center">No</div>
          <div className="col-span-2">Məhsul Adı</div>
          <div className="col-span-2 text-center">Kateqoriya</div>
          <div className="col-span-1 text-center">Tükəndi</div>
          <div className="col-span-2 text-center">Qiymət</div>
          <div className="col-span-1 xl:col-span-2 text-center">Status</div>
          <div className="col-span-1 text-center">Hərəkətlər</div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-500 mb-3" />
            Məhsullar yüklənir... Zəhmət olmasa gözləyin.
          </div>
        ) : (
          /* Product List */
          <div className="divide-y divide-gray-400">
            {mehsullar.length > 0 ? (
              mehsullar.map((mehsul, idx) => (
                <div key={mehsul._id}>
                  <ProductRow
                    key={mehsul._id}
                    mehsul={mehsul}
                    index={idx + 1}
                  />
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Heç bir məhsul tapılmadı. Yeni məhsul əlavə edin.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <EditModal
          product={editingProduct}
          onClose={closeEditModal} // <-- Buraya güncellenmiş fonksiyonu iletiyoruz
        />
      )}
      {detailmodal && (
        <Detailmodal
          mehsul={detailmodal}
          onClose={() => setdetailmodal(null)}
        />
      )}

      {catdirilmamodal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-75 backdrop-blur-sm flex items-center justify-center py-6">
          <div className="bg-white flex flex-col items-center rounded-xl overflow-y-auto shadow-2xl w-full max-w-[90%] h-full p-6 transform transition-all duration-300 scale-100">
            <button
              onClick={() => setcatdirilmamodal(false)}
              className="absolute top-5 right-6 bg-red-500 rounded-full p-2 cursor-pointer"
            >
              <X size={30} color="white" />
            </button>
            <h2 className="text-center mt-6 flex items-center justify-center gap-x-2">
              <InfoIcon />
              Əgər self çatdırılma metodunu seçsəniz çatdırılma üçün burda təyin
              etdiyiniz parametrler tətbiq olunacaq
            </h2>
            <div className="space-y-4 p-4 mt-10 bg-gray-50 rounded-lg border w-full border-gray-200 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Çatdırılma haqqı (AZN)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Məs: 3.50"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 transition-all duration-300 outline-none"
                  value={selfDeliveryFee}
                  onChange={(e) => setSelfDeliveryFee(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hansı halda çatdırılma pulsuzdur?
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setFreeThresholdType("price")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                      freeThresholdType === "price"
                        ? "bg-green-100 border-green-500 text-green-700"
                        : "bg-white border-gray-300 text-gray-500"
                    }`}
                  >
                    Məbləğə görə
                  </button>
                  <button
                    type="button"
                    onClick={() => setFreeThresholdType("count")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                      freeThresholdType === "count"
                        ? "bg-green-100 border-green-500 text-green-700"
                        : "bg-white border-gray-300 text-gray-500"
                    }`}
                  >
                    Sayına görə
                  </button>
                  <button
                    type="button"
                    onClick={() => setFreeThresholdType("yoxdur")}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                      freeThresholdType === "yoxdur"
                        ? "bg-green-100 border-green-500 text-green-700"
                        : "bg-white border-gray-300 text-gray-500"
                    }`}
                  >
                    Yoxdur
                  </button>
                </div>
                {freeThresholdType !== "yoxdur" && (
                  <div>
                    <input
                      type="number"
                      placeholder={
                        freeThresholdType === "price"
                          ? "Min. məbləğ (AZN)"
                          : "Min. məhsul sayı"
                      }
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 transition-all duration-300 outline-none"
                      value={freeThresholdValue}
                      onChange={(e) => setFreeThresholdValue(e.target.value)}
                    />
                    <p className="mt-2 text-[11px] text-gray-500 italic">
                      * Alıcı {freeThresholdValue || "..."}{" "}
                      {freeThresholdType === "price" ? "AZN-dən" : "ədəddən"}{" "}
                      yuxarı sifariş verdikdə çatdırılma pulsuz olacaq.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => changedeliveryoptions()}
              className="max-w-2xl bg-green-500 min-w-xl cursor-pointer text-white py-2 rounded-full flex items-center justify-center text-2xl mt-12"
            >
              Göndər
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mehsullarr;
