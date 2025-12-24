import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Edit3,
  X,
  Search,
  Navigation,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Marker ikonlarının düzgün görünməsi üçün (Leaflet bug fix)
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }) => {
  const map = useMap();
  if (center) {
    map.setView(center, 16); // 16 yaxınlaşma dərəcəsidir
  }
  return null;
};

export const AddressManager = ({
  addresses,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null); // {lat, lng, label}
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [customAddressName, setCustomAddressName] = useState("");
  // Ünvan axtarışı (Nominatim API - Pulsuz)
  
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 3) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=10&accept-language=az`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Axtarış xətası:", err);
    }
  };

  // Redaktə funksiyasını yeniləyin
  const handleEditClick = (addr) => {
    setIsAdding(true);
    setEditingAddressId(addr._id);
    setCustomAddressName(addr.ad); // Bazadakı adı inputa set edirik
    setSearchQuery(addr.ad); // Axtarış hissəsinə də qoymaq olar
    setSelectedLocation({
      lat: addr.location.coordinates[1],
      lng: addr.location.coordinates[0],
      label: addr.address.fullAddress,
      city: addr.address.city,
      district: addr.address.district,
    });
  };

  const selectSuggestion = (s) => {
    const newLoc = {
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lon),
      label: s.display_name,
      city: s.address.city || s.address.town || s.address.village,
      district: s.address.suburb || s.address.county,
    };
    setSelectedLocation(newLoc);
    setSearchQuery(s.display_name);
    setSuggestions([]);
  };

  const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;

        // Koordinatdan ünvanı tapmaq (Reverse Geocoding)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          );
          const data = await res.json();

          onLocationSelect({
            lat,
            lng,
            label: data.display_name,
            city:
              data.address.city ||
              data.address.town ||
              data.address.village ||
              "Bakı",
            district:
              data.address.suburb ||
              data.address.district ||
              data.address.county ||
              "",
          });
        } catch (err) {
          console.error("Ünvan tapılmadı:", err);
        }
      },
    });
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center px-4 py-8">
      <div className="bg-white w-full max-w-full h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 py-2 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="text-orange-500" /> Ünvanların İdarə Edilməsi
            </h2>
            <p className="text-xs text-gray-500">
              Filial və ya əsas ofis ünvanlarını idarə edin
            </p>
          </div>
          <div className="flex gap-2">
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="bg-blue-600 text-white cursor-pointer px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-800 transition"
              >
                <Plus size={18} /> Yeni Ünvan
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 cursor-pointer rounded-full transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* SOL TƏRƏF: Ünvan Siyahısı */}
          <div className="w-1/3 border-r overflow-y-auto p-4 bg-gray-50">
            <h3 className="font-semibold mb-4 text-gray-700">
              Qeydli Ünvanlar
            </h3>

            {addresses && addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm hover:border-orange-300 transition"
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-[14px] uppercase font-bold px-2 py-1 rounded ${
                          addr.type === "mainaddress"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {addr.type === "mainaddress" ? "Əsas" : "Filial"}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClick(addr)} // Yuxarıda yaratdığımız funksiya
                          className="p-1.5 cursor-pointer text-gray-500 hover:text-blue-600"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(addr._id)}
                          className="p-1.5 cursor-pointer text-gray-500 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-800 mt-1">{addr.ad}</h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {addr.address.fullAddress}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 font-medium">
                      <Navigation size={12} /> Koordinatlar qeyd edilib
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-xl">
                <MapPin size={40} opacity={0.2} />
                <p className="mt-2 text-sm">Heç bir ünvan tapılmadı</p>
              </div>
            )}
          </div>

          {/* SAĞ TƏRƏF: Xəritə və Axtarış */}
          <div className="flex-1 relative bg-gray-200 w-full">
            {isAdding ? (
              <div className="absolute inset-0 z-10 flex flex-col">
                {/* Search Bar */}
                <div className="p-4 bg-white/90 backdrop-blur shadow-md z-20">
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <Search size={20} />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="Ünvanı axtarın (Məs: Bakı, Nizami küç...)"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                    {searchQuery.length > 0 && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-6 top-3 hover:bg-red-600 rounded-full duration-200 transition-all hover:text-white p-1"
                      >
                        <X size={20} />
                      </button>
                    )}
                    {/* Suggestions Dropdown */}
                    {suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white border rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto">
                        {suggestions.map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectSuggestion(s)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 text-sm flex gap-2"
                          >
                            <MapPin
                              size={16}
                              className="text-gray-400 shrink-0"
                            />
                            {s.display_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedLocation && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in slide-in-from-top-2">
                      <p className="text-sm font-semibold text-blue-800 mb-2">
                        Ünvan detalları:
                      </p>

                      {/* ÜNVANIN ADI ÜÇÜN İNPUT */}
                      <div className="mb-3">
                        <label className="text-[10px] uppercase font-bold text-blue-400">
                          Ünvanın Adı (Məs: Yasamal filialı)
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 text-sm border border-blue-200 rounded mt-1 outline-none focus:border-blue-500 bg-white"
                          placeholder="Ünvan adı daxil edin..."
                          value={customAddressName}
                          onChange={(e) => setCustomAddressName(e.target.value)}
                        />
                      </div>

                      <p className="text-xs text-blue-600">
                        <span className="font-bold text-blue-800">
                          Tam ünvan:
                        </span>{" "}
                        {selectedLocation.label}
                      </p>

                      <button
                        onClick={() => {
                          // Əgər istifadəçi ad yazmayıbsa, axtarışdan gələn ilk sözü istifadə et
                          const finalName =
                            customAddressName || searchQuery.split(",")[0];

                          const finalData = {
                            ad: finalName, // Artıq burda customName istifadə olunur
                            type:
                              addresses.length === 0 ? "mainaddress" : "branch",
                            address: {
                              fullAddress: selectedLocation.label,
                              city: selectedLocation.city,
                              district: selectedLocation.district,
                            },
                            location: {
                              type: "Point",
                              coordinates: [
                                selectedLocation.lng,
                                selectedLocation.lat,
                              ],
                            },
                          };

                          if (editingAddressId) {
                            onUpdate(editingAddressId, finalData);
                          } else {
                            onAdd(finalData);
                          }

                          // Sıfırlama
                          setIsAdding(false);
                          setEditingAddressId(null);
                          setSelectedLocation(null);
                          setSearchQuery("");
                          setCustomAddressName(""); // Adı da sıfırla
                        }}
                        // Ad daxil edilməyibsə düyməni deaktiv edə bilərsən (isteğe bağlı)
                        disabled={!customAddressName}
                        className={`mt-3 w-full py-2 rounded-lg font-bold transition cursor-pointer ${
                          !customAddressName
                            ? "bg-gray-500 cursor-not-allowed text-white"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {editingAddressId
                          ? "Dəyişikliyi yadda saxla"
                          : "Bu ünvanı təsdiqlə"}
                      </button>
                    </div>
                  )}{" "}
                </div>

                {/* Map Placeholder */}
                <div className="flex-1 relative z-10">
                  <MapContainer
                    center={[40.4093, 49.8671]}
                    zoom={13}
                    className="h-full w-full"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* Xəritəyə klikləməni aktiv edən komponent */}
                    <MapClickHandler
                      onLocationSelect={(loc) => setSelectedLocation(loc)}
                    />

                    {selectedLocation && (
                      <>
                        <Marker
                          position={[
                            selectedLocation.lat,
                            selectedLocation.lng,
                          ]}
                        />
                        <ChangeView
                          center={[selectedLocation.lat, selectedLocation.lng]}
                        />
                      </>
                    )}
                  </MapContainer>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="p-8 text-center">
                  <button
                    onClick={() => setIsAdding(true)}
                    className="bg-white p-6 cursor-pointer rounded-full inline-block shadow-sm mb-4"
                  >
                    <Plus size={40} className="text-blue-500" />
                  </button>
                  <h3 className="text-lg font-bold text-gray-700">
                    Yeni Ünvan Əlavə Edin
                  </h3>
                  <p className="text-sm max-w-xs mx-auto">
                    Filiallarınızın xəritədə görünməsi üçün sağ yuxarıdan "Yeni
                    Ünvan" düyməsinə basın.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
