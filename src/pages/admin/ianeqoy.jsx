import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { ImagePlus, X } from "lucide-react";
import { API_URLS } from "../../utils/api";
import useAuth from "../../redux/authredux";
import api from "../../utils/axiosclient";

// NOTE: Placeholder values used for demonstration, replace with actual context/environment variables
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dcn2gnqln/upload";
const UPLOAD_PRESET = "iane_photos";

const Ianeyerlestir = () => {
  const [basliq, setBasliq] = useState("");
  const [odenislinki, setodenislinki] = useState("");
  const [movzu, setMovzu] = useState("");
  const [miqdar, setMiqdar] = useState(""); // string olarak tut
  const [files, setFiles] = useState([]); // gerçek dosyalar
  const [previews, setPreviews] = useState([]); // objectURL'ler
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [bitir, setBitir] = useState(""); // opsiyonel bitiş tarixi
  const [showBitirInput, setShowBitirInput] = useState(false); // giriş alanını göster/gizle
  const [mescids, setmescids] = useState([]);
  const [selectedMescid, setSelectedMescid] = useState("");
  const { accessToken } = useAuth();
  const [listImage, setListImage] = useState(null);
  const [listPreview, setListPreview] = useState(null);
  const listImageRef = useRef(null);
  const [odenissehifesiaz, setOdenissehifesiaz] = useState("");
  const [odenissehifesiAr, setOdenissehifesiAr] = useState("");

  // Dosya seçimi (input veya drop)
  const handleFilesChange = (e) => {
    const incoming = e.target.files ? Array.from(e.target.files) : [];
    addFiles(incoming);

    // Aynı dosyayı tekrar seçebilmek için input’u sıfırla
    if (e.target) e.target.value = "";
  };

  const addFiles = (incomingFiles) => {
    if (!incomingFiles || incomingFiles.length === 0) return;

    // Aynı isimli dosyaları tekrar eklememek için basit kontrol
    const newFiles = incomingFiles.filter(
      (f) =>
        !files.some(
          (existing) => existing.name === f.name && existing.size === f.size,
        ),
    );
    if (newFiles.length === 0) return;

    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Drag & drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleListImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setListImage(file);
    setListPreview(URL.createObjectURL(file));
  };

  const removeListImage = () => {
    if (listPreview) URL.revokeObjectURL(listPreview);
    setListImage(null);
    setListPreview(null);
  };

  // Tek dosyayı sil
  const handleRemove = (index) => {
    // revoke object URL
    URL.revokeObjectURL(previews[index]);

    const updatedPreviews = previews.filter((_, i) => i !== index);
    const updatedFiles = files.filter((_, i) => i !== index);

    setPreviews(updatedPreviews);
    setFiles(updatedFiles);
  };

  // Tümünü temizle
  const clearAll = () => {
    previews.forEach((src) => URL.revokeObjectURL(src));
    setPreviews([]);
    setFiles([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      previews.forEach((src) => URL.revokeObjectURL(src));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchmescids = async () => {
      try {
        const res = await api.get(API_URLS.ADMIN.GETMESCIDS);
        setmescids(res.data.mescids);
      } catch (error) {
        console.error(error);
      }
    };
    fetchmescids();
  }, []);

  const uploadListImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await axios.post(CLOUDINARY_URL, formData);

    return {
      card_image_url: response.data.secure_url,
      card_public_id: response.data.public_id,
    };
  };

  // Cloudinary upload (files dizisini alır)
  const uploadFilesToCloudinary = async (filesToUpload) => {
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET); // unsigned preset

        const response = await axios.post(CLOUDINARY_URL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1),
            );
            console.log(`Uploading ${file.name}: ${percent}%`);
          },
        });

        console.log("response:", response.data);

        return {
          name: file.name,
          url: response.data.secure_url,
          public_id: response.data.public_id,
        };
      });

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

      // miqdar'ı number'a çevir ve doğrula
      const amount = miqdar === "" ? 0 : parseInt(miqdar, 10);
      if (!basliq || !movzu || amount < 1) {
        toast.error(
          "Xahiş olunur bütün tələb olunan sahələri doldurun (miqdar ən az 1 olmalıdır).",
        );
        setIsLoading(false);
        return;
      }

      let cardImage = null;

      if (listImage) {
        cardImage = await uploadListImageToCloudinary(listImage);
      }

      let photos = [];
      if (files.length > 0) {
        photos = await uploadFilesToCloudinary(files);
      }
      console.log("photos:", photos);
      const selectedmescidobj = mescids.find((m) => m._id === selectedMescid);
      console.log("selectedmescidobj:", selectedmescidobj);
      const imamname = selectedmescidobj.name;
      const imamsurname = selectedmescidobj.surname;
      const mescid = selectedmescidobj.mescidname;
      const basladi = new Date();

      // Backend'e gönderme
      const res = await api.post(API_URLS.ADMIN.SETIANE, {
        basliq,
        movzu,
        miqdar,
        mescid,
        imamname,
        imamsurname,
        photos,
        basladi,
        bitir,
        odenislinki,
        cardImage,
        odenissehifesiaz,
        odenissehifesiAr,
      });

      const result = res.data;
      if (result?.success) {
        toast.success(result?.data?.message || "İanə uğurla göndərildi ✅");

        // tüm state'leri temizle
        setBasliq("");
        setMovzu("");
        setMiqdar("");
        setBitir("");
        setodenislinki("");
        setShowBitirInput(false);
        clearAll();
      } else {
        toast.error("İanə göndərilərkən xəta baş verdi ❌");
        console.error(result?.error || result?.message);
      }
    } catch (error) {
      console.error("İanə xətası:", error);
      toast.error("Server və ya upload xətası baş verdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center pt-12 min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 font-inter">
      <style>{`
        /* Custom styles for font and scrollbar in the live view */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
        .overflow-x-auto::-webkit-scrollbar { height: 8px; }
        .overflow-x-auto::-webkit-scrollbar-thumb { background-color: #9ca3af; border-radius: 4px; }
        .overflow-x-auto::-webkit-scrollbar-track { background-color: #f3f4f6; }
      `}</style>
      <form
        onSubmit={sendIaneRequest}
        className="w-full max-w-5xl bg-white/70 p-8 rounded-3xl shadow border border-indigo-100 backdrop-blur-sm"
      >
        <h2 className="text-3xl font-bold text-indigo-800 mb-4 text-center">
          İanə Göndər
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Mescid seçimi */}
          <div className="flex flex-col mb-2">
            <label className="text-sm text-gray-700 font-medium mb-1">
              Mescid seçin
            </label>
            <select
              value={selectedMescid}
              onChange={(e) => setSelectedMescid(e.target.value)}
              required
              className="border border-gray-300 focus:border-indigo-500 cursor-pointer focus:ring-2 focus:ring-indigo-200 outline-none rounded-xl px-2 py-2 transition-all duration-200"
            >
              <option value="">Mescid seçin</option>
              {mescids.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.mescidname}
                </option>
              ))}
            </select>
          </div>

          {/* Başlıq */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 font-medium mb-1">
              Başlıq(Qısa)
            </label>
            <input
              value={basliq}
              onChange={(e) => setBasliq(e.target.value)}
              required
              type="text"
              className="border first-letter:capitalize border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none rounded-xl px-4 py-2 transition-all duration-200"
              placeholder="Məsələn: Məscid təmiri"
            />
          </div>

          {/* odenis az */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 font-medium mb-1">
              Ödəniş səhifəsi (Azərbaycan dili)
            </label>
            <textarea
              value={odenissehifesiaz}
              onChange={(e) => setOdenissehifesiaz(e.target.value)}
              required
              type="text"
              className="min-h-20 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none rounded-xl px-4 py-2"
              placeholder="Məsələn: Ayə və ya hədis"
            />
          </div>

          {/* Mövzu */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 font-medium mb-1">
              Açıqlama (Problemi detallı təsvir edin)
            </label>
            <textarea
              autoCapitalize="on"
              value={movzu}
              onChange={(e) => setMovzu(e.target.value)}
              required
              placeholder="Məsələn: Təmir xərcləri"
              className="border first-letter:uppercase border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none rounded-xl px-4 py-2 transition-all duration-200 resize-none overflow-y-auto"
              style={{
                minHeight: "80px",
                maxHeight: "200px",
              }}
            />
          </div>

          {/* odenis ar */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 font-medium mb-1">
              Ödəniş səhifəsi (Ərəbcə)
            </label>
            <textarea
              dir="rtl"
              value={odenissehifesiAr}
              onChange={(e) => setOdenissehifesiAr(e.target.value)}
              required
              type="text"
              className="min-h-20 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none rounded-xl px-4 py-2 text-right"
              placeholder="Məsələn: Ayə və ya hədis ərəbcə"
            />
          </div>

          {/* odenislinki hissesi */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 font-medium mb-1">
              Ödəniş linki
            </label>
            <input
              value={odenislinki}
              onChange={(e) => setodenislinki(e.target.value)}
              required
              type="text"
              className="border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none rounded-xl px-4 py-2 transition-all duration-200"
              placeholder="url"
            />
          </div>

          {/* İanə Miqdarı */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 font-medium mb-1">
              İanə miqdarı (₼)
            </label>
            <input
              value={miqdar}
              onChange={(e) => setMiqdar(e.target.value.replace(/[^0-9]/g, ""))} // Sadece rakam kabul et
              required
              min={1}
              type="text" // Input type'ı text olarak tutmak daha güvenlidir, ancak klavyeyi numerik göstermek için "pattern" eklenebilir.
              inputMode="numeric"
              pattern="[0-9]*"
              className="border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none rounded-xl px-4 py-2 transition-all duration-200"
              placeholder="Məsələn: 50"
            />
          </div>

          {/* Bitmə tarixi (opsiyonel) */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 font-medium mb-1">
              Bitmə tarixi (İstəyə bağlı)
            </label>

            {/* Aktivləşdir butonu */}
            {!showBitirInput && (
              <button
                type="button"
                onClick={() => setShowBitirInput(true)}
                className="bg-indigo-100 cursor-pointer text-indigo-700 text-sm px-3 py-2 rounded-lg w-max hover:bg-indigo-200 transition"
              >
                Bitmə tarixini əlavə et
              </button>
            )}

            {/* Tarix seçici (aktivləşdikdən sonra görünür) */}
            {showBitirInput && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="date"
                  value={bitir}
                  onChange={(e) => setBitir(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="border border-gray-300 focus:border-indigo-500 cursor-pointer focus:ring-2 focus:ring-indigo-200 outline-none rounded-xl px-4 py-2 transition-all duration-200 w-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    setBitir("");
                    setShowBitirInput(false);
                  }}
                  className="bg-red-100 cursor-pointer text-red-700 text-sm px-3 py-2 rounded-lg hover:bg-red-200 transition"
                >
                  Ləğv et
                </button>
              </div>
            )}
          </div>

          {/* List üçün şəkil */}
          <div className="flex flex-col gap-3 h-full">
            <label className="text-sm text-gray-700 font-medium">
              List üçün şəkil (Kart görüntüsü)
            </label>

            <p className="text-xs text-gray-500">
              Tövsiyə olunan ölçü: 400x400px. Bu şəkil ianələr siyahısında
              görünəcək.
            </p>

            <div
              onClick={() => listImageRef.current.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-4 min-h-[180px] flex items-center justify-center cursor-pointer hover:border-indigo-400 transition"
            >
              <input
                ref={listImageRef}
                type="file"
                accept="image/*"
                onChange={handleListImageChange}
                className="hidden"
                multiple={false}
              />
              <span className="text-sm text-indigo-600 font-medium">
                Şəkil seç
              </span>
            </div>
          </div>

          {/* sekil hissesi */}
          <div className="flex flex-col gap-3 h-full justify-end">
            {/* Başlık */}
            <label className="text-sm text-gray-700 font-medium pt-2">
              Şəkil yüklə (İstəyə bağlı)
            </label>

            {/* Dosya yükleme alanı (drag & drop destekli) */}
            <div
              ref={dropRef}
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 min-h-[180px] border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 transition cursor-pointer ${
                dragOver
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-gray-300 hover:border-indigo-300"
              }`}
            >
              {/* FİX: The 'absolute inset-0 opacity-0' style is replaced with 'hidden'. 
                This ensures the native input is completely removed from the layout, 
                preventing it from intercepting clicks and interfering with the 
                programmatic click triggered by the parent div, which fixes the 
                OS file dialog selection issue.
            */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesChange}
                className="hidden"
              />

              <ImagePlus className="w-8 h-8 mb-2 text-indigo-400" />
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-indigo-600">Kliklə</span> və
                ya faylları bura sürüklə.
              </p>
            </div>
          </div>
        </div>

        {/* ================= PREVIEW SECTION ================= */}
        {(listPreview || previews.length > 0) && (
          <div className="mt-10 space-y-8">
            {/* List Image Preview */}
            {listPreview && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Kart Şəkli Preview
                </h3>

                <div className="relative w-40 aspect-square rounded-2xl overflow-hidden shadow-md border border-gray-200 group">
                  <img
                    src={listPreview}
                    alt="list-preview"
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeListImage}
                    className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Multiple Images Preview */}
            {previews.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Yüklənən Şəkillər
                  </h3>

                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Hamısını sil ({files.length})
                  </button>
                </div>

                <div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4
        "
                >
                  {previews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
                    >
                      <img
                        src={src}
                        alt={`preview-${idx}`}
                        className="w-full h-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gönder Butonu */}
        <div className="w-full  flex justify-center mt-4 mb-8">
          <button
            type="submit"
            className="mt-6 px-12 text-2xl bg-indigo-600 text-white cursor-pointer font-semibold tracking-wide py-3 rounded-xl shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Göndərilir...</span>
              </div>
            ) : (
              "Göndər"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Ianeyerlestir;
