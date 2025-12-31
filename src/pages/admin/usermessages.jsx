import React, { useEffect, useState } from "react";
import api from "../../utils/axiosclient";
import { API_URLS } from "../../utils/api";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  CheckCircle,
  Mail,
  MessageSquare,
  Clock,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
} from "lucide-react";

const Usermessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState(null); // Hansı ticket yenilənir?

  const sortMessages = (data) => {
    return [...data].sort((a, b) => {
      const aUnread = a.unreadCountForAdmin > 0;
      const bUnread = b.unreadCountForAdmin > 0;

      // 1. Oxunmamışları önə çıxar (true olanlar -1 qaytarır)
      if (aUnread && !bUnread) return -1;
      if (!aUnread && bUnread) return 1;

      // 2. Əgər hər ikisi oxunubsa və ya hər ikisi oxunmayıbsa, tarixe görə sırala (Yenidən köhnəyə)
      return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
    });
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_URLS.ADMIN.GETUSERMESSAGES);
      if (res.data.success) {
        const sorteddata = sortMessages(res.data.usermessages);
        setMessages(sorteddata);
      }
    } catch (err) {
      console.log("error:", err.response.data);
      toast.error("Məlumatlar yüklənmədi");
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (userId, ticketInternalId) => {
    setUpdatingStatusId(ticketInternalId); // Yüklənməni başlat
    try {
      const res = await api.patch(
        `${API_URLS.ADMIN.TOGGLEMURACIETREAD}/${userId}/${ticketInternalId}`
      );

      if (res.data.success) {
        const newStatus = res.data.newStatus;

        setMessages((prev) => {
          // Əvvəlcə datanı yeniləyirik
          const updated = prev.map((t) =>
            t._id === ticketInternalId
              ? { ...t, unreadCountForAdmin: newStatus }
              : t
          );
          // Sonra yenilənmiş siyahını yenidən sıralayırıq
          return sortMessages(updated);
        });

        // // TOAST MƏNTİQİ: Hər iki hal üçün bildiriş
        // if (newStatus === 0) {
        //   toast.info("Oxundu olaraq işarələndi");
        // } else {
        //   toast.warning("Oxunmadı olaraq qeyd edildi");
        // }
      }
    } catch (err) {
      console.log("error:", err.response?.data);
      toast.error("Xəta baş verdi");
    } finally {
      setUpdatingStatusId(null); // Yüklənməni bitir
    }
  };

  useEffect(() => {
    fetchMessages();
  },[]);

  const handleSendReply = async (ticket) => {
    if (!replyBody.trim()) return;
    try {
      const res = await api.post(API_URLS.ADMIN.SENDRESPONSE, {
        userId: ticket.userId,
        ticketId: ticket._id,
        responseTitle: "Dəstək Cavabı",
        responseBody: replyBody,
      });
      if (res.data.success) {
        toast.success("Cavab göndərildi");
        setReplyBody("");
        setSelectedTicket(null);
        fetchMessages();
      }
    } catch (err) {
      console.log("error:", err.response.data);
      toast.error("Göndərilmədi");
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen p-6 lg:p-10 text-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <MessageSquare size={28} className="text-emerald-600" />
              </div>
              Dəstək Mərkəzi
            </h1>
            <p className="text-slate-500 mt-2 text-base">
              İstifadəçi müraciətlərini və texniki dəstək biletlərini idarə
              edin.
            </p>
          </div>
          <button
            onClick={fetchMessages}
            className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 px-5 py-2.5 rounded-xl hover:shadow-md transition-all font-semibold text-slate-700 active:scale-95"
          >
            Siyahını Yenilə
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 font-medium">
              Məlumatlar yüklənir...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((ticket) => {
              const isUnread = ticket.unreadCountForAdmin > 0;
              const isSelected = selectedTicket === ticket._id;
              console.log("ticket", ticket);
              return (
                <div
                  key={ticket._id}
                  className={`group bg-white border-2 rounded-2xl transition-all duration-300 ${
                    isUnread
                      ? "border-emerald-200 shadow-sm shadow-emerald-100"
                      : "border-slate-300 hover:border-slate-600 shadow-sm"
                  }`}
                >
                  {/* TICKET HEADER */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex items-start gap-5 flex-1">
                      {/* Read Status Toggle */}
                      <button
                        onClick={() =>
                          toggleReadStatus(ticket.userId, ticket._id)
                        }
                        disabled={updatingStatusId} // Sorğu gedərkən klikləməyi bağla
                        className={`mt-1 transition-all cursor-pointer active:scale-90 disabled:opacity-50 ${
                          isUnread
                            ? "text-emerald-500"
                            : "text-slate-300 hover:text-slate-700"
                        }`}
                      >
                        {updatingStatusId === ticket._id ? (
                          <Loader2
                            size={26}
                            className="animate-spin text-slate-600"
                          />
                        ) : (
                          <CheckCircle
                            size={26}
                            className={isUnread ? "fill-emerald-50" : ""}
                            strokeWidth={isUnread ? 2.5 : 2}
                          />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="bg-slate-100 text-slate-500 text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            #{ticket.ticketId}
                          </span>
                          <h3
                            className={`text-lg font-bold leading-tight ${
                              isUnread ? "text-emerald-900" : "text-slate-800"
                            }`}
                          >
                            {ticket.subject}
                          </h3>
                        </div>

                        {/* User Info - Displaying Name and Email clearly */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-[14px]">
                          <div className="flex items-center gap-2 text-slate-700 font-semibold">
                            <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center">
                              <UserIcon size={14} className="text-slate-500" />
                            </div>
                            {ticket.displayFullname || "Ad yoxdur"}
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Mail size={16} className="text-slate-400" />
                            {ticket.displayEmail}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={16} />
                            {format(
                              new Date(ticket.lastMessageAt),
                              "dd MMM, HH:mm"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4 self-end md:self-center">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-tight ${
                          ticket.status === "open"
                            ? "bg-amber-100 text-amber-700 border-amber-700 border"
                            : "bg-emerald-100 text-emerald-700 border-emerald-700 border"
                        }`}
                      >
                        {ticket.status === "open"
                          ? "Açıq Müraciət"
                          : "Cavablanıb"}
                      </span>

                      <button
                        onClick={() =>
                          setSelectedTicket(isSelected ? null : ticket._id)
                        }
                        className={`flex items-center gap-2 cursor-pointer px-5 py-2.5 rounded-xl font-bold transition-all ${
                          isSelected
                            ? "bg-slate-800 text-white shadow-lg"
                            : "bg-slate-100 text-slate-700 border border-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected ? "Bağla" : "Detallara Bax"}
                        {isSelected ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* THREAD AREA */}
                  {isSelected && (
                    <div className="border-t border-slate-200 bg-slate-50/50 p-8 md:p-4 animate-in fade-in duration-300">
                      <div className="space-y-6 max-h-[500px] overflow-y-auto mb-8 pr-4 custom-scrollbar">
                        {/* Initial User Message */}
                        <div className="flex justify-start">
                          <div className="max-w-[85%]">
                            <div className="bg-white border border-slate-200 px-5 py-0 rounded-2xl rounded-tl-none shadow-sm">
                              <p className="text-base text-slate-800 leading-relaxed whitespace-pre-wrap">
                                {ticket.subject}
                              </p>
                            </div>
                            <span className="text-[11px] text-slate-400 mt-2 block font-medium uppercase ml-1">
                              {ticket.displayFullname} •{" "}
                              {format(new Date(ticket.createdAt), "HH:mm")}
                            </span>
                          </div>
                        </div>

                        {/* Yazışmalar */}
                        {ticket.thread?.map((chat, idx) => (
                          <div
                            key={idx}
                            className={`flex my-3 ${
                              chat.senderRole === "admin"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div className={`max-w-[85%]`}>
                              <div
                                className={`px-5 py-1 rounded-2xl shadow-sm ${
                                  chat.senderRole === "admin"
                                    ? "bg-emerald-600 text-white rounded-tr-none"
                                    : "bg-white border border-slate-300 text-slate-800 rounded-tl-none"
                                }`}
                              >
                                <p className="text-base leading-relaxed whitespace-pre-wrap">
                                  {chat.message}
                                </p>
                              </div>
                              <span
                                className={`text-[11px] mt-0 block font-medium uppercase ${
                                  chat.senderRole === "admin"
                                    ? "text-right mr-1 text-emerald-600"
                                    : "ml-1 text-slate-400"
                                }`}
                              >
                                {chat.senderRole === "admin"
                                  ? "Siz (Dəstək)"
                                  : ticket.displayFullname}{" "}
                                • {format(new Date(chat.createdAt), "HH:mm")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reply Input Area */}
                      <div className="relative mt-4">
                        <textarea
                          rows={3}
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          placeholder="İstifadəçiyə cavab yazın..."
                          className="w-full bg-white border-2 border-slate-400 rounded-2xl py-2 pr-32 pl-6 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all text-base resize-none shadow-sm"
                        />
                        <button
                          onClick={() => handleSendReply(ticket)}
                          disabled={!replyBody.trim()}
                          className="absolute right-4 cursor-pointer bottom-4 flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:bg-slate-600 shadow-md"
                        >
                          Göndər <Send size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default Usermessages;
