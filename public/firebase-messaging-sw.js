/* eslint-disable no-undef */

// 1. Versiyanı konkret olaraq qeyd etməlisən (məsələn: 10.13.2)
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

// 2. Firebase Konfiqurasiyası
// QEYD: Bura mütləq öz Firebase Console-dan aldığın real məlumatları yazmalısan!
const firebaseConfig = {
  apiKey: "AIzaSyAJYXX9thw9ElW9xkZaoeU8HWPx9rMcM_I",
  authDomain: "jummapushnotification.firebaseapp.com",
  projectId: "jummapushnotification",
  storageBucket: "jummapushnotification.firebasestorage.app",
  messagingSenderId: "247966630192",
  appId: "1:247966630192:web:30e384599eb281c3a948f5",
};

// 3. Firebase-i başlat
firebase.initializeApp(firebaseConfig);

// 4. Messaging obyektini yarat
const messaging = firebase.messaging();

// 5. Arxa fon (Background) bildirişləri
// Bu funksiya sayt bağlı olanda və ya arxa fonda olanda işləyir
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Arxa fonda mesaj alındı: ", payload);

  const notificationTitle = payload.notification.title || "Yeni Bildiriş";
  const notificationOptions = {
    body: payload.notification.body || "Məzmun yoxdur",
    icon: "/logo192.png", // public qovluğunda olan bir şəkil yolu
    badge: "/favicon.ico", // Android-də yuxarıda görünən kiçik ikon
    data: payload.data, // Bildirişə klikləyəndə lazım olacaq data
  };

  // Bildirişi ekranda göstər
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // Bildirişi bağla

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      // Əgər sayt artıq açıqdırsa, ora fokuslan
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      // Sayt açıq deyilsə, yeni pəncərədə aç
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
