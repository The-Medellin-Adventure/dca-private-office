"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Inicia sesión anónima automáticamente. El usuario nunca ve un formulario
// de login: esto solo evita que Firestore/Storage queden accesibles para
// cualquiera que tenga tu apiKey pública. Es autenticación "silenciosa".
let authReadyPromise = null;

export function ensureAnonymousAuth() {
  if (authReadyPromise) return authReadyPromise;

  authReadyPromise = new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth).catch((err) => {
          console.error("Error de autenticación anónima:", err);
          resolve(null);
        });
      }
    });
  });

  return authReadyPromise;
}
