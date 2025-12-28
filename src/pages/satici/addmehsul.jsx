import { ImagePlus } from "lucide-react";
import React, { useState } from "react";
import { useRef } from "react";
import api from "../../utils/axiosclient";
import { API_URLS } from "../../utils/api";
import useAuth from "../../redux/authredux";
import { toast } from "react-toastify";
import axios from "axios";
import { subcategoriesMap } from "../../utils/subcategories";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dcn2gnqln/upload";
const UPLOAD_PRESET = "product_photos";

const AddMehsul = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    qiymet: "",
    endirimliqiymet: "",
    stock: "",
    brand: "",
    miqdar: "",
    olcuvahidi: "",
    kutle: "",
    terkibi: "",
    secilmisfiliallar: [],
  });
  const { user } = useAuth();
  const [images, setImages] = useState([]); // seçilen resimleri burada tutacağız
  const [modalImage, setModalImage] = useState(null); // modal için
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [deliveryType, setDeliveryType] = useState("SELF"); // 'SELF' və ya 'YANGO'
  const [isCustomDelivery, setIsCustomDelivery] = useState(false);
  const [customFee, setCustomFee] = useState(0);

  const handleBranchSelect = (addr) => {
    setFormData((prev) => {
      const isSelected = prev.secilmisfiliallar.find((b) => b.id === addr._id);

      if (isSelected) {
        // Əgər artıq seçilibsə, massivdən çıxar
        return {
          ...prev,
          secilmisfiliallar: prev.secilmisfiliallar.filter(
            (b) => b.id !== addr._id
          ),
        };
      } else {
        // Seçilməyibsə, tam obyekt olaraq əlavə et
        return {
          ...prev,
          secilmisfiliallar: [
            ...prev.secilmisfiliallar,
            {
              id: addr._id,
              ad: addr.ad,
              fullAddress: addr.address.fullAddress,
              location: addr.location, // Kuryer üçün koordinatlar mütləq lazımdır
            },
          ],
        };
      }
    });
  };

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
      // kateqoriya dəyişəndə alt kateqoriya sıfırlansın
      ...(name === "category" && { subcategory: "" }),
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setImages((prev) => [...prev, ...files]);

    if (fileInputRef.current) fileInputRef.current.value = null;
    setDragOver(false); // <-- ekle
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);

    // Input'u sıfırla, böylece tekrar aynı dosya seçilebilir
    e.target.value = null;
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const openModal = (file) => {
    const url = URL.createObjectURL(file); // sadece File kullan
    setModalImage(url);
  };

  const closeModal = () => {
    if (modalImage) URL.revokeObjectURL(modalImage);
    setModalImage(null);
  };

  const uploadFileToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await axios.post(CLOUDINARY_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return {
        public_id: res.data.public_id,
        secure_url: res.data.secure_url,
        original_filename: res.data.original_filename,
      };
    } catch (error) {
      console.error("Cloudinary error:", error);
      toast.error("Şəkil yüklənmədi");
      return null;
    }
  };
  //

  // mehsul yaradir
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Switch(true) blokuna girməzdən əvvəl məbləğləri parse edək (təkrar istifadə üçün)
    const priceNum = parseFloat(formData.qiymet);
    const discountPriceNum = parseFloat(formData.endirimliqiymet);

    // --- VALIDASİYA SWITCH BLOQU ---
    switch (true) {
      // 1. Şəkil yoxlaması
      case images.length === 0:
        toast.error(
          "Proqramda göstərilməsi üçün məhsula aid heç olmasa 1 şəkil seçilməlidir",
          { autoClose: 3000 }
        );
        return;

      // 2. Qiymət məntiqləri
      case !!formData.endirimliqiymet && !formData.qiymet:
        toast.error(
          "Endirimli qiymət varsa qiymət də daxil edilməlidir. Zəhmət olmasa hər iki xananı doldurun",
          { autoClose: 6000 }
        );
        return;

      case discountPriceNum > priceNum:
        toast.error("Endirimli qiymət əsas qiymətdən böyük ola bilməz.", {
          autoClose: 4000,
        });
        return;

      // 3. YANGO Çatdırılma validasiyası
      case deliveryType === "YANGO" && formData.secilmisfiliallar.length === 0:
        toast.error("Yango Delivery üçün ən azı bir filial seçilməlidir!");
        return;

      // Validasiya blokunda bunları saxlayın:
      case isCustomDelivery && (!customFee || parseFloat(customFee) < 0):
        toast.error("Xüsusi çatdırılma seçildikdə qiymət daxil edilməlidir!");
        setSending(false);
        return;
      default:
        // Heç bir case-ə girmədisə, validasiya keçildi deməkdir.
        break;
    }

    // --- VALIDASİYA KEÇİLDİSƏ PROSES BAŞLAYIR ---
    setUploading(true);

    try {
      // 1) Şəkillər Cloudinary-ə
      const uploadedImages = await Promise.all(
        images.map((img) => uploadFileToCloudinary(img))
      );
      setUploading(false);

      const validImages = uploadedImages.filter(Boolean);
      if (!validImages.length && images.length > 0) {
        toast.error("Şəkillər yüklənmədi.");
        return;
      }
      const formatteddescription = formData.description
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .map(
          (item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
        );

      // 2) Backend-ə məlumat göndərilir
      setSending(true);

      const userId = user.id || user._id;

      const res = await api.post(API_URLS.SATICI.MEHSULQOY, {
        id: userId,
        ad: user.ad,
        soyad: user.soyad,
        email: user.email,
        phone: user.phone,
        marketname: user.market?.ad,
        mehsuladi:
          formData.name.charAt(0).toUpperCase() +
          formData.name.slice(1).toLowerCase(),
        aciqlama: formatteddescription,
        kateqoriya: formData.category,
        altkateqoriya: formData.subcategory,
        depo: formData.stock,
        qiymet: formData.qiymet,
        endirimliqiymet: formData.endirimliqiymet,
        brand:
          formData.brand.charAt(0).toUpperCase() +
          formData.brand.slice(1).toLowerCase(),
        olcuvahidi: formData.olcuvahidi,
        miqdari: formData.miqdar,
        productphotos: validImages,
        terkibi: formData.terkibi,
        kutle: formData.kutle,
        isCustomDelivery,
        customFee,
        filiallar: formData.secilmisfiliallar,
        deliveryoptions: {
          deliveryType: deliveryType,
          iscustomdelivery: isCustomDelivery,
          customfee: isCustomDelivery ? parseFloat(customFee) : 0,
        },
      });

      if (res.data.success) {
        toast.success("Məhsul uğurla yaradıldı");
        // Formu təmizləmə kodları...
        setFormData({
          name: "",
          description: "",
          category: "",
          subcategory: "",
          qiymet: "",
          endirimliqiymet: "",
          stock: "",
          brand: "",
          miqdar: "",
          olcuvahidi: "",
          secilmisfiliallar: [],
          kutle: "",
          terkibi: "",
        });
        setDeliveryType("SELF");
        setImages([]);
        setCustomFee(0);
      }
      setSending(false);
    } catch (error) {
      console.error("Xəta:", error);
      toast.error("Məhsul əlavə olunarkən xəta baş verdi");
      setSending(false);
    }
  };

  return (
    <div className="p-8 bg-gray-200 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Yeni məhsul əlavə et</h1>
      <form
        className="bg-white p-6 rounded-xl shadow-lg space-y-4"
        onSubmit={handleSubmit}
      >
        {/* Ürün adı */}
        <div>
          <label className="block text-gray-700 mb-1">Məhsul adı</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Məhsulun adını yazın"
            className="w-full border capitalize border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300"
            required
          />
        </div>
        {/* Açıklama */}
        <div>
          <label className="block text-gray-700 mb-1">Açıqlama</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Məhsul haqqında açıqlama.Baş hərflər avtomatik böyüdülür.Başlıqların sonuna 2 nöqtə qoyun və maddələri vergüllə ayırın."
            className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300"
            rows={3}
            required
          />
        </div>
        {/* terkibi */}
        <div>
          <label className="block text-gray-700 mb-1">
            Tərkibi(Istəyə bağlı)
          </label>
          <textarea
            name="terkibi"
            value={formData.terkibi}
            onChange={handleChange}
            placeholder="Məhsulun tərkibini yazın.Baş hərflər avtomatik böyüdülür.Başlıqların sonuna 2 nöqtə qoyun və maddələri vergüllə ayırın."
            rows={3}
            className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300"
          ></textarea>
        </div>
        {/* Kategori / Alt kategori */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Kateqoriya</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 cursor-pointer rounded-md p-2 outline-none"
              required
            >
              <option value="">Kateqoriya seçin</option>
              <option value="qida">Qida</option>
              <option value="shexsibaxim">Şəxsi baxım</option>
              <option value="temizlikmehsullari">Təmizlik məhsulları</option>
              <option value="saglamliq">Sağlamlıq məhsulları</option>
              <option value="islamieshyavekitablar">
                İslami əşya və kitablar
              </option>
              <option value="ushaqmehsullari">Uşaq məhsulları</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Alt Kateqoriya</label>
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="w-full border border-gray-300 cursor-pointer rounded-md p-2 outline-none"
              disabled={!subcategoriesMap[formData.category]} // kateqoriya seçilməyibsə, select disable olsun
            >
              <option value="">Alt kateqoriya seçin</option>

              {/* seçilmiş kateqoriyaya uyğun alt kateqoriləri göstəririk */}
              {subcategoriesMap[formData.category]?.map((sub, index) => (
                <option key={index} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* miqdar/ceki */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Miqdar</label>
            <input
              type="number"
              name="miqdar"
              value={formData.miqdar}
              onChange={handleChange}
              placeholder="Məhsulun miqdarı"
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Ölçü vahidi</label>
            <select
              name="olcuvahidi"
              value={formData.olcuvahidi}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 outline-none cursor-pointer"
              required
            >
              <option value="">Ölçü vahidini seç</option>
              <option value="Ədəd">Ədəd</option>
              <option value="Kq">Kiloqram</option>
              <option value="Q">Qram</option>
              <option value="L">Litr</option>
              <option value="Ml">Millilitr</option>
            </select>
          </div>
        </div>
        {/* Fiyat / Stok */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">
              Endirimli qiymət (AZN)
            </label>
            <input
              type="number"
              name="endirimliqiymet"
              value={formData.endirimliqiymet}
              onChange={handleChange}
              placeholder="Qiyməti yazın"
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Qiymət (AZN)</label>
            <input
              type="number"
              name="qiymet"
              value={formData.qiymet}
              onChange={handleChange}
              placeholder="Qiyməti yazın"
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Depo</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Ehtiyatdakı məhsul miqdarı"
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Məhsulun kütləsi</label>
            <input
              type="number"
              name="kutle"
              value={formData.kutle}
              onChange={handleChange}
              placeholder="Məhsulun kütləsi (kq ilə)"
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300"
              required
            />
          </div>
          <div className="grid grid-cols-1">
            <label className="block text-gray-700 mb-1">Brand (Varsa)</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Məhsulun brandini qeyd edin və ya boş qoyun"
              className="w-full capitalize border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300"
            />
          </div>
        </div>
        {/* brand */}

        {/* Çatdırılma Seçimləri */}
        <div className="mt-6 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Çatdırılma Seçimi
          </h3>

          {/* Seçim Düymələri */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setDeliveryType("SELF")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium border transition-all cursor-pointer ${
                deliveryType === "SELF"
                  ? "bg-green-600 border-green-600 text-white shadow-md"
                  : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Özüm çatdırıram
            </button>

            <button
              type="button"
              onClick={() => setDeliveryType("YANGO")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium border transition-all cursor-pointer ${
                deliveryType === "YANGO"
                  ? "bg-green-600 border-green-600 text-white shadow-md"
                  : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Yango Delivery
            </button>
          </div>

          {/* Özüm Çatdırıram Seçildikdə Çıxan Sahələr */}
          {deliveryType === "SELF" && (
            <div className="mt-6 p-5 bg-white rounded-xl border border-gray-200 shadow-sm block col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Çatdırılma Ayarları
              </h3>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                <div className="flex-1">
                  <p className="text-sm text-blue-800 font-medium">
                    Standart Çatdırılma:{" "}
                    <span className="font-bold">
                      Mağaza profilindəki qaydalar tətbiq olunacaq.
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg border border-gray-300">
                  <input
                    type="checkbox"
                    checked={isCustomDelivery}
                    onChange={(e) => setIsCustomDelivery(e.target.checked)}
                    className="w-5 h-5 text-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Bu məhsul üçün xüsusi çatdırılma qiyməti təyin et (Məs: Çox
                    ağır məhsullar üçün)
                  </span>
                </label>

                {isCustomDelivery && (
                  <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xüsusi çatdırılma haqqı (AZN)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                      value={customFee}
                      onChange={(e) => setCustomFee(e.target.value)}
                      placeholder="Məs: 10.00"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Yango Seçildikdə Çıxan Mesaj */}
          {deliveryType === "YANGO" && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 w-full">
              <label className="block text-gray-700 font-bold mb-2">
                Məhsulun satılacağı filialları seçin:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {user?.market?.address?.map((addr) => {
                  const isChecked = formData.secilmisfiliallar.some(
                    (b) => b.id === addr._id
                  );
                  return (
                    <div
                      key={addr._id}
                      onClick={() => handleBranchSelect(addr)}
                      className={`flex col-span-2 items-start max-h-md p-3 border rounded-md cursor-pointer transition-all ${
                        isChecked
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="mt-1 h-4 w-4 text-indigo-600 cursor-pointer"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-gray-800">
                          {addr.ad}
                        </p>
                        <p className="text-xs text-gray-500">
                          {addr.address.fullAddress}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {formData.secilmisfiliallar.length === 0 && (
                <p className="text-xs text-orange-600 mt-2">
                  ! Ən azı bir filial seçməlisiniz.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Resim yükleme */}
        <div className="flex flex-col gap-3">
          <label className="text-sm text-gray-700 font-medium pt-2">
            Şəkil yüklə (Ən az 1 şəkil tələb olunur)
          </label>

          {/* Drag & drop alanı */}
          <div
            ref={dropRef}
            onClick={() => fileInputRef.current.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 transition cursor-pointer ${
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

            <ImagePlus className="w-8 h-8 mb-2 text-indigo-400" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-indigo-600">Kliklə</span> və
              ya faylları bura sürüklə.
            </p>
          </div>

          {/* Önizlemeler */}
          {images.length > 0 && (
            <>
              <div className="flex gap-3 mt-2 overflow-x-auto bg-gray-200 p-4 rounded-lg">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden shadow-md group border border-gray-500"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`preview-${idx}`}
                      className="object-cover w-full h-full cursor-pointer"
                      onClick={() => openModal(img)}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute top-1 right-1 w-10 h-10 text-4xl cursor-pointer bg-red-500 hover:bg-red-800 text-white rounded-full opacity-100 group-hover:opacity-100 transition shadow-lg"
                      aria-label="Şəkli sil"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setImages([])}
                className="self-start text-sm py-2 text-red-500 cursor-pointer duration-300 transition-all opacity-100 border border-black px-4 rounded-2xl hover:scale-125 font-medium mt-1"
              >
                Hamısını sil ({images.length})
              </button>
            </>
          )}
        </div>
        {/* Submit */}
        <button
          type="submit"
          disabled={uploading || sending}
          className={`bg-indigo-500 text-white text-xl font-semibold py-2 px-4 rounded-md 
    transition-all ${
      uploading || sending
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-indigo-800 hover:scale-110 cursor-pointer"
    }`}
        >
          {uploading
            ? "Şəkillər yüklənir..."
            : sending
            ? "Göndərilir..."
            : "Məhsulu əlavə et"}
        </button>
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
            onClick={(e) => e.stopPropagation()} // modal içindeki clicki kapatma
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
  );
};

export default AddMehsul;
