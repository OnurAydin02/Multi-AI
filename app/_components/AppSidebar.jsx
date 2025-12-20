"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button";
import { Moon, Sun, User2, Zap } from "lucide-react";
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
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src={'/logo.svg'}
                alt="logo"
                width={60}
                height={60}
                className="w-[40px] h-[40px]"
              />
              <h2 className="font-bold text-xl">Multi AI</h2>
            </div>
            <div>
              {mounted && (theme === 'light' ? (
                <Button variant="ghost" onClick={() => setTheme("dark")}>
                  <Moon />
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setTheme("light")}>
                  <Sun />
                </Button>
              ))}
            </div>
          </div>
          {mounted && (user ?
            <Button asChild className='mt-5 w-full' size='lg'>
              <Link href={'/'}>+ New Chat</Link>
            </Button> :
            <Button className='mt-5 w-full' size='lg' onClick={() => openSignIn({ forceRedirectUrl: '/' })}>+ New Chat</Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className={'p-3'}>
            <h2 className="font-bold text-lg">Chat</h2>
            {!user && <p className="text-sm text-gray-400">Sign in to start chating with multiple AI model</p>}
            <div className="overflow-auto">
              {chatHistory.map((chat, index) => (
                <Link href={'?chatId=' + chat.chatId} key={index} className="">
                  <div className="hover:bg-gray-100 p-3 cursor-pointer">
                    <h2 className="text-sm text-gray-400">{GetLastUserMessageFromChat(chat).lastMsgDate}</h2>
                    <h2 className="text-lg line-clamp-1">{GetLastUserMessageFromChat(chat).message}</h2>
                  </div>
                  <hr className="my-1" />
                </Link>
              ))}
            </div>
          </div>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter>
        <div className="p-3 mb-10">

          {!user ? <Button className={'w-full'} size={'lg'} onClick={() => openSignIn({ mode: 'modal' })}>Sign In/Sign Up</Button>
            :
            <div>
              {!paidUser && (
                <div>
                  <UsageCreditProgress remainingToken={freeMsgCount} />
                  <PricingModal>
                    <Button className={'w-full mb-3'}> <Zap /> Upgrade plan </Button>
                  </PricingModal>
                </div>
              )}
              <Button className="flex" variant={'ghost'}>
                <User2 />  <h2>Settings</h2>
              </Button>
            </div>
          }
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
