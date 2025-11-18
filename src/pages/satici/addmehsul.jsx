import { ImagePlus } from "lucide-react";
import React, { useState } from "react";
import { useRef } from "react";
import api from "../../utils/axiosclient";
import { API_URLS } from "../../utils/api";
import useAuth from "../../redux/authredux";
import { toast } from "react-toastify";
const AddMehsul = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    category: "",
    subcategory: "",
    price: "",
    stock: "",
    features: "",
  });
  const { user } = useAuth();
  const [images, setImages] = useState([]); // seçilen resimleri burada tutacağız
  const [modalImage, setModalImage] = useState(null); // modal için
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (
    //   !formData.name ||
    //   !formData.description ||
    //   !formData.price ||
    //   !formData.stock ||
    //   !formData.content ||
    //   !formData.features
    // )
    //   return toast.error("Lazımi bütün sahələri doldurun");

    const userId = user.id || user._id;
    try {
      const res = await api.post(API_URLS.SATICI.MEHSULQOY, {
        id: userId,
        ad: user.ad,
        soyad: user.soyad,
        email: user.email,
        mehsuladi: formData.name,
        aciqlama: formData.description,
        terkibi: formData.content,
        kateqoriya: formData.category,
        altkateqoriya: formData.subcategory,
        depo: formData.stock,
        qiymet: formData.price,
        ozellikler: formData.features,
      });

      if (res.data.success) {
        toast.success("Məhsul uğurla yaradıldı");
      }
      console.log("res:", res.data);
    } catch (error) {
      console.error(error);
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
            className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300"
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
            placeholder="Məhsul haqqında açıqlama"
            className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300"
            rows={3}
            required
          />
        </div>

        {/* Kategori / Alt kategori */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Kateqoriya</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            >
              <option value="">Kateqoriya seçin</option>
              <option value="gida">Qida</option>
              <option value="icecek">İçəcək</option>
              <option value="aksesuar">Aksesuar</option>
              <option value="digər">Digər</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Alt Kateqoriya</label>
            <input
              type="text"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              placeholder="Alt kategori (opsiyonel)"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

        {/* Fiyat / Stok */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Qiymət (AZN)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
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
        </div>

        {/* Özellikler */}
        <div>
          <label className="block text-gray-700 mb-1">
            Özəlliklər (vergüllə ayır)
          </label>
          <input
            type="text"
            name="features"
            value={formData.features}
            onChange={handleChange}
            placeholder="Məs: orqanik, qlütensiz, təzə"
            className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-300"
          />
        </div>

        {/* Resim yükleme */}
        <div className="flex flex-col gap-3">
          <label className="text-sm text-gray-700 font-medium pt-2">
            Şəkil yüklə (İstəyə bağlı)
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
          onClick={handleSubmit}
          className="bg-indigo-500 text-white cursor-pointer text-xl font-semibold py-2 px-4 rounded-md hover:bg-indigo-800 hover:scale-110 transition-all"
        >
          Məhsulu əlavə et
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

export default AddMehsul
