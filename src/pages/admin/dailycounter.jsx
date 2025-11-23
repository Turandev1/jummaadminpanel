import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Minus,
  Calendar,
  Target,
  Trash2,
  CheckCircle,
  Trophy,
  X,
  TrendingUp,
  Award,
} from "lucide-react";

// --- YARDIMCI SABİTLER ---
const LAST_DAYS_TO_SHOW = 30; // Son 30 günün verisi gösterilecek ve tutulacak

// ------------------------------------------
// Yardımcı Fonksiyon: Bugünün tarih anahtarını (YYYY-MM-DD) döndürür
// ------------------------------------------
const getTodayKey = () => {
  // Tarihi Türkiye saat dilimine göre almak daha tutarlı olabilir, ancak genel kullanım için ISO formatı yeterlidir.
  return new Date().toISOString().split("T")[0];
};

// ------------------------------------------
// Yardımcı Fonksiyon: Son X günü (bugün dahil) döndürür
// ------------------------------------------
const getLastXDays = (x = 30) => {
  const dates = [];
  for (let i = 0; i < x; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

// ------------------------------------------
// Yardımcı Fonksiyon: Eski kayıtları temizler
// ------------------------------------------
const cleanOldRecords = (records, daysToKeep = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffKey = cutoffDate.toISOString().split("T")[0];

  const newRecords = {};
  for (const dateKey in records) {
    if (dateKey >= cutoffKey) {
      newRecords[dateKey] = records[dateKey];
    }
  }
  return newRecords;
};

// ------------------------------------------
// Ana Bileşen: DailyCounter
// ------------------------------------------
const DailyCounter = () => {
  // dailyRecords: { 'YYYY-MM-DD': { count: N, goal: G, isCompleted: true, isExceeded: false } }
  const [dailyRecords, setDailyRecords] = useState({});
  const [currentCount, setCurrentCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const todayKey = getTodayKey();
  const lastThirtyDays = useMemo(() => getLastXDays(LAST_DAYS_TO_SHOW), []);

  // Bugüne ait hedef durumunu global dailyGoal state'i ile kontrol ediyoruz
  const isGoalReached = currentCount >= dailyGoal && dailyGoal > 0;
  const progressPercentage =
    dailyGoal > 0 ? Math.min(100, (currentCount / dailyGoal) * 100) : 0;

  // ------------------------------------------
  // Hesaplanan Performans Metrikleri
  // ------------------------------------------
  const performanceMetrics = useMemo(() => {
    let daysGoalMet = 0; // Hedefe ulaşılan veya aşılan gün sayısı
    let daysExceededGoal = 0; // Hedefin aşıldığı gün sayısı (count > goal)

    // Yalnızca son 30 gün verisini dikkate al
    lastThirtyDays.forEach((dateKey) => {
      const day = dailyRecords[dateKey];

      if (!day) return;

      // Buradaki isCompleted/isExceeded bayrakları, verinin kaydedildiği andaki
      // o günün hedefine göre belirlenmiş olduğu için doğrudur.
      if (day.isCompleted) daysGoalMet++;
      if (day.isExceeded) daysExceededGoal++;
    });

    // Toplam gün sayısı (30) bazında oranlar
    const totalDaysCount = LAST_DAYS_TO_SHOW;

    const goalMetRate = Math.round((daysGoalMet / totalDaysCount) * 100);
    const daysExceededRate = Math.round(
      (daysExceededGoal / totalDaysCount) * 100
    );

    return {
      daysGoalMet,
      daysExceededGoal,
      totalActiveDays: totalDaysCount,
      goalMetRate,
      daysExceededRate,
    };
  }, [dailyRecords, lastThirtyDays]);

  // ------------------------------------------
  // 1. useEffect: Veri Okuma, Temizleme ve Başlangıç Ayarı
  // ------------------------------------------
  useEffect(() => {
    const storedData = localStorage.getItem("dailyCounterData");
    const storedGoal = localStorage.getItem("dailyCounterGoal");

    if (storedData) {
      let parsedRecords = JSON.parse(storedData);
      parsedRecords = cleanOldRecords(parsedRecords, LAST_DAYS_TO_SHOW);

      setDailyRecords(parsedRecords);

      const todayData = parsedRecords[todayKey];
      if (todayData) {
        setCurrentCount(todayData.count);
      } else {
        // Bugün için kayıt yoksa, bugünün kaydını oluşturuyoruz (goal'ü mevcut dailyGoal'den alarak)
        setCurrentCount(0);
      }

      localStorage.setItem("dailyCounterData", JSON.stringify(parsedRecords));
    }

    if (storedGoal) {
      try {
        setDailyGoal(parseInt(storedGoal, 10));
      } catch (error) {
        console.error("Hedef okunurken hata:", error);
      }
    }
  }, [todayKey]);

  // Toast (Tebrik Mesajı) Yönetimi
  useEffect(() => {
    // Sadece hedef aşıldığında veya tam hedefe ulaşıldığında göster
    if (isGoalReached) {
      if (currentCount > dailyGoal) {
        setToastMessage({
          type: "success",
          message: `🚀 Hedefi Aştınız! Tebrikler! (${
            currentCount - dailyGoal
          } Ekstra)`,
        });
      } else if (currentCount === dailyGoal) {
        setToastMessage({
          type: "success",
          message: `🎉 Hedef Tamamlandı! Tebrikler!`,
        });
      }
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [currentCount, dailyGoal, isGoalReached]);

  // ------------------------------------------
  // 2. useCallback: Veri Kaydetme (Count değiştiğinde bu fonksiyon çalışır)
  // ------------------------------------------
  const saveToLocalStorage = useCallback(
    (newCount) => {
      // ÖNEMLİ DÜZELTME: Sayım güncellendiğinde, kayıtlı hedefin bugünkü hedef ile
      // senkronize olduğundan emin olmak için her zaman GÜNCEL dailyGoal'ü kullanmalıyız.
      const currentDayGoal = dailyGoal;

      const newDailyRecords = {
        ...dailyRecords,
        [todayKey]: {
          count: newCount,
          goal: currentDayGoal, // Güncel hedefi kaydet
          isCompleted: newCount >= currentDayGoal,
          isExceeded: newCount > currentDayGoal,
        },
      };

      localStorage.setItem("dailyCounterData", JSON.stringify(newDailyRecords));
      setDailyRecords(newDailyRecords);
    },
    [dailyRecords, todayKey, dailyGoal]
  );

  // ------------------------------------------
  // 3. Sayaç Kontrol Fonksiyonları
  // ------------------------------------------
  const handleIncrement = () => {
    setCurrentCount((prevCount) => {
      const newCount = prevCount + 1;
      saveToLocalStorage(newCount);
      return newCount;
    });
  };

  const handleDecrement = () => {
    setCurrentCount((prevCount) => {
      if (prevCount > 0) {
        const newCount = prevCount - 1;
        saveToLocalStorage(newCount);
        return newCount;
      }
      return 0;
    });
  };

  const handleReset = () => {
    setCurrentCount(0);
    saveToLocalStorage(0);
  };

  // ------------------------------------------
  // 4. Hedef Kontrol Fonksiyonları
  // ------------------------------------------
  const handleGoalChange = (e) => {
    const newGoal = parseInt(e.target.value, 10);
    if (!isNaN(newGoal) && newGoal >= 0) {
      setDailyGoal(newGoal);
      localStorage.setItem("dailyCounterGoal", newGoal.toString());

      // Hedef değiştiğinde, bugünün kaydını da yeni hedef ve yeni durumlarla güncelleriz.
      setDailyRecords((prev) => {
        const todayData = prev[todayKey] || { count: 0 };

        const updatedToday = {
          ...todayData,
          goal: newGoal,
          isCompleted: todayData.count >= newGoal,
          isExceeded: todayData.count > newGoal,
        };

        const updated = { ...prev, [todayKey]: updatedToday };
        localStorage.setItem("dailyCounterData", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleGoalSave = () => {
    setIsEditingGoal(false);
  };

  // Custom CSS for Toast Animation
  const ToastStyle = () => (
    <style>
      {`
        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes toast-out {
          from { opacity: 1; transform: translate(-50%, 0); }
          to { opacity: 0; transform: translate(-50%, 20px); }
        }
        .animate-toast-in {
            animation: toast-in 0.3s ease-out forwards;
        }
        .animate-toast-out {
            animation: toast-out 0.5s ease-in forwards 3.5s; /* Start fading out after 3.5s */
        }
      `}
    </style>
  );

  // ------------------------------------------
  // 5. Bileşenin Arayüzü (Render)
  // ------------------------------------------
  return (
    <div className="font-sans max-w-5xl mx-auto my-10 p-6 sm:p-8 bg-gray-50 rounded-2xl shadow-xl relative">
      <ToastStyle />

      {/* Header */}
      <header className="text-center text-gray-800 border-b-2 border-gray-200 pb-4 mb-8 text-3xl font-extrabold flex items-center justify-center gap-3">
        <Trophy size={35} className="text-yellow-500" /> Performans Takip Paneli
      </header>

      {/* Ana Grid Yapısı: Sol (Sayaç) ve Sağ (Tarih) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 border p-4 border-indigo-600 rounded-lg">
        {/* SOL SÜTUN: Sayaç ve Hedef Kontrolleri */}
        <div className="flex flex-col gap-6">
          {/* Sayaç Kartı */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg text-center flex-grow">
            <p className="text-lg text-gray-500 font-medium mb-3">
              BUGÜN: <span className="font-bold text-gray-700">{todayKey}</span>
            </p>

            {/* Sayaç Değeri */}
            <div
              className={`text-8xl font-black my-4 transition-colors duration-300 ${
                isGoalReached ? "text-green-600" : "text-blue-500"
              }`}
            >
              {currentCount}
            </div>

            {/* İlerleme Çubuğu */}
            {dailyGoal > 0 && (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  Hedefe İlerleme: {currentCount} / {dailyGoal}
                </p>
                <div className="w-11/12 mx-auto mb-6 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${
                      isGoalReached ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </>
            )}

            {/* Kontrol Düğmeleri */}
            <div className="flex justify-center gap-5 items-center">
              <button
                onClick={handleDecrement}
                disabled={currentCount === 0}
                className={`p-5 rounded-full transition-all duration-200 shadow-md flex items-center justify-center w-16 h-16 text-white text-3xl
								${
                  currentCount === 0
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 cursor-pointer active:scale-95 shadow-red-300/50"
                }
							`}
              >
                <Minus size={32} />
              </button>

              <button
                onClick={handleIncrement}
                className="p-5 bg-green-500 cursor-pointer hover:bg-green-600 active:scale-95 transition-all duration-200 text-white rounded-full shadow-lg shadow-green-300/50 flex items-center justify-center w-16 h-16 text-3xl"
              >
                <Plus size={32} />
              </button>
            </div>
          </div>

          {/* Hedef Belirleme ve Sıfırlama Kartı */}
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <Target size={24} className="text-blue-600" />
              <span className="font-semibold text-blue-800">Günlük Hedef:</span>
              {isEditingGoal ? (
                <input
                  type="number"
                  value={dailyGoal}
                  onChange={handleGoalChange}
                  onBlur={handleGoalSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGoalSave();
                  }}
                  autoFocus
                  min="0"
                  className="w-20 p-2 text-center border-2 border-blue-400 rounded-lg text-lg font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <span
                  onClick={() => setIsEditingGoal(true)}
                  className="text-xl font-bold text-blue-700 cursor-pointer border-b border-dashed border-transparent hover:border-blue-400 transition-colors"
                >
                  {dailyGoal}
                </span>
              )}
            </div>

            {/* Sıfırlama Düğmesi */}
            <button
              onClick={handleReset}
              disabled={currentCount === 0}
              className={`py-2 px-4 text-sm font-medium rounded-lg transition-all duration-200 flex items-center 
							${
                currentCount === 0
                  ? "text-gray-400 border border-gray-200 cursor-not-allowed"
                  : "text-red-600 border border-red-300 cursor-pointer hover:bg-red-50 hover:border-red-400 active:scale-95"
              }
						`}
            >
              <Trash2 size={16} className="mr-1" />
              Sıfırla
            </button>
          </div>
        </div>

        {/* SAĞ SÜTUN: 30 Günlük Geçmiş */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <Calendar size={24} className="mr-2 text-gray-600" />
            Son {LAST_DAYS_TO_SHOW} Günlük Performans
          </h2>

          {/* Kaydırılabilir Geçmiş Alanı */}
          <div className="max-h-[450px] overflow-y-auto pr-3 space-y-3">
            {lastThirtyDays.map((dateKey) => {
              // --- DÜZELTME 1 & 3: Kayıt objesini doğru al, count'a doğru eriş ---
              const record = dailyRecords[dateKey];
              const count = record?.count || 0;
              // --- DÜZELTME 2: O günün kaydedilmiş hedefini kullan ---
              const dayGoal =
                record?.goal || (dateKey === todayKey ? dailyGoal : 0);

              const isToday = dateKey === todayKey;
              const dayGoalReached = dayGoal > 0 && count >= dayGoal;
              const dayProgress =
                dayGoal > 0 ? Math.min(100, (count / dayGoal) * 100) : 0; // 'dayGoal' kullanılıyor

              const displayDate = isToday ? "BUGÜN" : dateKey;

              return (
                <div
                  key={dateKey}
                  className={`p-4 rounded-xl shadow-sm flex flex-col gap-2 transition-all duration-300 
										${
                      isToday
                        ? "bg-teal-50 border-l-4 border-teal-500"
                        : "bg-white border-l-4 border-gray-200 hover:shadow-md"
                    }
										${dayGoalReached && !isToday ? "border-l-4 border-green-500" : ""}
									`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-medium ${
                        isToday ? "text-teal-800 font-bold" : "text-gray-700"
                      }`}
                    >
                      {displayDate}
                    </span>

                    <span
                      className={`text-xl font-bold ${
                        dayGoalReached ? "text-green-600" : "text-blue-500"
                      }`}
                    >
                      {count}{" "}
                      {dayGoalReached && (
                        <CheckCircle
                          size={20}
                          className="inline align-middle text-green-600 ml-1"
                        />
                      )}
                    </span>
                  </div>

                  {/* Çubuk Grafik ve Detay */}
                  {dayGoal > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            dayGoalReached ? "bg-green-400" : "bg-blue-400"
                          }`}
                          style={{ width: `${dayProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-500">
                        % {Math.round(dayProgress)} (Hedef: {dayGoal})
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- AYLIK İSTATİSTİK BAR GRAFİĞİ (YENİ KISIM) --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-700">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <TrendingUp size={24} className="mr-2 text-indigo-500" />
          Son {LAST_DAYS_TO_SHOW} Günlük Performans Özeti
        </h3>

        {dailyGoal > 0 ? (
          <>
            {/* 1. Kısım: Hedef Tamamlama Oranı (Goal Met Rate) */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-base font-medium text-gray-700 flex items-center">
                  <CheckCircle size={18} className="text-green-500 mr-1" />
                  Hedef Tamamlama Oranı
                  <span className="ml-2 text-sm text-green-600 font-bold">
                    ({performanceMetrics.daysGoalMet} /{" "}
                    {performanceMetrics.totalActiveDays} Gün)
                  </span>
                </span>
                <span className="text-lg font-bold text-green-600">
                  %{performanceMetrics.goalMetRate}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-700 ease-out"
                  style={{ width: `${performanceMetrics.goalMetRate}%` }}
                ></div>
              </div>
            </div>

            {/* 2. Kısım: Ekstra Başarı Günleri Oranı (Days Exceeded Goal Rate) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-base font-medium text-gray-700 flex items-center">
                  <Award size={18} className="text-yellow-500 mr-1" />
                  Ekstra Başarı Günleri Oranı
                  <span className="ml-2 text-sm text-yellow-600 font-bold">
                    ({performanceMetrics.daysExceededGoal} /{" "}
                    {performanceMetrics.totalActiveDays} Gün)
                  </span>
                </span>
                <span className="text-lg font-bold text-yellow-600">
                  %{performanceMetrics.daysExceededRate}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all duration-700 ease-out"
                  style={{ width: `${performanceMetrics.daysExceededRate}%` }}
                ></div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 italic p-4 bg-gray-50 rounded-lg">
            Aylık performans metriklerini görmek için lütfen bir günlük hedef (
            <Target size={16} className="inline text-blue-500" />) belirleyiniz.
          </p>
        )}
      </div>
      {/* --- AYLIK İSTATİSTİK BAR GRAFİĞİ SONU --- */}

      {/* Toast Bildirimi (Tailwind Style) */}
      {toastMessage && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 p-4 sm:p-5 rounded-xl shadow-2xl font-semibold z-50 text-white flex items-center gap-3 animate-toast-in animate-toast-out"
          style={{
            backgroundColor: "#10b981", // bg-green-500
            transition: "opacity 0.3s, transform 0.3s",
          }}
        >
          {toastMessage.message}
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 p-1 rounded-full cursor-pointer hover:bg-green-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyCounter;
