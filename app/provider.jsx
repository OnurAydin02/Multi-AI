"use client"
import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./_components/AppSidebar"
import AppHeader from "./_components/AppHeader";
import { useUser } from "@clerk/nextjs";
import { db } from "@/config/FirebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

function Provider({ children, ...props }) {

    const { user } = useUser();

    useEffect(() => {
        if (user) {
            CreateNewUser();   // <-- DOĞRU ŞEKİLDE ÇAĞIRMA
        }
    }, [user]);

    const CreateNewUser = async () => {

        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) return;

        // Firestore'da users koleksiyonu
        const userRef = doc(db, "users", email);
        const userSnap = await getDoc(userRef);

        // Eğer kullanıcı zaten varsa çık
        if (userSnap.exists()) {
            console.log("Existing user found");
            return;
        }

        // Yeni kullanıcı verisi
        const userData = {
            name: user?.fullName,
            email: email,
            createdAt: new Date(),
            remainingMsg: 5, // free user default
            plan: "Free",
            credits: 1000, // Paid users
        };

        // Firestore'a kaydet
        await setDoc(userRef, userData);
        console.log("New user data saved");
    };

    return (
        <NextThemesProvider
            {...props}
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <SidebarProvider>
                <AppSidebar />
                <div className="w-full">
                    <AppHeader />
                    {children}
                </div>
            </SidebarProvider>
        </NextThemesProvider>
    );
}

export default Provider;
