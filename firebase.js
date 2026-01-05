import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAJYXX9thw9ElW9xkZaoeU8HWPx9rMcM_I",
  authDomain: "jummapushnotification.firebaseapp.com",
  projectId: "jummapushnotification",
  storageBucket: "jummapushnotification.firebasestorage.app",
  messagingSenderId: "247966630192",
  appId: "1:247966630192:web:30e384599eb281c3a948f5",
};
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = () => {
  return getToken(messaging, {
    vapidKey:
      "BDwNOg0BmKoEvfgG-IysObhWgKW19blSgPYigeFrsvnYyP5fc89eM5Ktl5Zhu3mVUVpEpNpHDo7KuNxv2gxQ2gU",
  })
    .then((currentToken) => {
      if (currentToken) {
        console.log("İstifadəçinin Tokeni:", currentToken);
        // BU TOKENİ ÖZ BACKENDİNİZƏ GÖNDƏRİB BAZADA SAXLAMALISINIZ
        return currentToken;
      } else {
        console.log("İstifadəçi icazə vermədi.");
      }
    })
    .catch((err) => {
      console.log("Token alınarkən xəta:", err);
    });
};

// Ön planda (sayt açıq olanda) bildirişləri dinləmək
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
