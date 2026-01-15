import React, { useState } from "react";
import api from "../../utils/axiosclient";
import { ADMIN_URL, API_URLS } from "../../utils/api";
import { toast } from "react-toastify";

const SendNotifications = () => {
  // Inputlar üçün state-lər
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingtoast = toast.loading("Bildiriş göndərilir...");

    try {
      console.log("url", ADMIN_URL);
      const response = await api.post(`${ADMIN_URL}/sendcustomnotification`, {
        title,
        body,
      });

      if (response.data.success) {
        toast.success("Bildiriş ugurla göndərildi", { id: loadingtoast });
        setTitle(""); // Formu təmizləmək üçün
        setBody("");
      }
    } catch (error) {
      console.error("Xəta:", error);
      const errorMsg = error.response?.data?.hata || "Xəta baş verdi!";
      toast.error(errorMsg, { id: loadingtoast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Bildiriş Göndər
        </h2>

        <form onSubmit={handleSend} className="space-y-4">
          {/* Başlıq Inputu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bildiriş Başlığı
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Məs: Yeni kampaniya"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          {/* Məzmun Inputu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bildiriş Məzmunu
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Məs: Bütün məhsullara 20% endirim!"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              required
            />
          </div>

          {/* Status Mesajı */}
          {message.text && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Göndər Buttonu */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:transform active:scale-95"
            }`}
          >
            {loading ? "Göndərilir..." : "Bildirişi göndər"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendNotifications;
