"use client";

import React, { createContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/config/FirebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { DefaultModel } from "@/shared/AiModelsShared";

export const AiSelectedModelContext = createContext();

export default function Provider({ children }) {
  const { user } = useUser();

  const [aiSelectedModels, setAiSelectedModels] = useState(DefaultModel);
  const [messages, setMessages] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Hydration hatası çözümü — client mount olana kadar render edilmez
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // -----------------------------------------------------------
  //  🔥 Firestore’daki kullanıcıyı oluştur / yükle
  // -----------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    const loadUser = async () => {
      try {
        const userId = user.id; // ✔ Firestore için güvenli ID
        const userEmail = user.primaryEmailAddress?.emailAddress;
        const userRef = doc(db, "users", userId);

        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          // ------------------------------
          // Firestore'da yeni kullanıcı oluştur
          // ------------------------------
          await setDoc(userRef, {
            id: userId,
            email: userEmail,
            models: DefaultModel,
            createdAt: Date.now(),
          });

          setAiSelectedModels(DefaultModel);
        } else {
          // ------------------------------
          // Var olan kullanıcıyı yükle
          // ------------------------------
          const data = snap.data();
          setAiSelectedModels(data.models || DefaultModel);
        }
      } catch (err) {
        console.error("User load/create error:", err);
      }
    };

    loadUser();
  }, [user]);

  // -----------------------------------------------------------
  // Context Value
  // -----------------------------------------------------------
  return (
    <AiSelectedModelContext.Provider
      value={{ aiSelectedModels, setAiSelectedModels, messages, setMessages }}
    >
      {children}
    </AiSelectedModelContext.Provider>
  );
}
