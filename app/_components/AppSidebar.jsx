"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button";
import { Moon, Sun, User2, Zap, Code } from "lucide-react";
import Image from "next/image"
import { useTheme } from "next-themes";
import { useUser, useClerk } from "@clerk/nextjs";
import UsageCreditProgress from "./UsageCreditProgress";
import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useEffect, useState, useContext } from "react";
import { AiSelectedModelConetxt } from "@/context/AiSelectedModelContext";
import moment from "moment";
import Link from 'next/link';
import axios from "axios";
import PricingModal from "./PricingModal";
import { useAuth } from '@clerk/nextjs';

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const [chatHistory, setChatHistory] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [freeMsgCount, setFreeMsgCount] = useState(0);
  const { aiSelectedModels, setAiSelectedModels, messages, setMessages } = useContext(AiSelectedModelConetxt);
  const { has, isLoaded } = useAuth();
  const paidUser = isLoaded && has ? has({ plan: 'unlimited_plan' }) : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    GetRemainingTokenMsgs();
  }, [messages])

  useEffect(() => {
    if (!user) return;
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    // Using onSnapshot to get real-time updates from Firebase
    const q = query(collection(db, "chatHistory"), where("userEmail", '==', userEmail));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => doc.data());
      // Sort chats by date (newest first)
      const sortedChats = chats.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
      setChatHistory(sortedChats);
    });

    return () => unsubscribe();
  }, [user]);

  const GetLastUserMessageFromChat = (chat) => {

    const allMessages = Object.values(chat.messages).flat();
    const userMessages = allMessages.filter(msg => msg.role == "user");

    const lastUserMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : null;

    const lastUpdated = chat.lastUpdated || Date.now();
    const formattedDate = moment(lastUpdated).fromNow();

    return {
      chatId: chat.chatId,
      message: lastUserMsg,
      lastMsgDate: formattedDate
    }
  }

  const GetRemainingTokenMsgs = async () => {
    const result = await axios.post('/api/user-remaining-msg', {});
    console.log(result);
    setFreeMsgCount(result?.data?.remainingToken)
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-3">
          <div className="p-3 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Image
                src={'/logo.svg'}
                alt="logo"
                width={60}
                height={60}
                className="w-[50px] h-[50px]"
              />
              <h2 className="font-bold text-2xl tracking-tight">Multi AI</h2>
            </div>
            <div>
              {mounted && (theme === 'light' ? (
                <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-full" onClick={() => setTheme("dark")}>
                  <Moon size={22} />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="hover:bg-gray-800 rounded-full" onClick={() => setTheme("light")}>
                  <Sun size={22} />
                </Button>
              ))}
            </div>
          </div>
          {mounted && (user ?
            <Button asChild className='w-full py-7 text-base shadow-md hover:scale-[1.02] transition-transform' size='lg'>
              <Link href={'/'}>+ New Chat</Link>
            </Button> :
            <Button className='w-full py-7 text-base shadow-md hover:scale-[1.02] transition-transform' size='lg' onClick={() => openSignIn({ forceRedirectUrl: '/' })}>+ New Chat</Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className={'px-4 mt-6'}>
            <h2 className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400 mb-6 px-2">History</h2>
            {!user && <p className="text-sm text-gray-400 px-2 leading-relaxed">Sign in to start chatting with multiple AI models</p>}
            <div className="flex flex-col gap-3">
              {chatHistory.map((chat, index) => (
                <Link href={'?chatId=' + chat.chatId} key={index} className="group">
                  <div className="hover:bg-gray-100 dark:hover:bg-gray-800/80 p-4 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                    <h2 className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-primary mb-2 tracking-wider">{GetLastUserMessageFromChat(chat).lastMsgDate}</h2>
                    <h2 className="text-[15px] font-semibold line-clamp-1 text-foreground/70 group-hover:text-foreground leading-tight">{GetLastUserMessageFromChat(chat).message}</h2>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter>
        <div className="p-3 mb-10">

          {!user ? <Button className={'w-full mb-6 py-6 font-bold'} size={'lg'} onClick={() => openSignIn({ mode: 'modal' })}>Sign In / Sign Up</Button>
            :
            <div className="flex flex-col gap-4">
              {!paidUser && (
                <div className="space-y-4">
                  <UsageCreditProgress remainingToken={freeMsgCount} />
                  <PricingModal>
                    <Button className={'w-full py-5 text-sm font-semibold shadow-sm transition-all hover:bg-yellow-50 dark:hover:bg-yellow-950/10'} variant="outline"> <Zap size={16} className="mr-2 fill-yellow-400 text-yellow-400" /> Upgrade Plan </Button>
                  </PricingModal>
                </div>
              )}
              <Button className="flex w-full justify-start px-5 gap-4 py-5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" variant={'ghost'} asChild>
                <Link href="/profile">
                  <User2 size={18} /> <span className="text-sm font-medium">Settings</span>
                </Link>
              </Button>
            </div>
          }

          <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-4 px-2">
            <Link
              href="https://www.linkedin.com/in/mustafaonuraydin2/"
              target="_blank"
              className="flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity duration-300 group"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Code size={14} className="text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Developer</span>
                  <span className="text-xs font-semibold text-foreground group-hover:text-blue-500 transition-colors">Mustafa Onur Aydın</span>
                </div>
              </div>
              <div className="text-[10px] text-gray-400 font-mono">v1.0.0</div>
            </Link>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
