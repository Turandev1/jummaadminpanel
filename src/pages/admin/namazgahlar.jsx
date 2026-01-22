import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  FaPlus,
  FaMosque,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaLocationArrow,
  FaSearch,
  FaTrash,
  FaTrashAlt,
} from "react-icons/fa";
import L from "leaflet";
import axios from "axios"; // Nominatim axtarışı üçün lazımdır
import api from "../../utils/axiosclient";
import { ADMIN_URL } from "../../utils/api";

// --- Marker Icon Fix ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { toast } from "react-toastify";
import { MdOutlineCancel } from "react-icons/md";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Köməkçi Komponent: Xəritəni hərəkət etdirmək üçün ---
// Bu komponent state dəyişəndə xəritəni həmin koordinata "uçurur"
const MapController = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 16, {
        animate: true,
      });
    }
  }, [coords, map]);
  return null;
};

const Namazgahlar = () => {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [deletemode, setdeletemode] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: "",
    city: "",
    country: "Azərbaycan",
    location: "",
    latitude: 40.4093,
    longitude: 49.8671,
    type: "mosque",
    note: "",
  });

  const fetchnamazgahlar = async () => {
    try {
      const res = await api.get(`${ADMIN_URL}/getnamazgahlar`);
      if (res.data.success) {
        setPlaces(res.data.places);
      }
    } catch (error) {
      console.error("Məlumat gətirilərkən xəta:", error);
    }
  };
  // --- Məlumatları Gətir ---
  useEffect(() => {
    fetchnamazgahlar();
  }, []);

  // --- Ünvan Axtarışı (Nominatim API) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&accept_language=az`
          );
          setSearchResults(response.data);
        } catch (error) {
          console.error("Axtarış xətası:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); // 500ms gecikmə (debounce)

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Axtarış nəticəsinə kliklədikdə
  const handleSelectLocation = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    // Formu doldurmağa çalışaq (Auto-fill)
    const displayName = result.display_name.split(",");
    const city =
      displayName.find((part) =>
        part.trim().match(/(Bakı|Gəncə|Sumqayıt|Rayon|City)/i)
      ) || "";

    setNewPlace((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      location: result.display_name, // Tam ünvanı bura yazırıq
      city: city.trim(),
      // country: "Azərbaycan" // Nominatim həmişə ölkəni dəqiq vermir, default saxlamaq olar
    }));

    setSearchQuery(""); // Axtarışı təmizlə
    setSearchResults([]); // Siyahını bağla
  };

  // Xəritəyə klikləmə hadisəsi
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setNewPlace((prev) => ({
          ...prev,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        }));
        // Burada da gələcəkdə reverse-geocoding edib ünvanı tapa bilərsiniz
      },
    });
    return newPlace.latitude ? (
      <Marker position={[newPlace.latitude, newPlace.longitude]} />
    ) : null;
  };

  // Cari Mövqe
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewPlace((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => alert("Mövqe alına bilmədi.")
      );
    } else {
      alert("Brauzeriniz Geolocation dəstəkləmir.");
    }
  };

  // Məkan Əlavə Et (API)
  const handleAddPlace = async () => {
    // 1. Validasiya
    if (!newPlace.name || !newPlace.city) {
      toast.error("Zəhmət olmasa Məkan adı və Şəhəri daxil edin.");
      return;
    }

    try {
      console.log("newPlace", newPlace);
      // 2. Backend Sorğusu (Nümunə)
      const res = await api.post(
        `${ADMIN_URL}/createmosqueorprayplace`,
        newPlace
      );

      if (res.data.success) {
        // Uğurlu olduqda
        setPlaces([...places, res.data.place]); // Backenddən gələn real datanı əlavə et
        setIsModalOpen(false);
        // Formu sıfırla
        setNewPlace({
          name: "",
          city: "",
          country: "",
          location: "",
          latitude: 40.4093,
          longitude: 49.8671,
          type: "mosque",
          note: "",
        });
        toast.success("Uğurla əlavə edildi!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Xəta baş verdi.");
    }
  };

  // Məkanı Yenilə (API)
  const handleUpdatePlace = async () => {
    try {
      const res = await api.patch(`${ADMIN_URL}/editprayplace`, {
        id: selectedPlace._id,
        ...selectedPlace,
      });

      if (res.data.success) {
        const updatedList = places.map((p) =>
          p._id === selectedPlace._id ? res.data.place : p
        );
        setPlaces(updatedList);
        setIsEditMode(false);
        toast.success("Məlumatlar yeniləndi!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Yeniləmə zamanı xəta oldu.");
    }
  };

  const handledeleteplace = async (placeid) => {
    try {
      console.log("placeid", placeid);
      const res = await api.post(`${ADMIN_URL}/deleteprayplace`, { placeid });

      if (res.data.success) {
        toast.success("Ugurla silindi");
      }
      setSelectedPlace(null);
      fetchnamazgahlar();
      setdeletemode(null);
    } catch (error) {
      console.error(error);
      toast.error("Xəta bas verdi");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      {/* --- SOL PANEL: Detallar --- */}
      <div className="flex-1 p-6 overflow-y-auto border-r border-gray-200 bg-white shadow-lg z-10">
        {selectedPlace ? (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? "Məkanı Redaktə Et" : "Məkan Məlumatları"}
              </h2>
              <div className="flex gap-2">
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleUpdatePlace}
                      className="btn-primary cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      <FaSave /> Yadda Saxla
                    </button>
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="btn-secondary cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      <FaTimes /> Ləğv et
                    </button>
                  </>
                ) : (
                  <div className="flex flex-row gap-x-3">
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="btn-primary cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      <FaEdit /> Redaktə Et
                    </button>

                    <button
                      onClick={() => setdeletemode(selectedPlace._id)}
                      className="btn-primary cursor-pointer bg-red-500 hover:bg-red-700 duration-200 transition-all text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      <FaTrash color="white" /> Məkanı sil
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields (Mövcud kodunuzla eyni, sadəcə qısa saxladım) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ad Inputu */}
              <div className="col-span-2">
                <label className="text-sm text-gray-500">Məkan Adı</label>
                {isEditMode ? (
                  <input
                    className="w-full p-2 border rounded"
                    value={selectedPlace.name}
                    onChange={(e) =>
                      setSelectedPlace({
                        ...selectedPlace,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  <h3 className="text-xl font-bold">{selectedPlace.name}</h3>
                )}
              </div>
              {/* Digər inputlar (Ölkə, Şəhər, Ünvan...) bura gələcək (sizin kodunuzdakı kimi) */}
              <div className="col-span-2">
                <label className="text-sm text-gray-500">Ünvan</label>
                {isEditMode ? (
                  <input
                    className="w-full p-2 border rounded"
                    value={selectedPlace.location}
                    onChange={(e) =>
                      setSelectedPlace({
                        ...selectedPlace,
                        location: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="flex items-center gap-2 text-gray-700">
                    <FaMapMarkerAlt className="text-red-500" />{" "}
                    {selectedPlace.location}
                  </p>
                )}
              </div>

              {/* Statik Xəritə (Detallar üçün) */}
              <div className="col-span-2 h-[500px] rounded overflow-hidden border">
                <MapContainer
                  center={[selectedPlace.latitude, selectedPlace.longitude]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[selectedPlace.latitude, selectedPlace.longitude]}
                  />
                </MapContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <FaMosque size={80} className="mb-4 text-gray-200" />
            <p>Zəhmət olmasa siyahıdan bir məkan seçin.</p>
          </div>
        )}
      </div>

      {/* --- SAĞ PANEL: Siyahı --- */}
      <div className="w-96 bg-gray-50 border-l flex flex-col">
        <div className="p-4 bg-white shadow flex justify-between items-center">
          <h2 className="font-bold text-lg">Məkanlar</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 cursor-pointer text-white p-3 rounded-full hover:bg-blue-700 shadow-lg transition transform hover:scale-110"
          >
            <FaPlus />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {places.map((place) => (
            <div
              key={place._id}
              onClick={() => {
                setSelectedPlace(place);
                setIsEditMode(false);
              }}
              className={`p-3 rounded border cursor-pointer hover:shadow-md transition ${
                selectedPlace?._id === place._id
                  ? "bg-blue-50 border-blue-400"
                  : "bg-white"
              }`}
            >
              <div className="flex gap-3">
                <div
                  className={`mt-1 p-2 h-8 w-8 flex items-center justify-center rounded-full ${
                    place.type === "mosque"
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {place.type === "mosque" ? <FaMosque /> : <FaLocationArrow />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{place.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {place.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL: Əlavə Etmə (Axtarışlı) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full h-full rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-700">
                Yeni Məkan Əlavə Et
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 cursor-pointer hover:text-red-500 transition"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto overflow-x-hidden">
              {/* SOL: Form Inputları */}
              <div className="w-full lg:w-1/3 p-6 lg:border-r bg-white space-y-4 mb-8">
                {/* Type Select */}
                <div className="flex gap-3">
                  <label
                    className={`flex-1 cursor-pointer border p-3 rounded text-center transition ${
                      newPlace.type === "mosque"
                        ? "bg-green-50 border-green-500 text-green-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      onClick={() =>
                        setNewPlace({ ...newPlace, type: "mosque" })
                      }
                    />
                    <FaMosque className="inline mr-2" /> Məscid
                  </label>
                  <label
                    className={`flex-1 cursor-pointer border p-3 rounded text-center transition ${
                      newPlace.type === "prayer_room"
                        ? "bg-orange-50 border-orange-500 text-orange-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      onClick={() =>
                        setNewPlace({ ...newPlace, type: "prayer_room" })
                      }
                    />
                    <FaLocationArrow className="inline mr-2" /> Namazgah
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Ad
                    </label>
                    <input
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 outline-none"
                      placeholder="Məkanın adı"
                      value={newPlace.name}
                      onChange={(e) =>
                        setNewPlace({ ...newPlace, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Ölkə
                      </label>
                      <input
                        className="w-full p-2 border rounded outline-none"
                        placeholder="Ölkə"
                        value={newPlace.country}
                        onChange={(e) =>
                          setNewPlace({ ...newPlace, country: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Şəhər
                      </label>
                      <input
                        className="w-full p-2 border rounded outline-none"
                        placeholder="Şəhər"
                        value={newPlace.city}
                        onChange={(e) =>
                          setNewPlace({ ...newPlace, city: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Ünvan
                    </label>
                    <input
                      className="w-full p-2 border rounded outline-none"
                      placeholder="Küçə, döngə..."
                      value={newPlace.location}
                      onChange={(e) =>
                        setNewPlace({ ...newPlace, location: e.target.value })
                      }
                    />
                  </div>

                  {newPlace.type === "prayer_room" && (
                    <div className="animate-fade-in">
                      <label className="text-xs font-bold text-orange-500 uppercase">
                        Namazgah Qeydi
                      </label>
                      <textarea
                        className="w-full p-2 border border-orange-200 bg-orange-50 rounded h-20 outline-none"
                        placeholder="Məs: 2-ci mərtəbə..."
                        value={newPlace.note}
                        onChange={(e) =>
                          setNewPlace({ ...newPlace, note: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <div className="p-2 bg-gray-100 rounded text-xs text-gray-500 font-mono">
                    Coords: {newPlace.latitude.toFixed(6)},{" "}
                    {newPlace.longitude.toFixed(6)}
                  </div>
                </div>
              </div>

              {/* SAĞ: Xəritə və Axtarış */}
              <div className="w-full h-96 lg:h-auto lg:w-3/2 min-h-[500px] relative bg-gray-200">
                {/* --- FEATURE: Axtarış Inputu (Position Absolute) --- */}
                <div className="absolute top-4 left-4 right-16 z-[1000] w-full">
                  <div className="relative justify-center flex flex-row items-center">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="border border-gray-600 w-full pl-4 max-w-2xl pr-3 py-2 rounded-lg leading-5 bg-white placeholder-gray-500 duration-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                      placeholder="Ünvan axtar (Məs: Gənclik Mall)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                      </div>
                    )}
                    <div className="border bg-black relative w-10">
                      {/* Axtarış Nəticələri (Dropdown) */}
                      {searchResults.length > 0 && (
                        <ul className="absolute top-5 right-[40px] z-10 mt-1 lg:w-2xl w-lg bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {searchResults.map((result, index) => (
                            <li
                              key={index}
                              onClick={() => handleSelectLocation(result)}
                              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900 border-b last:border-0"
                            >
                              <div className="flex items-center">
                                <span className="font-normal block truncate">
                                  {result.display_name}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Xəritə */}
                <MapContainer
                  center={[40.4093, 49.8671]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  {/* Koordinat dəyişəndə xəritəni hərəkət etdirən komponent */}
                  <MapController
                    coords={[newPlace.latitude, newPlace.longitude]}
                  />

                  {/* Marker və Klik Hadisəsi */}
                  <LocationMarker />
                </MapContainer>

                {/* Cari Mövqe Düyməsi */}
                <button
                  onClick={handleGetCurrentLocation}
                  className="absolute cursor-pointer bottom-6 right-6 z-[1000] bg-white p-3 rounded-full shadow-lg text-blue-600 hover:bg-gray-100 transition"
                  title="Cari Mövqe"
                >
                  <FaLocationArrow size={20} />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 cursor-pointer rounded text-gray-600 font-medium hover:bg-gray-200 transition"
              >
                Ləğv et
              </button>
              <button
                onClick={handleAddPlace}
                className="px-5 py-2 cursor-pointer rounded bg-blue-600 text-white font-bold hover:bg-blue-700 shadow transition"
              >
                Təsdiqlə
              </button>
            </div>
          </div>
        </div>
      )}

      {deletemode && (
        <div className="fixed flex items-center justify-center inset-0 z-50 p-12 w-full h-full bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-2/3 h-2/3 rounded-2xl flex flex-col items-center justify-center gap-y-4">
            <h2>Silmək istədiyinizdən əminsinizmi?</h2>
            <div className="flex flex-row gap-x-8">
              <button
                onClick={() => setdeletemode(null)}
                className="flex flex-row items-center justify-center py-2 px-5 bg-green-600 text-white gap-x-2 rounded-3xl cursor-pointer"
              >
                <MdOutlineCancel color="white" size={24} />
                Ləğv et
              </button>
              <button
                onClick={() => handledeleteplace(deletemode)}
                className="flex flex-row items-center justify-center py-2 px-7 bg-red-600 text-2xl text-white rounded-4xl cursor-pointer"
              >
                <FaTrashAlt color="white" size={24} />
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Namazgahlar;
