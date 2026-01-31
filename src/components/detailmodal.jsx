import { X } from "lucide-react";

const formatToReadableString = (data) => {
  if (!data) return "";

  // 1. Əgər massivdirsə (Array)
  if (Array.isArray(data)) {
    if (data.length === 0) return "";

    // İlk elementi yoxlayırıq ki, formatı müəyyən edək
    const firstItem = data[0];

    // HAL A: Yeni strukturlaşmış format [{header: "...", items: [...]}]
    if (
      typeof firstItem === "object" &&
      firstItem !== null &&
      firstItem.header
    ) {
      return data
        .map((item) => `${item.header}  ${item.items?.join("\n ") || ""}`)
        .join("\n ");
    }

    // HAL B: Köhnə string massivi formatı ["un", "şəkər", "su"]
    if (typeof firstItem === "string") {
      return data.join(", ");
    }
  }

  // 2. HAL C: Əgər sadəcə bir string-dirsə "Məhsul haqqında mətn"
  if (typeof data === "string") {
    return data;
  }

  return "";
};

const Detailmodal = ({ mehsul, onClose }) => {
  if (!mehsul) return null;

  const formattedAciqlama = formatToReadableString(mehsul.aciqlama);
  const formattedterkib = formatToReadableString(mehsul.terkibi);

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
          <button onClick={onClose} className="bg-green-500 rounded-full p-2 cursor-pointer duration-200 hover:bg-green-700" >
            <X className="w-6 h-6 text-white cursor-pointer" />
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
            Çatdırılma qiyməti: {mehsul.deliveryoptions?.selfdeliveryfee}
          </span>{" "}
          <span className="text-lg col-span-2 font-medium text-gray-700">
            Çatdırılma: {mehsul.deliveryoptions?.deliverytype}
          </span>
          <span className="text-lg col-span-2 font-medium text-gray-700">
            Açıqlama: {formattedAciqlama}
          </span>{" "}
          <span className="text-lg col-span-2 font-medium text-gray-700">
            Tərkib: {formattedterkib}
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
