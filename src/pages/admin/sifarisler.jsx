import React, { useEffect, useState } from "react";
import { API_URLS } from "../../utils/api";
import api from "../../utils/axiosclient";
import {
  Mail,
  LockKeyhole,
  Loader2,
  KeyRound,
  CheckCircle,
} from "lucide-react";

const Sifarisleradmin = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get(API_URLS.ADMIN.GETORDERS);
      setOrders(res.data.sifarisler);
      setSelectedOrder(res.data.sifarisler?.[0] || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-row items-center justify-center h-screen">
        <Loader2 className="animate-spin text-green-500" />
        Yüklənir...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SOL – DETAY */}
      
      <div className="flex-1 p-6 overflow-y-auto bg-white">
        {!selectedOrder ? (
          <div>Sifariş seçilmədi</div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Sifariş #{selectedOrder.orderNo}
            </h2>

            {/* Kullanıcı */}
            <Section title="Alıcı">
              <Info label="Ad Soyad" value={selectedOrder.userfullname} />
              <Info label="Email" value={selectedOrder.useremail} />
              <Info label="Telefon" value={selectedOrder.userphone} />
            </Section>

            {/* Adres */}
            <Section title="Çatdırılma">
              <Info label="Ölkə" value={selectedOrder.catdirilma?.country} />
              <Info label="Şəhər" value={selectedOrder.catdirilma?.city} />
              <Info
                label="Rayon / Qəsəbə"
                value={selectedOrder.catdirilma?.district}
              />
              <Info
                label="Poçt kodu"
                value={selectedOrder.catdirilma?.postalCode}
              />

              <div className="pt-1">
                <Info label="Bina" value={selectedOrder.catdirilma?.building} />
                <Info label="Mərtəbə" value={selectedOrder.catdirilma?.floor} />
                <Info
                  label="Mənzil"
                  value={selectedOrder.catdirilma?.apartment}
                />
              </div>

              <div className="pt-1">
                <Info
                  label="Tam ünvan"
                  value={selectedOrder.catdirilma?.fulladdress}
                  bold
                />
              </div>

              {selectedOrder.catdirilma?.note && (
                <div className="mt-2 text-xs text-gray-600 italic">
                  📦 Çatdırıcı qeydi: {selectedOrder.catdirilma.note}
                </div>
              )}
            </Section>

            {/* Ürünler */}
            <Section title="Məhsullar">
              {selectedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between border-b py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">{item.mehsuladi}</div>
                    <div className="text-gray-500">
                      {item.count} × {item.qiymet} ₼
                    </div>
                  </div>
                  <div className="font-semibold">{item.totalItemPrice} ₼</div>
                </div>
              ))}
            </Section>

            {/* Ödeme */}
            <Section title="Ödəmə">
              <Info label="Yöntəm" value={selectedOrder.payment.method} />
              <Info
                label="Ödəniş durumu"
                value={selectedOrder.payment.status}
              />
              <Info label="Ödəmə axışı" value={selectedOrder.payment.flow} />
            </Section>

            {/* Fiyat */}
            <Section title="Qiymət">
              <Info
                label="Məhsulların cəmi qiyməti"
                value={`${selectedOrder.pricing.subtotal} ₼`}
              />
              <Info label="Karqo" value={`${selectedOrder.pricing?.deliveryFee} ₼`} />
              <Info
                label="Endirim"
                value={`${selectedOrder.pricing.discount} ₼`}
              />
              <Info
                label="Cəmi"
                value={`${selectedOrder.pricing.total} ₼`}
                bold
              />
            </Section>

            {/* Admin Notu */}
            {selectedOrder.adminNote && (
              <Section title="Admin Notu">
                <p className="text-sm text-gray-700">
                  {selectedOrder.adminNote}
                </p>
              </Section>
            )}
          </>
        )}
      </div>

      {/* SAĞ – LİSTE */}
      <div className="w-96 bg-gray-50 border-l overflow-y-auto">
        {orders.map((order) => (
          <div
            key={order._id}
            onClick={() => setSelectedOrder(order)}
            className={`p-4 border-b cursor-pointer hover:bg-green-200 transition ${
              selectedOrder?._id === order._id ? "bg-green-300" : ""
            }`}
          >
            <div className="font-medium">#{order.orderNo}</div>
            <div className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleString()}
            </div>

            <div className="flex justify-between mt-2 text-sm">
              <span>Sifariş statusu:{order.orderStatus}</span>
              <span className="font-semibold">{order.pricing.total} ₼</span>
            </div>

            <div className="text-xs mt-1">
              Ödəmə:{" "}
              <span
                className={`font-medium ${
                  order.payment.status === "paid"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {order.payment.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- Küçük yardımcı bileşenler ---------- */

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="font-semibold mb-2">{title}</h3>
    <div className="space-y-1">{children}</div>
  </div>
);

const Info = ({ label, value, bold }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className={bold ? "font-semibold" : ""}>{value || "-"}</span>
  </div>
);

export default Sifarisleradmin;
