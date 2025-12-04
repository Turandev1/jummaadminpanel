import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/axiosclient";
import { API_URLS } from "../../utils/api";
import useAuth from "../../redux/authredux";
import { Eye, Loader2, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import Detailmodal from "../../components/detailmodal";
import EditModal from "../../components/editmodal";

const Mehsullarr = () => {
  const { user, accessToken } = useAuth();
  const [mehsullar, setmehsullar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [detailmodal, setdetailmodal] = useState(false);
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

  const handletogglestatus = async (id) => {
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
      }
    } catch (error) {
      console.error(error);
    }
  };
  // --- Modal Handlers ---
  const openEditModal = (mehsul) => {
    setEditingProduct(mehsul);
  };

  const closeEditModal = useCallback(() => {
    // useCallback eklenmesi opsiyoneldir, performans için faydalıdır.
    setEditingProduct(null); // 1. Modalı kapat
    fetchProducts(); // 2. Verileri yeniden çek (API çağrısını tekrar tetikle)
  }, [fetchProducts]); // fetchProducts'ı bağımlılık olarak ekliyoruz

  const fixedcategories = (category) => {
    switch (category) {
      case "qida":
        return "Qida";
      case "shexsibaxim":
        return "Şəxsi baxım";
      case "temizlikmehsullari":
        return "Təmizlik məhsulları";
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

  // --- Product Row Component ---
  const ProductRow = ({ mehsul,index }) => (
    <div className="grid grid-cols-11 gap-4 items-center p-2 border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-150">
      {/* 2. Məhsul Adı (Name) - col-span-6 (Mobile: col-span-5) */}

      <div className="col-span-1 text-center font-bold text-gray-700">{index}.</div>

      <div className="col-span-2 font-semibold text-gray-800 truncate">
        {mehsul.mehsuladi}
      </div>

      {/* 3. Kateqoriya (Category) - col-span-3 (Hidden on mobile) */}
      <div className="col-span-2 text-center text-sm text-gray-600 truncate">
        {fixedcategories(mehsul.kateqoriya) || "—"}
      </div>

      {/* 4. Qiymət (Price) - col-span-2 (Mobile: col-span-1) */}
      <div className="col-span-2 text-sm font-bold text-indigo-600 text-center">
        {mehsul.qiymet?.toFixed(2) || "0.00"} {mehsul.valyuta || "₼"}
      </div>

      {/* 5. Status (Toggle) - col-span-2 */}
      <div className="col-span-2 flex justify-center">
        <label
          htmlFor={`toggle-${mehsul._id}`}
          className="flex items-center cursor-pointer"
        >
          <div className="relative">
            <input
              type="checkbox"
              id={`toggle-${mehsul._id}`}
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
              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow ${
                mehsul.isActive
                  ? "transform translate-x-4"
                  : "transform translate-x-0"
              }`}
            ></div>
          </div>
        </label>
      </div>

      {/* 6. Action Buttons (View/Edit) - col-span-1 */}
      <div className="col-span-2  flex justify-center borde space-x-4 px-3 ml-auto">
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
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-4 border-indigo-500 pb-2">
        Məhsullarım
      </h1>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-gray-100">
        {/* Header Row (12-column Grid) */}
        <div className="hidden sm:grid grid-cols-11 gap-4 py-4 px-2 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-t-2xl">
          <div className="col-span-1 text-center">No</div>
          <div className="col-span-2">Məhsul Adı</div>
          <div className="col-span-2 text-center">Kateqoriya</div>
          <div className="col-span-2 text-center">Qiymət</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-center">Hərəkətlər</div>
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
    </div>
  );
};

export default Mehsullarr;
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//  {
//    user.inReview && (
//      <div
//        className="fixed top-0 sm:left-64 inset-0 px-8 bg-black/50 flex items-center justify-center"
//        style={{ width: width - "256px" }}
//      >
//        <div
//          style={{ fontFamily: fonts.meriendasemi }}
//          className="bg-white p-4 rounded-3xl shadow-lg mb-14 max-w-4xl"
//        >
//          Hesabınız incələmədədir. İncələmə bitəndə satıcı hesabının
//          üstünlüklərindən yararlana biləcəksiniz. Səbriniz üçün minnəttarıq.
//        </div>
//      </div>
//    );
//  }
// const [width, setWidth] = useState(window.innerWidth);

// useEffect(() => {
//   const handleResize = () => setWidth(window.innerWidth);

//   window.addEventListener("resize", handleResize);

//   // Cleanup
//   return () => window.removeEventListener("resize", handleResize);
// }, []);
