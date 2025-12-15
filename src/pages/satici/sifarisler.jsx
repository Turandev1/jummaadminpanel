import React, { useEffect, useState } from "react";
import useAuth from "../../redux/authredux";
import api from "../../utils/axiosclient";
import { API_URLS } from "../../utils/api";
import {
  ClockIcon,
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  TagIcon,
  UserIcon,
  MapPinIcon,
  DollarSignIcon,
  PackageIcon,
  Loader2,
} from "lucide-react";

// --- KÖMƏKÇİ FUNKSİYALAR (ƏVVƏLKİ KİMİ) ---
const getStatusInfo = (status) => {
  switch (status) {
    case "pending":
      return {
        text: "Gözləmədə",
        classes: "bg-yellow-100 text-yellow-800",
        icon: ClockIcon,
      };
    case "processing":
      return {
        text: "Hazırlanır",
        classes: "bg-blue-100 text-blue-800",
        icon: ShoppingBagIcon,
      };
    case "packaged":
      return {
        text: "Qablaşdırılıb",
        classes: "bg-indigo-100 text-indigo-800",
        icon: PackageIcon, // İkon dəyişdi
      };
    case "on-delivery":
      return {
        text: "Çatdırılmada",
        classes: "bg-teal-100 text-teal-800",
        icon: TruckIcon,
      };
    case "delivered":
      return {
        text: "Çatdırıldı",
        classes: "bg-green-100 text-green-800",
        icon: CheckCircleIcon,
      };
    case "cancelled":
      return {
        text: "Ləğv edildi",
        classes: "bg-red-100 text-red-800",
        icon: XCircleIcon,
      };
    default:
      return {
        text: status,
        classes: "bg-gray-100 text-gray-800",
        icon: ClockIcon,
      };
  }
};

