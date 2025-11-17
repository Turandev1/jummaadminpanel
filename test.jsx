import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/authcontext";
import axios from "axios";
import { ImagePlus } from "lucide-react";
import { useRef } from "react";

// Cloudinary bilgileriniz
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dyepjmaw2/upload";
const UPLOAD_PRESET = "ianeupload"; // Cloudinary unsigned preset

const Ianeyerlestir = () => {
  const [basliq, setBasliq] = useState("");
  const [movzu, setMovzu] = useState("");
  const [miqdar, setMiqdar] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { postiane } = useAuth();
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Yeni dosyaları mevcutlara ekle (aynı isimli varsa tekrar ekleme)
    const newFiles = selectedFiles.filter(
      (f) => !files.some((existing) => existing.name === f.name)
    );

    setFiles((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);

    // 📌 Aynı dosyayı tekrar seçebilmek için input’u sıfırla
    e.target.value = "";
  };

  // ❌ Tek tek silme
  const handleRemove = (index) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    const updatedFiles = files.filter((_, i) => i !== index);

    // Bellekteki URL’yi serbest bırak (memory leak olmasın)
    URL.revokeObjectURL(previews[index]);

    setPreviews(updatedPreviews);
    setFiles(updatedFiles);
  };

  // 🧹 Tümünü silme (isteğe bağlı)
  const clearAll = () => {
    previews.forEach((src) => URL.revokeObjectURL(src));
    setPreviews([]);
    setFiles([]);
  };

  // Cloudinary upload
  const uploadFilesToCloudinary = async (files) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET); // unsigned preset

        // Axios isteği
        const response = await axios.post(CLOUDINARY_URL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Uploading ${file.name}: ${percent}%`);
          },
        });

        return {
          name: file.name,
          url: response.data.secure_url,
        };
      });

      // Tüm upload işlemleri tamamlanınca döndür
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Şəkil yüklənərkən xəta baş verdi");
    }
  };

  const sendIaneRequest = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      let photos = [];
      if (selectedFiles.length > 0) {
        photos = await uploadFilesToCloudinary(selectedFiles);
      }
      console.log("photos:", photos);

      // Backend'e gönder
      const result = await postiane(basliq, movzu, miqdar, photos);

      if (result.success) {
        toast.success(result?.data?.message || "İanə uğurla göndərildi ✅");
        setBasliq("");
        setMovzu("");
        setMiqdar("");
        setSelectedFiles([]);
        setPreviews([]);
      } else {
        toast.error("İanə göndərilərkən xəta baş verdi ❌");
        console.error(result.error || result.message);
      }
    } catch (error) {
      console.error("İanə xətası:", error);
      toast.error("Server və ya upload xətası baş verdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center pt-12 min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <form
        onSubmit={sendIaneRequest}
        className="flex flex-col gap-4 w-full max-w-md max-h-min bg-white/70 p-8 rounded-3xl shadow-[0_3px_3px_rgb(0,0,0,0.12)] border border-indigo-100"
      >
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4 text-center">
          İanə Göndər
        </h2>

        {/* Başlıq */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Başlıq</label>
          <input
            value={basliq}
            onChange={(e) => setBasliq(e.target.value)}
            required
            type="text"
            className="border border-gray-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100 outline-none rounded-xl px-3 py-2 transition-all duration-200"
            placeholder="Məsələn: Məscid təmiri"
          />
        </div>

        {/* Mövzu */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Mövzu</label>
          <input
            value={movzu}
            onChange={(e) => setMovzu(e.target.value)}
            required
            type="text"
            className="border border-gray-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100 outline-none rounded-xl px-3 py-2 transition-all duration-200"
            placeholder="Məsələn: Təmir xərcləri"
          />
        </div>

        {/* İanə Miqdarı */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">İanə miqdarı (₼)</label>
          <input
            value={miqdar === 0 ? "" : miqdar}
            onChange={(e) => setMiqdar(Number(e.target.value))}
            required
            min={1}
            type="number"
            className="border border-gray-200 focus:border-indigo-400 focus:ring focus:ring-indigo-100 outline-none rounded-xl px-3 py-2 transition-all duration-200"
            placeholder="Məsələn: 50"
          />
        </div>

        <div className="flex flex-col gap-3">
          {/* Başlık */}
          <label className="text-sm text-gray-600 font-medium">
            Şəkil yüklə (İstəyə bağlı)
          </label>

          {/* Dosya yükleme alanı */}
          <div
            className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />

            <ImagePlus className="w-8 h-8 mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">
              <span className="font-medium text-blue-600">Kliklə</span> və ya
              faylları bura sürüklə.
            </p>
          </div>

          {/* Önizlemeler */}
          {previews.length > 0 && (
            <>
              <div className="flex gap-3 mt-2 overflow-x-auto pb-2">
                {previews.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-md group"
                  >
                    <img
                      src={src}
                      alt={`preview-${idx}`}
                      className="object-cover w-full h-full"
                    />
                    {/* Silme butonu */}
                    <button
                      onClick={() => handleRemove(idx)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Tümünü sil */}
              <button
                onClick={clearAll}
                className="self-start text-xs text-red-500 hover:text-red-600 mt-1"
              >
                Hamısını sil
              </button>
            </>
          )}
        </div>

        {/* Gönder Butonu */}
        <button
          type="submit"
          className="mt-4 bg-indigo-600 text-white cursor-pointer font-medium py-2 rounded-xl shadow-md hover:shadow-lg hover:bg-indigo-700 transition-all duration-300"
        >
          {isLoading ? "Göndərilir..." : "Göndər"}
        </button>
      </form>
    </div>
  );
};

export default Ianeyerlestir;
