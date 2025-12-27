import { X } from "lucide-react";

const Detailmodal = ({ mehsul, onClose }) => {
  if (!mehsul) return null;
  const fixedcategories = (category) => {
    switch (category) {
      case "qida":
        return "Qida";
      case "shexsibaxim":
        return "Şəxsi baxım";
      case "temizlikmehsullari":
        return "Təmizlik məhsulları";
      case "islamieshyavekitablar":
        return "Islami əşya və kitablar";
      case "ushaqmehsullari":
        return "Uşaq məhsulları";
      case "saglamliq":
        return "Sağlamlıq məhsulları";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-75 flex items-center justify-center px-4 py-8 z-50 transition-opacity duration-300 backdrop-blur-sm">
      <div className="bg-white rounded-xl overflow-y-auto shadow-2xl w-full max-w-[90%] h-full p-6 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center border-b pb-1 mb-3">
          <h2 className="text-2xl font-bold text-gray-800">Məhsul Detalları</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-500 cursor-pointer" />
          </button>
        </div>

        <div className="w-full overflow-x-auto mb-6">
          <div className="flex space-x-2 py-2">
            {mehsul.productphotos.map((photo) => (
              <img
                key={photo._id}
                src={photo.secure_url}
                alt="foto"
                className="w-60 h-60 object-cover border border-green-700 rounded-lg shadow"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2">
          {/* Məhsul Adı */}
          <span className="text-lg font-medium text-gray-700">
            Məhsul Adı:{mehsul.mehsuladi}
          </span>
          {/* Qiymət */}
          <span className="text-lg font-medium text-gray-700">
            Kateqoriya: {fixedcategories(mehsul.kateqoriya)}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Endirimli qiymət: {mehsul.endirimliqiymet} {mehsul.valyuta}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Ehtiyat miqdarı: {mehsul.depo}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Qiymət: {mehsul.qiymet} {mehsul.valyuta}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Miqdari: {mehsul.miqdari}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Status: {mehsul.isActive ? "Aktivdir" : "Deaktivdir"}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Brend: {mehsul.brand}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Ölçü vahidi: {mehsul.olcuvahidi}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Açıqlama: {mehsul.aciqlama}
          </span>{" "}
          <span className="text-lg font-medium text-gray-700">
            Tərkib: {mehsul.terkibi}
          </span>{" "}
          <span className="text-lg font-medium text-gray-700">
            Çatdırılma: {mehsul.deliveryoptions?.deliverytype}
          </span>
          <span className="text-lg font-medium text-gray-700">
            Çatdırılma qiyməti: {mehsul.deliveryoptions?.selfdeliveryfee}
          </span>{" "}
          
        </div>
        <div className="grid grid-cols-2">
          {mehsul.filiallar.map((filial) => (
            <div className="h-40 w-[80%]" key={filial.id}>
              <p className="font-bold">Filialın adı:{filial.ad}</p>
              <p className="">Filialın ünvanı:{filial.fullAddress}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Detailmodal;
