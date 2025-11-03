"use client"
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function Home() {
  const {setTheme} = useTheme();

  return (
    <div>
      <h2>Donate to Onur's Website</h2>
      <Button>Save</Button>
      <Button onClick={()=>setTheme('dark')}>Dark Button</Button>
      <Button onClick={()=>setTheme('light')}>Light Button</Button>
    </div>
  );
}