// Köməkçi Komponent: Qiymətləndirmə Sətiri
const PricingRow = ({ label, value, isDiscount = false, color }) => (
  <div className="flex justify-between">
    <span className={`${color}`}>{label}</span>
    <span
      className={`font-semibold ${
        isDiscount ? "text-red-500" : "text-gray-700"
      }`}
    >
      {isDiscount ? `- ${value.toFixed(2)}` : value.toFixed(2)} ₼
    </span>
  </div>
);
// --- ƏSAS KOMPONENT ---
const Sifarisler = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const saticiId =
    user?.id ||
    (localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).id
      : null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!saticiId) return;
      try {
        setLoading(true);
        const res = await api.get(`${API_URLS.SATICI.GET_ORDERS}/${saticiId}`);
        setOrders(res.data.orders);
        if (res.data.orders.length > 0) {
          // İlk sifarişi avtomatik seç
          setSelectedOrder(res.data.orders[0]);
        } else {
          setTimeout(() => {
            setLoading(false)
          }, 2000);
        }
      } catch (err) {
        console.error("Sifarişlər alınmadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Yüklənmə vəziyyəti
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-x-8 h-screen bg-gray-50">
        <span className="text-xl font-medium text-gray-700">Yüklənir...</span>
        <Loader2 className="animate-spin w-8 h-8 text-green-500"  />
      </div>
    );
  }

  // Sifariş yoxdursa
  if (orders.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6 border-b-4 border-indigo-600/30 pb-4">
          📦 Sifarişlərim
        </h2>
        <p className="text-center py-12 text-xl text-gray-500 bg-white rounded-xl shadow-md border-t-4 border-indigo-500">
          Hələ sifariş yoxdur
        </p>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50">
      {/* 1. SOL TƏRƏF: Sifariş Siyahısı (Master View) - 35% */}
      <div className="w-[65%] border-r  border-gray-200 bg-white overflow-y-auto h-screen sticky top-0 shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
            Bütün Sifarişlər ({orders.length})
          </h2>
          <div className="space-y-4">
            {orders.map((order) => {
              const isSelected = selectedOrder?._id === order._id;
              const statusInfo = getStatusInfo(order.orderStatus);

              return (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-lg cursor-pointer transition duration-200 ease-in-out border 
                    ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-600 shadow-md ring-2 ring-indigo-500"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      #{order.orderNo}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.classes}`}
                    >
                      {statusInfo.text}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="flex items-center">
                      <DollarSignIcon className="w-4 h-4 mr-1 text-indigo-500" />
                      <span className="font-bold text-lg text-indigo-700">
                        {order.pricing.total.toFixed(2)} ₼
                      </span>
                    </p>
                    <p className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-1 text-gray-500" />
                      {order.userfullname}
                    </p>
                    <p className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1 text-gray-500" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. SAĞ TƏRƏF: Seçilmiş Sifarişin Detalları (Detail View) - 65% */}
      <div className="w-[45%] p-8 overflow-y-auto h-screen sticky top-0">
        {selectedOrder ? (
          <OrderDetailComponent order={selectedOrder} saticiId={saticiId} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-xl border-4 border-dashed border-gray-300 rounded-xl">
            Zəhmət olmasa detallarını görmək üçün soldan bir sifariş seçin.
          </div>
        )}
      </div>
    </div>
  );
};

export default Sifarisler;

// --- YENİ KÖMƏKÇİ KOMPONENT: SİFARİŞ DETALLARI ---

const DetailInfoBox = ({
  title,
  value,
  valueClass = "text-gray-900",
}) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-3">
    <Icon className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
    <div>
      <span className="text-xs font-medium text-indigo-600 block uppercase tracking-wide">
        {title}
      </span>
      <span
        className={`text-base font-semibold ${valueClass} block break-words`}
      >
        {value}
      </span>
    </div>
  </div>
);

const OrderDetailComponent = ({ order, saticiId }) => {
  const statusInfo = getStatusInfo(order.orderStatus);
  const StatusIcon = statusInfo.icon;
  const sellerItems = order.items.filter((item) => item.saticiID === saticiId);

  return (
    <div className="space-y-8 pb-10">
      {/* BAŞLIQ VƏ STATUS */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Sifariş Detalları{" "}
            <span className="text-indigo-600">#{order.orderNo}</span>
          </h1>
          <div className="text-right">
            <span className="text-sm font-medium text-gray-500 block">
              Status:
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${statusInfo.classes}`}
            >
              <StatusIcon className="w-4 h-4 mr-1.5" aria-hidden="true" />
              {statusInfo.text}
            </span>
          </div>
        </div>

        {/* ƏSAS GÖSTƏRİCİLƏR (Kartlar) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <DetailInfoBox
            title="Cəmi Ödəniş"
            value={`${order.pricing.total.toFixed(2)} ₼`}
            Icon={DollarSignIcon}
            valueClass="text-green-700 text-xl"
          />
          <DetailInfoBox
            title="Məhsul Sayı"
            value={sellerItems.length}
            Icon={ShoppingBagIcon}
          />
          <DetailInfoBox
            title="Ödəniş Metodu"
            value={order.payment.method.toUpperCase()}
            Icon={CreditCardIcon}
          />
          <DetailInfoBox
            title="Tarix"
            value={new Date(order.createdAt).toLocaleString()}
            Icon={ClockIcon}
          />
        </div>
      </div>

      {/* MÜŞTƏRİ VƏ ÇATDIRILMA MƏLUMATLARI */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
          <UserIcon className="w-5 h-5 mr-2 text-indigo-500" /> Müştəri &
          Çatdırılma
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailInfoBox
            title="Müştəri Adı"
            value={order.userfullname}
            Icon={UserIcon}
          />
          <DetailInfoBox
            title="Telefon"
            value={order.userphone}
            Icon={UserIcon}
          />
          <div className="md:col-span-2">
            <DetailInfoBox
              title="Ünvan"
              value={`${order.catdirilma.fulladdress}, ${order.catdirilma.city}`}
              Icon={MapPinIcon}
            />
          </div>
        </div>
      </div>

      {/* MƏHSULLARIN SİYAHISI (Yalnız Satıcının Məhsulları) */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
          <ShoppingBagIcon className="w-5 h-5 mr-2 text-indigo-500" /> Sizin
          Məhsullarınız ({sellerItems.length})
        </h2>
        <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
          {sellerItems.map((item, index) => (
            <li
              key={index}
              className="p-4 flex justify-between items-center hover:bg-gray-50 transition duration-150"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.secure_url || "/placeholder-image.svg"}
                  alt={item.mehsuladi}
                  className="w-12 h-12 object-cover rounded-lg border flex-shrink-0"
                />
                <div>
                  <p className="text-base font-medium text-gray-900">
                    {item.mehsuladi}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.marketname} | {item.qiymet.toFixed(2)} ₼ / ədəd
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-indigo-600">
                  {item.count} x
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {item.totalItemPrice.toFixed(2)} ₼
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* QİYMƏTLƏNDİRMƏ VƏ ÖDƏNİŞ DETALLARI */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
          <CreditCardIcon className="w-5 h-5 mr-2 text-indigo-500" /> Maliyyə &
          Ödəniş
        </h2>

        {/* Qiymətləndirmə */}
        <div className="space-y-2 max-w-sm ml-auto text-sm border-b pb-4 mb-4">
          <PricingRow
            label="Məhsulun Ümumi Qiyməti (Subtotal)"
            value={order.pricing.subtotal}
            color="text-gray-700"
          />
          <PricingRow
            label="Kargo (Çatdırılma) Haqqı"
            value={order.shipping.fee}
            color="text-gray-700"
          />
          <PricingRow
            label="Endirim"
            value={order.pricing.discount}
            isDiscount={true}
            color="text-red-500"
          />
          <div className="flex justify-between font-bold border-t pt-3 mt-3 text-xl">
            <span>Cəmi Ödənilən Məbləğ</span>
            <span className="text-indigo-600">
              {order.pricing.total.toFixed(2)} ₼
            </span>
          </div>
        </div>

        {/* Epoint Detalları */}
        {order.payment.status !== "pending" && (
          <div className="pt-4 space-y-3 text-sm">
            <p className="font-semibold text-gray-800 flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> Ödəniş
              Statusu:{" "}
              <span
                className={`ml-2 font-bold ${
                  order.payment.status === "paid"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {order.payment.status.toUpperCase()}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-600">Kart Maskası:</span>{" "}
              {order.payment.epoint.cardMask || "Yoxdur"}
            </p>
            <p>
              <span className="font-medium text-gray-600">Transaksiya ID:</span>{" "}
              {order.payment.epoint.bankTransaction ||
                order.payment.epoint.transaction ||
                "Yoxdur"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
