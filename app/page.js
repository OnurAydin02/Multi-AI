"use client"
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Suspense } from "react";
import ChatInputBox from "./_components/ChatInputBox";

export default function Home() {
  const { setTheme } = useTheme();

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ChatInputBox />
      </Suspense>
    </div>
  );
}

