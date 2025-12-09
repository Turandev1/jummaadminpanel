import React, { useEffect, useState } from "react";
import api from "../../utils/axiosclient";
import { API_URLS } from "../../utils/api";

const Usermessages = () => {
  const [messages, setMessages] = useState([]);

  const [replyTitle, setReplyTitle] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await api.get(API_URLS.ADMIN.GETUSERMESSAGES);
      if (res.data.success) {
        setMessages(res.data.usermessages);
        console.log("data:", res.data.usermessages);
      }
    };
    fetchMessages();
  }, []);

  const toggleisread = async (id) => {
    try {
      await api.patch(`${API_URLS.ADMIN.MARK_AS_READ}/${id}`);
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isRead: !m.isRead } : m))
      );
    } catch (err) {
      console.log(err);
    }
  };

  const sendReply = async (message) => {
    try {
      const res = await api.post(API_URLS.ADMIN.SENDRESPONSE, {
        messageId: message._id,
        userId: message.userId,
        requestTitle: message.title,
        requestBody: message.mesaj,
        title: replyTitle,
        body: replyBody,
      });

      if (res.data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === message._id ? { ...m, cavabverildi: true } : m
          )
        );

        setReplyBody("");
        setReplyTitle("");
        setSelectedMessage(null);
      }
    } catch (err) {
      console.log(err);
    }
  };


  const sortedMessages = [...messages].sort((a, b) => a.isRead - b.isRead);


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">İstifadəçi Mesajları</h1>

      <div className="flex flex-col gap-5">
        {sortedMessages.map((message) => (
          <div
            key={message._id}
            className={`shadow-md rounded-xl p-5 border transition ${
              message.isRead ? "bg-gray-200" : "bg-green-200"
            }`}
          >
            {/* Üst başlık ve durum badge’leri */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-medium">{message.title}</h3>

              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    message.isRead
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  Görüldü: {message.isRead ? "Bəli" : "Xeyr"}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    message.cavabverildi
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  Cavab: {message.cavabverildi ? "Verildi" : "Verilməyib"}
                </span>
              </div>
            </div>

            {/* Mesaj içeriği */}
            <p className="text-gray-700 mb-4 leading-relaxed">
              {message.mesaj}
            </p>

            <div className="flex gap-3 mb-4">
              {!message.isRead ? (
                <button
                  onClick={() => toggleisread(message._id)}
                  className="bg-green-600 hover:bg-green-700 cursor-pointer text-white font-medium px-4 py-2 rounded-lg transition"
                >
                  Görüldü et
                </button>
              ) : (
                <button
                  onClick={() => toggleisread(message._id)}
                  className="bg-blue-500 hover:bg-blue-700 cursor-pointer text-white font-medium px-4 py-2 rounded-lg transition"
                >
                  Görülmədi et
                </button>
              )}

              {!message.cavabverildi && (
                <button
                  onClick={() =>
                    setSelectedMessage(
                      selectedMessage === message._id ? null : message._id
                    )
                  }
                  className="bg-gray-700 hover:bg-gray-800 cursor-pointer text-white font-medium px-4 py-2 rounded-lg transition"
                >
                  {selectedMessage === message._id ? "Ləğv et" : "Cavab Ver"}
                </button>
              )}
            </div>

            {/* Cevap formu */}
            {selectedMessage === message._id && (
              <div className="bg-white border rounded-xl p-4 shadow-sm">
                <input
                  value={replyTitle}
                  placeholder="Başlıq"
                  onChange={(e) => setReplyTitle(e.target.value)}
                  className="w-full border duration-200 transition-all rounded-lg p-3 mb-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <textarea
                  value={replyBody}
                  placeholder="Mesaj..."
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={4}
                  className="w-full border duration-200 transition-all rounded-lg p-3 mb-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  disabled={!replyTitle.trim() || !replyBody.trim()}
                  onClick={() => sendReply(message)}
                  className={`px-5 py-2 rounded-lg font-medium cursor-pointer text-white transition ${
                    replyTitle.trim() && replyBody.trim()
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Cavabı Göndər
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Usermessages;
