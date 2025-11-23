import { toast } from "react-toastify";
import React, { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import useAuth from "../../redux/authredux";
import { useDispatch } from "react-redux";
import { logout, setauthdata } from "../../redux/store";
import axios from "axios";
import { API_URLS } from "../../utils/api";
import api from "../../utils/axiosclient";
import { fonts } from "../../../fonts";

// PhotoPicker.jsx

const PhotoPicker = ({
  existingPhotoUrl,
  onUpload, // async function(file) => returns { success, user, secure_url } veya throw
  onClose, // optional
}) => {
  const fileRef = useRef(null);
  const [localPreview, setLocalPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBig, setShowBig] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const openFileDialog = () => fileRef.current?.click();

  const handleFileChange = (e) => {
    setError("");
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Zəhmət olmasa bir şəkil faylı seçin.");
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (f.size > maxSize) {
      setError("Fayl çox böyükdür. Maksimum 5MB.");
      return;
    }
    setSelectedFile(f);
    const url = URL.createObjectURL(f);
    setLocalPreview(url);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setLocalPreview("");
    setError("");
    if (onClose) onClose();
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setError("Əvvəlcə bir şəkil seçin.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await onUpload(selectedFile); // Dashboard içinde API çağrısını yap
      // onUpload kendi dispatch/notification'ını yapmalı
      setLoading(false);
      // Success — panel kapatılabilir
      if (onClose) onClose(res);
    } catch (err) {
      console.error(err);
      setError(err.message || "Yükləmə uğursuz oldu");
      setLoading(false);
    }
  };

  return (
    <div className="absolute z-50 top-36 left-0 right-0 p-4 bg-white shadow-lg rounded-b-lg">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {localPreview ? (
            <img
              src={localPreview}
              alt="preview"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowBig(true)}
            />
          ) : existingPhotoUrl ? (
            <img
              src={existingPhotoUrl}
              alt="current"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera size={28} opacity={0.3} />
          )}
        </div>

        <div className="flex-1">
          <div className="flex gap-2">
            <button
              onClick={openFileDialog}
              className="px-3 py-2 bg-blue-600 text-white rounded-md cursor-pointer"
              aria-label="Resim seç"
            >
              Foto seç
            </button>

            <button
              onClick={handleCancel}
              className="px-3 py-2 border rounded-md cursor-pointer"
              aria-label="Ləğv et"
            >
              Ləğv et
            </button>

            <button
              onClick={handleUploadClick}
              className={`px-3 py-2 rounded-md cursor-pointer ${
                loading
                  ? "opacity-60 cursor-not-allowed"
                  : "bg-green-600 text-white"
              }`}
              disabled={loading}
              aria-label="Göndər"
            >
              {loading ? "Göndərilir..." : "Göndər"}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {!localPreview && !existingPhotoUrl && (
            <p className="text-sm text-gray-500 mt-2">Foto seçilməyib</p>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {showBig && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center"
          onClick={() => setShowBig(false)}
        >
          <img
            src={localPreview}
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dcn2gnqln/upload";
const UPLOAD_PRESET = "testpreset";

const Dashboard = () => {
  const { user, accessToken } = useAuth();
  const [editable, setEditable] = useState(false);
  const [step, setStep] = useState(
    localStorage.getItem("verificationSent") ? "code" : "email"
  );
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [showpicker, setshowpicker] = useState(false);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    image: "",
  });

  const [formData, setFormData] = useState({
    ad: user?.ad || "",
    soyad: user?.soyad || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dogumtarixi: user?.dogumtarixi || "",
    marketname: user?.market?.ad || "",
    vöen: user?.vöen || "",
  });

  const sendEmailCode = async () => {
    if (!email.includes("@")) {
      return toast.error("Düzgün email yazın.");
    }

    try {
      setLoading(true);

      const res = await api.post(API_URLS.SATICI.SENDVERIFYCODE, {
        email,
      });

      const data = res.data;
      if (data.success) {
        localStorage.setItem("verificationSent", "true");
        toast.success("Kod email ünvanınıza göndərildi.", { autoClose: 2000 });
        setStep("code");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data, "Xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  const resendEmailCode = async () => {
    try {
      setLoading(true);

      const res = await api.post(API_URLS.SATICI.SENDVERIFYCODE, {
        email: user?.email,
      });

      const data = res.data;
      if (data.success) {
        localStorage.setItem("verificationSent", "true");
        toast.success("Kod email ünvanınıza göndərildi.", { autoClose: 2000 });
        setStep("code");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data, "Xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailCode = async () => {
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      return toast.error("Kodu tam daxil edin.");
    }

    try {
      setLoading(true);

      const userId = user.id || user._id;

      const res = await api.post(API_URLS.SATICI.VERIFYEMAILCODE, {
        id: userId,
        code: fullCode,
      });

      const data = res.data;

      if (data.success) {
        toast.success("Email təsdiqləndi!");

        // Redux ilə user məlumatını yenilə
        dispatch(
          setauthdata({
            user: data.user,
          })
        );

        localStorage.removeItem("verificationSent");
      }
    } catch (err) {
      console.error(err);
      toast.error("Xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  const handlecompeletation = async () => {
    if (
      !formData.ad ||
      !formData.soyad ||
      !formData.email ||
      !formData.phone ||
      !formData.dogumtarixi ||
      !formData.marketname ||
      !formData.vöen
    ) {
      return toast.error("Zəhmət olmasa bütün sahələri doldurun.");
    }

    if (formData.vöen.length < 9) {
      return toast.error("Düzgün vöen daxil edin");
    }

    try {
      setLoading(true);
      const userId = user.id || user._id;

      const res = await api.patch(
        API_URLS.SATICI.COMPLETEACCOUNTSETUP,
        {
          id: userId,
          ...formData,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const data = res.data;

      if (data.success) {
        dispatch(
          setauthdata({
            user: data.user,
          })
        );

        toast.success("Hesab uğurla tamamlandı!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.hata || "Xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const userId = user.id || user._id;
      const res = await api.patch(
        API_URLS.SATICI.EDITACCOUNT,
        {
          id: userId,
          ad: formData.ad,
          soyad: formData.soyad,
          email: formData.email,
          phone: formData.phone,
          dogumtarixi: formData.dogumtarixi,
          marketname: formData.marketname,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const data = res.data;
      console.log("data:", data);
      if (data.success) {
        dispatch(
          setauthdata({
            user: data.user,
          })
        );
        toast.success("Profil məlumatları uğurla dəyişdirildi");
      }
      setEditable(false);
    } catch (error) {
      console.error(error);
      toast.error("Dəyişdirilə bilmədi");
    }
  };

  const handleUpload = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);

    const uploadRes = await axios.post(CLOUDINARY_URL, fd);
    const uploadData = uploadRes.data;
    if (!uploadData.secure_url) throw new Error("Cloudinary'den url alınamadı");

    const userID = user.id || user._id;

    const backendRes = await api.post(
      API_URLS.SATICI.PROPHILEPHOTO,
      {
        id: userID,
        secure_url: uploadData.secure_url,
        public_id: uploadData.public_id,
        original_filename: uploadData.original_filename,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const backendData = backendRes.data;
    if (!backendData.success) throw new Error("Sunucu güncellemesi başarısız");
    toast.success(backendData.mesaj);
    console.log("user:", backendData.user);
    dispatch(
      setauthdata({
        user: backendData.user,
      })
    );
    return { success: true, user: backendData.user };
  };

  return (
    <div className="p-8 w-full bg-gray-100 min-h-screen">
      <div className="flex flex-row justify-between items-center px-2 my-4">
        <h1 className="text-2xl font-semibold">Profilim</h1>
        <button
          onClick={() => dispatch(logout())}
          className="border text-xl px-4 py-1 cursor-pointer duration-300 rounded-full hover:bg-red-500 hover:border-red-500 hover:text-white"
        >
          Hesabdan çıx
        </button>
      </div>

      {/* PROFIL KARTI */}
      <div className="bg-white shadow-md rounded-xl relative p-6 flex items-center gap-6">
        <div className="w-28 h-28 rounded-full p-1 overflow-hidden bg-gray-200 flex justify-center items-center">
          {user.profilephoto?.secure_url ? (
            <img
              src={user.profilephoto.secure_url}
              className="w-full h-full object-cover rounded-full cursor-pointer"
              onClick={() =>
                setPreviewModal({
                  open: true,
                  image: user.profilephoto.secure_url,
                })
              }
            />
          ) : (
            <Camera opacity={0.3} size={50} />
          )}

          <button
            onClick={() => setshowpicker(!showpicker)}
            className="absolute bottom-6 left-24 bg-white p-4 cursor-pointer rounded-full hover:scale-110 duration-200 shadow"
          >
            <Camera size={20} />
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            {user.ad} {user.soyad}
          </h2>
          <p className="text-sm text-gray-500">Hesab növü: Satıcı</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        {showpicker && (
          <PhotoPicker
            existingPhotoUrl={user.profilephoto.secure_url}
            onUpload={handleUpload}
            onClose={() => setshowpicker(false)}
          />
        )}
      </div>

      {/* ŞƏXSİ MƏLUMATLAR */}
      <div className="bg-white shadow-md rounded-xl p-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Şəxsi məlumatlar</h2>

          {!editable ? (
            <button
              className="bg-orange-500 cursor-pointer text-white px-4 py-1 rounded-md"
              onClick={() => setEditable(true)}
            >
              Redaktə et
            </button>
          ) : null}
        </div>

        {/* EDIT MODE */}
        {editable ? (
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Ad", name: "ad" },
              { label: "Soyad", name: "soyad" },
              { label: "Email", name: "email" },
              { label: "Vöen", name: "vöen" },
              {
                label: "Əlaqə nömrəsi",
                name: "phone",
                type: "tel",
                pattern: "[0-9]{3}-[0-9]{3}-[0-9]{2}-",
              },
              { label: "Doğum tarixi", name: "dogumtarixi", type: "date" },
              { label: "Market adı", name: "marketname" },
            ].map((f) => (
              <div key={f.name} className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">{f.label}</label>
                <input
                  type={f.type || "text"}
                  name={f.name}
                  value={formData[f.name]}
                  onChange={handleInput}
                  className="border rounded-md px-3 py-2"
                  pattern={f.pattern || ""}
                />
              </div>
            ))}

            <div className="col-span-2 flex cursor-pointer justify-end gap-3 mt-4">
              <button
                onClick={() => setEditable(false)}
                className="border px-4 py-2 rounded-md"
              >
                Ləğv et
              </button>

              <button
                onClick={handleSave}
                className="bg-green-600 cursor-pointer text-white px-4 py-2 rounded-md"
              >
                Yadda saxla
              </button>
            </div>
          </div>
        ) : (
          /* READ MODE (Görüntüleme modu) */
          <div className="grid grid-cols-2 text-sm gap-y-5">
            <ProfileField label="Ad" value={user.ad} />
            <ProfileField label="Soyad" value={user.soyad} />
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="Vöen" value={user.vöen} />
            <ProfileField label="Telefon" value={user.phone} />
            <ProfileField
              label="Doğum tarixi"
              value={
                user.dogumtarixi
                  ? new Date(user.dogumtarixi).toLocaleDateString("az-AZ", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : "----"
              }
            />
            <ProfileField label="Market adı" value={user.market?.ad} />
          </div>
        )}
      </div>

      {previewModal.open && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center"
          onClick={() => setPreviewModal({ open: false, image: "" })}
        >
          <img
            src={previewModal.image}
            className="max-w-[96%] max-h-[96%] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {!user.isActive && (
        <div className="fixed inset-0 bg-gray-200 z-[99999] flex flex-col items-center p-6 overflow-y-auto">
          {/* CONTAINER */}
          <div className="text-center mb-8 rounded-2xl w-full bg-white shadow-lg py-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Hesabınız Aktiv Deyil
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              Zəhmət olmasa aşağıdakı addımları tamamlayın.
            </p>
          </div>
          <div className="min-w-xl w-full mt-4 px-8 grid grid-cols-2 gap-x-8">
            {/* HEADER */}

            {/* EMAIL DOĞRULAMA BÖLÜMÜ */}
            {!user.isVerified && (
              <div className="bg-white rounded-2xl shadow-lg px-6 py- flex flex-col items-center border">
                {step === "email" && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Email doğrulaması
                    </h2>

                    <p className="text-gray-600 text-md mt-2 mb-4 text-center">
                      Email ünvanınızı daxil edin.Qeydiyyat zamanı istifadə
                      etdiyiniz emaili yazın.
                    </p>

                    <form autoComplete="on" className="w-full">
                      <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        className="border w-full px-4 py-2 rounded-lg mt-3"
                        placeholder="Emaili daxil edin"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </form>

                    <button
                      onClick={sendEmailCode}
                      className="w-full mt-4 cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-800 transition"
                    >
                      {loading ? "Göndərilir..." : "Kodu Göndər"}
                    </button>
                  </div>
                )}

                {step === "code" && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Email təsdiqi
                    </h2>

                    <p className="text-gray-600 text-sm mt-2 mb-4 text-center">
                      Email ünvanınıza göndərilmiş <strong>6 rəqəmli</strong>{" "}
                      kodu daxil edin.
                    </p>

                    <div className="flex gap-2 justify-center mt-6 mb-4">
                      {code.map((c, i) => (
                        <input
                          key={i}
                          maxLength={1}
                          value={c}
                          type="email"
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (!val) return;

                            const newCode = [...code];
                            newCode[i] = val;
                            setCode(newCode);

                            // sonraki inputa otomatik geç
                            const next = document.getElementById(
                              `code-${i + 1}`
                            );
                            if (next) next.focus();
                          }}
                          id={`code-${i}`}
                          className="w-12 h-12 text-center text-xl border rounded-lg duration-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ))}
                    </div>

                    <button
                      onClick={verifyEmailCode}
                      className="w-full bg-green-600 cursor-pointer text-white py-2 rounded-lg hover:bg-green-800 transition"
                    >
                      Doğrula
                    </button>

                    <button
                      onClick={resendEmailCode}
                      className="w-full mt-4 text-blue-600 cursor-pointer text-sm duration-300 transition-all hover:scale-125"
                    >
                      Kodu yenidən göndər
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PROFİL TAMAMLAMA */}
            {!user.isCompleted && (
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Profil məlumatları
                </h2>

                <p className="text-gray-600 text-sm mt-2 mb-4">
                  Satıcı hesabının aktivləşməsi üçün profil məlumatlarınızı
                  tamamlayın.
                </p>
                <div className="gap-4">
                  {[
                    { label: "Ad", name: "ad", placeholder: "Ad" },
                    { label: "Soyad", name: "soyad", placeholder: "Soyad" },
                    { label: "Email", name: "email", placeholder: "Email" },
                    { label: "Vöen", name: "vöen", placeholder: "Vöen" },
                    {
                      label: "Əlaqə nömrəsi",
                      name: "phone",
                      placeholder: "Əlaqə nömrəsi",
                      type: "tel",
                      pattern: "[0-9]{3}-[0-9]{3}-[0-9]{2}-",
                    },
                    {
                      label: "Doğum tarixi",
                      name: "dogumtarixi",
                      type: "date",
                      placeholder: "Doğum tarixi",
                    },
                    {
                      label: "Market adı",
                      name: "marketname",
                      placeholder: "Marketin adı",
                    },
                  ].map((f) => (
                    <div key={f.name} className="flex flex-col">
                      <label className="text-sm text-gray-600 mt-2">
                        {f.label}
                      </label>
                      <input
                        type={f.type || "text"}
                        name={f.name}
                        value={formData[f.name]}
                        required
                        onChange={handleInput}
                        className="border rounded-md px-3 py-2"
                        pattern={f.pattern || ""}
                        placeholder={f.placeholder || ""}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handlecompeletation}
                  className="w-full mt-6 bg-orange-500 cursor-pointer text-white py-2 rounded-lg hover:bg-green-800 hover:text-xl duration-300 transition-all h-12"
                >
                  {loading ? "Göndərilir" : "Göndər"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="font-medium text-gray-800 border rounded-md px-3 py-2 bg-gray-100">
      {value || "—"}
    </span>
  </div>
);

/* Bilesen: Tek bilgi satiri */
const ProfileField = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-gray-500 text-lg">{label}</span>
    <span className="font-medium text-xl">{value || "----"}</span>
  </div>
);

export default Dashboard;
