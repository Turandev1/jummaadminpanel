import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../utils/axiosclient";
import { API_URLS } from "../../utils/api";
import useAuth from "../../redux/authredux";
import {
  CheckCircle,
  Clock,
  Eye,
  ImagePlus,
  Loader2,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const subcategoriesMap = {
  qida: [
    "Süd və süd məhsulları",
    "Ət və ət məhsulları",
    "Dəniz məhsulları",
    "Un məmulatları",
    "Şirniyyat",
    "Quru qidalar",
    "İçkilər",
    "Hazır yeməklər,yarımfabrikatlar",
    "Digər",
  ],
  shexsibaxim: [
    "Dəri baxımı",
    "Qadın baxım məhsulları",
    "Dezodorant və Ətirlər",
    "Saç baxımı",
    "Gigiyena",
    "Üz və bədən baxımı",
    "Hamam məhsulları",
    "Digər",
  ],
  temizlikmehsullari: [
    "Yuyucu vasitələr",
    "Təmizlik bezləri",
    "Otaq ətirləri",
    "Digər",
  ],
  islamieshyavekitablar: [
    "Dini kitablar",
    "Səccadələr",
    "Təsbehlər",
    "Geyimlər",
    "Hədiyyəlik",
    "Digər",
  ],
  ushaqmehsullari: [
    "Oyuncaqlar",
    "Uşaq qidası",
    "Təmizlik vasitələri",
    "Uşaq geyimi",
    "Digər",
  ],
};

// Assuming these constants are defined globally or imported
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dcn2gnqln/upload";
const UPLOAD_PRESET = "testpreset";

const EditModal = ({ product, onClose, onDelete }) => {
  const [modalImage, setModalImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // const { user } = useAuth(); // Assuming useAuth is available
  const [newImages, setNewImages] = useState([]); // Newly selected files to upload
  const [removedImagePublicIds, setRemovedImagePublicIds] = useState([]);

  // Tüm mevcut fotoğraflar (görsel sunum için)
  const allExistingPhotos = product?.productphotos || [];

  // Kaydedilecek fotoğraflar: Silinmek üzere işaretlenmemiş olanlar + Yeniler
  const keptExistingPhotos = allExistingPhotos.filter(
    (photo) => !removedImagePublicIds.includes(photo.public_id)
  );

  const [formData, setFormData] = useState({
    mehsuladi: product.mehsuladi || "",
    kateqoriya: product.kateqoriya || "",
    altkateqoriya: product.altkateqoriya || "",
    qiymet: product.qiymet || 0,
    depo: product.depo || 0,
    brand: product.brand || "",
    ceki: product.cekisi || "",
    olcuvahidi: product.olcuvahidi || "",
    aciqlama:
      (Array.isArray(product.aciqlama)
        ? product.aciqlama.join(", ")
        : product.aciqlama) || "",
    isActive: product.isActive || false,
    endirim: product.endirim || 0,
    barkod: product.barkod || "",
    sku: product.sku || "",
    tesvir: product.tesvir || "",
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "kateqoriya" && { altkateqoriya: "" }),
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setNewImages((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = null;
    setDragOver(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Mövcud Şəkil İşləyiciləri (Silinmə/Geri Alma) ---
  const toggleExistingImageDeletion = (publicId) => {
    setRemovedImagePublicIds((prev) => {
      // Eğer zaten listedeyse, listeden çıkar (Geri Al işlevi)
      if (prev.includes(publicId)) {
        return prev.filter((id) => id !== publicId);
      }
      // Listede değilse, listeye ekle (Silinmek üzere işaretle)
      return [...prev, publicId];
    });
  };

  const openModal = (source) => {
    if (source instanceof File) {
      setModalImage(URL.createObjectURL(source));
    } else {
      setModalImage(source);
    }
  };

  const closeModal = () => {
    if (modalImage && modalImage.startsWith("blob:")) {
      URL.revokeObjectURL(modalImage);
    }
    setModalImage(null);
  };

  const uploadFileToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      // Axios ve CLOUDINARY_URL/UPLOAD_PRESET'in tanımlı olduğunu varsayıyoruz
      const res = await axios.post(CLOUDINARY_URL, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return {
        public_id: res.data.public_id,
        secure_url: res.data.secure_url,
        original_filename: res.data.original_filename,
      };
    } catch (error) {
      console.error("Cloudinary error:", error);
      // toast.error("Yeni şəkil yüklənmədi");
      return null;
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setUploading(true);
    setSending(false);

    // 1) Yeni şəkilləri yükləyin
    const uploadedImages = await Promise.all(
      newImages.map((img) => uploadFileToCloudinary(img))
    );
    setUploading(false);

    const validNewImages = uploadedImages.filter(Boolean);
    if (newImages.length > 0 && !validNewImages.length) {
      toast.error("Yeni şəkillərin heç biri Cloudinary-ə yüklənmədi");
      setIsSaving(false);
      return;
    }

    // 2) Qorunmuş mövcud şəkilləri və yeni yüklənmiş şəkilləri birləşdirin
    const finalProductPhotos = [...keptExistingPhotos, ...validNewImages];

    // 3) Açıqlamayı formatlayın
    const formattedAciqlama = formData.aciqlama
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map(
        (item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
      );

    // 4) Payload hazırlayın
    const payload = {
      ...formData,
      productid: product._id, // API üçün məhsul ID-si
      mehsuladi:
        formData.mehsuladi.charAt(0).toUpperCase() +
        formData.mehsuladi.slice(1).toLowerCase(),
      brand:
        formData.brand.charAt(0).toUpperCase() +
        formData.brand.slice(1).toLowerCase(),
      aciqlama: formattedAciqlama,
      productphotos: finalProductPhotos, // Qorunanlar + Yenilər
      removedphotos: removedImagePublicIds, // Silinməsi tələb olunan public ID-lər
      cekisi: formData.ceki,
      depo: formData.depo,
    };

    // 5) Backend'ə göndərin
    setSending(true);
    try {
      const res = await api.patch(API_URLS.SATICI.MEHSULEDIT, payload); // api ve API_URLS'in tanımlı olduğunu varsayıyoruz
      // Mocking API call for demonstration:

      setSending(false);

      if (res.data.success) {
        toast.success("Məhsul uğurla redaktə edildi");
      } else {
        toast.error(res.data.message || "API cavabı success = false");
      }
    } catch (error) {
      console.error("API error:", error);
      toast.error("Məhsul redaktə olunarkən xəta baş verdi");
    } finally {
      setIsSaving(false);
      setSending(false);
      onClose();
    }
  };

  const handleproductdelete = async (id) => {
    try {
      console.log("id:", id);
      const res = await api.delete(`${API_URLS.SATICI.DELETEPRODUCT}/${id}`);
      const data = res.data;

      if (data.success) {
        toast.success(data.mesaj || "Məhsul uğurla silindi");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.hata || "Məhsul silinə bilmədi");
    } finally {
      onClose();
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Məhsulu Redaktə Et
          </h2>
          <button
            onClick={onClose}
            className="text-gray-800 cursor-pointer p-2 rounded-full duration-300 hover:bg-red-400 transition-all"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* ... (Diğer form alanları - Məhsul Adı, Açıqlama, Kateqoriya, Qiymət, Depo, Çəki, Ölçü vahidi, Brand) ... */}

            {/* Məhsul Adı */}
            <label className="block col-span-2">
              <span className="text-sm font-medium text-gray-700">
                Məhsul Adı
              </span>
              <input
                type="text"
                name="mehsuladi"
                value={formData.mehsuladi}
                onChange={handleChange}
                className="mt-1 block w-full outline-none focus:ring-2 rounded-lg border border-gray-400 p-2.5 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                required
              />
            </label>

            {/* Açıqlama */}
            <label className="block col-span-2">
              <span className="text-sm font-medium text-gray-700">
                Açıqlama
              </span>
              <textarea
                name="aciqlama"
                value={formData.aciqlama}
                onChange={handleChange}
                placeholder="Məhsul haqqında açıqlama (vergüllə ayırın)"
                className="mt-1 block w-full rounded-lg border outline-none focus:ring-2 border-gray-400 p-2.5 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                rows={3}
                required
              />
            </label>

            {/* Kategoriya */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Kateqoriya
              </span>
              <select
                name="kateqoriya"
                value={formData.kateqoriya}
                onChange={(e) => {
                  handleChange(e);
                  setFormData((p) => ({ ...p, altkateqoriya: "" }));
                }}
                className="block w-full rounded-lg border focus:ring-indigo-500 duration-300 transition-all outline-none focus:ring-2 border-gray-400 p-2.5 bg-gray-50 cursor-pointer"
                required
              >
                <option value="">Kateqoriya seçin</option>
                <option value="qida">Qida</option>
                <option value="shexsibaxim">Şəxsi baxım</option>
                <option value="temizlikmehsullari">Təmizlik məhsulları</option>
                <option value="islamieshyavekitablar">
                  İslami əşya və kitablar
                </option>
                <option value="ushaqmehsullari">Uşaq məhsulları</option>
              </select>
            </label>

            {/* Alt Kateqoriya */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Alt kateqoriya
              </span>
              <select
                name="altkateqoriya"
                value={formData.altkateqoriya}
                onChange={handleChange}
                disabled={!subcategoriesMap[formData.kateqoriya]}
                className="block w-full rounded-lg border outline-none focus:ring-indigo-500 duration-300 transition-all focus:ring-2 border-gray-400 p-2.5 bg-gray-50 cursor-pointer"
              >
                <option value="">Alt kateqoriya seçin</option>
                {subcategoriesMap[formData.kateqoriya]?.map((sub) => (
                  <option value={sub} key={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </label>

            {/* Qiymət */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Qiymət (AZN)
              </span>
              <input
                type="number"
                name="qiymet"
                value={formData.qiymet}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border outline-none focus:ring-2 border-gray-400 p-2.5 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                required
              />
            </label>

            {/* Depo (Stock) */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Depo (Ehtiyat miqdarı)
              </span>
              <input
                type="number"
                name="depo"
                value={formData.depo}
                onChange={handleChange}
                placeholder="Ehtiyatdakı məhsul miqdarı"
                className="mt-1 block w-full rounded-lg border outline-none focus:ring-2 border-gray-400 p-2.5 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                required
              />
            </label>

            {/* Çəki */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Çəki</span>
              <input
                type="number"
                name="ceki"
                value={formData.ceki}
                onChange={handleChange}
                placeholder="Məhsulun kütləsi"
                className="mt-1 block w-full rounded-lg border outline-none focus:ring-2 border-gray-400 p-2.5 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                required
              />
            </label>

            {/* Ölçü vahidi */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Ölçü vahidi
              </span>
              <select
                name="olcuvahidi"
                value={formData.olcuvahidi}
                onChange={handleChange}
                className="block w-full rounded-lg border outline-none focus:ring-indigo-500 duration-300 transition-all focus:ring-2 border-gray-400 p-2.5 bg-gray-50 cursor-pointer"
                required
              >
                <option value="">Ölçü vahidini seç</option>
                <option value="eded">Ədəd</option>
                <option value="kq">Kiloqram</option>
                <option value="q">Qram</option>
                <option value="l">Litr</option>
                <option value="ml">Millilitr</option>
              </select>
            </label>

            {/* Brand */}
            <label className="block col-span-2">
              <span className="text-sm font-medium text-gray-700">
                Brand (Varsa)
              </span>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Məhsulun brandini qeyd edin və ya boş qoyun"
                className="mt-1 block w-full rounded-lg border outline-none focus:ring-2 border-gray-400 p-2.5 bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 capitalize"
              />
            </label>

            {/* --- GELİŞTİRİLMİŞ MEVCUT ŞEKİLLERİ GÖRÜNTÜLEME --- */}
            {allExistingPhotos.length > 0 && (
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Mövcud Şəkillər
                </h3>
                <div className="flex gap-3 overflow-x-auto bg-gray-100 p-3 rounded-lg border">
                  {allExistingPhotos.map((photo, idx) => {
                    const isMarkedForDeletion = removedImagePublicIds.includes(
                      photo.public_id
                    );

                    return (
                      <div
                        key={photo.public_id}
                        className={`relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden shadow-md group border border-gray-300 transition-opacity duration-300 ${
                          isMarkedForDeletion ? "opacity-40" : ""
                        }`}
                      >
                        <img
                          src={photo.secure_url}
                          alt={`Mövcud şəkil ${idx + 1}`}
                          className="object-cover w-full h-full cursor-pointer"
                          onClick={() => openModal(photo.secure_url)}
                        />

                        {/* Silinmek Üzere Etiketi */}
                        {isMarkedForDeletion && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                            <span className="text-white font-bold text-center text-xs p-1 bg-red-600 rounded">
                              SİLİNMƏYƏ ALINDI
                            </span>
                          </div>
                        )}

                        {/* Sil/Geri Al Düğmesi */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExistingImageDeletion(photo.public_id); // Geri Alma/Silme listesine ekleme işlevi
                          }}
                          className={`absolute top-1 right-1 w-8 h-8 text-3xl cursor-pointer rounded-full opacity-100 transition shadow-lg flex items-center justify-center p-0 
                            ${
                              isMarkedForDeletion
                                ? "bg-green-600 hover:bg-green-700 text-white font-sans" // Geri Al
                                : "bg-red-600 hover:bg-red-700 text-white" // Sil
                            }`}
                          aria-label={
                            isMarkedForDeletion ? "Geri Al" : "Mövcud şəkli sil"
                          }
                        >
                          {isMarkedForDeletion ? "↩" : "×"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- NEW IMAGE UPLOAD (Drag & Drop) --- */}
            <div className="col-span-2">
              <label className="text-sm text-gray-700 font-medium pt-2 block">
                Yeni Şəkil Yüklə (Əlavə et)
              </label>

              {/* Drag & drop alanı */}
              <div
                ref={dropRef}
                onClick={() => fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-4 flex flex-row items-center justify-center text-gray-500 transition cursor-pointer ${
                  dragOver
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-300 hover:border-indigo-300"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                {/* <ImagePlus className="w-8 h-8 mr-4 text-indigo-400" /> */}
                <span className="w-8 h-8 mr-4 text-indigo-400 text-xl">
                  +
                </span>{" "}
                {/* Icon yerine geçici metin */}
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-indigo-600">Kliklə</span>{" "}
                  və ya faylları bura sürüklə.
                </p>
              </div>

              {/* Yeni Önizlemeler */}
              {newImages.length > 0 && (
                <>
                  <div className="flex gap-3 mt-2 overflow-x-auto bg-gray-200 p-4 rounded-lg">
                    {newImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden shadow-md group border border-gray-500"
                      >
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Yeni şəkil ${idx + 1}`}
                          className="object-cover w-full h-full cursor-pointer"
                          onClick={() => openModal(img)}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNewImage(idx);
                          }}
                          className="absolute top-1 right-1 w-8 h-8 text-3xl cursor-pointer bg-red-500 hover:bg-red-800 text-white rounded-full opacity-100 transition shadow-lg flex items-center justify-center p-0"
                          aria-label="Yeni şəkli sil"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setNewImages([])}
                    className="self-start text-sm py-1 px-3 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-all font-medium mt-2"
                  >
                    Yeni Yükləmələri Sil ({newImages.length})
                  </button>
                </>
              )}
            </div>
            {/* --- END NEW IMAGE UPLOAD --- */}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-between gap-4 border-t pt-4">
            <button
              type="button"
              onClick={() => handleproductdelete(product._id)}
              disabled={isSaving || isDeleting}
              className={`flex items-center cursor-pointer justify-center font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md w-1/3 
              ${
                isDeleting
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {/* {isDeleting ? ( <Loader2 className="animate-spin w-5 h-5 mr-2" /> ) : ( <Trash2 className="h-5 w-5 mr-2" /> )} */}
              {isDeleting ? "Yüklənir..." : "Sil"}
            </button>
            <div className="flex gap-4 w-2/3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isDeleting}
                className="flex-1 bg-gray-300 cursor-pointer text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-150 shadow-md"
              >
                Ləğv Et
              </button>
              <button
                type="submit"
                disabled={isSaving || isDeleting || uploading || sending}
                className={`flex-1 font-semibold cursor-pointer py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center justify-center 
              ${
                isSaving || uploading || sending
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
              >
                {uploading
                  ? "Şəkillər Yüklənir..."
                  : sending || isSaving
                  ? "Saxlanılır..."
                  : "Saxla"}
              </button>
            </div>
          </div>
        </form>
        {/* Modal */}
        {modalImage && (
          <div
            className="fixed inset-0 bg-black/75 bg-opacity-70 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <img
              src={modalImage}
              alt="preview modal"
              className="min-h-[80%] max-w-[80%] rounded-md shadow-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-6 right-6 bg-red-600 w-12 h-12 rounded-full cursor-pointer text-white text-4xl font-bold"
              onClick={closeModal}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Detailmodal = ({ mehsul, onClose }) => {
  if (!mehsul) return null;
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

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center border-b pb-1 mb-3">
          <h2 className="text-2xl font-bold text-gray-800">Məhsul Detalları</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-500 cursor-pointer" />
          </button>
        </div>

        <div className="w-full overflow-x-auto mb-6">
          <div className="flex space-x-2 py-2">
            {mehsul.productphotos.map((photo) => (
              <img
                key={photo._id}
                src={photo.secure_url}
                alt="foto"
                className="w-60 h-60 object-cover border border-green-700 rounded-lg shadow"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2">
          {/* Məhsul Adı */}
          <span className="text-lg font-medium text-gray-700">
            Məhsul Adı:{mehsul.mehsuladi}
          </span>
          {/* Qiymət */}
          <span className="text-lg font-medium text-gray-700">
            Qiymət: {mehsul.qiymet} {mehsul.mezenne}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Endirimli qiymət: {mehsul.endirimli_qiymet} {mehsul.mezenne}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Kateqoriya: {fixedcategories(mehsul.kateqoriya)}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Ehtiyat miqdarı: {mehsul.depo}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Çəkisi: {mehsul.ceki}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Status: {mehsul.isActive ? "Aktivdir" : "Deaktivdir"}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Brend: {mehsul.brand}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Ölçü vahidi: {mehsul.olcuvahidi}
          </span>
        </div>
      </div>
    </div>
  );
};

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
  const ProductRow = ({ mehsul }) => (
    <div className="grid grid-cols-10 gap-4 items-center p-2 border-b border-gray-100 hover:bg-indigo-50 transition-colors duration-150">
      {/* 2. Məhsul Adı (Name) - col-span-6 (Mobile: col-span-5) */}
      <div className="col-span-2 font-semibold text-gray-800 truncate">
        {mehsul.mehsuladi}
      </div>

      {/* 3. Kateqoriya (Category) - col-span-3 (Hidden on mobile) */}
      <div className="col-span-2 text-sm text-gray-600 truncate">
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
        <div className="hidden sm:grid grid-cols-10 gap-4 py-4 px-2 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-t-2xl">
          <div className="col-span-2">Məhsul Adı</div>
          <div className="col-span-2">Kateqoriya</div>
          <div className="col-span-2 text-center">Qiymət</div>
          <div className="col-span-2 text-center border">Status</div>
          <div className="col-span-2 text-center border">Hərəkətlər</div>
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
              mehsullar.map((mehsul) => (
                <div key={mehsul._id}>
                  <ProductRow key={mehsul._id} mehsul={mehsul} />
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
