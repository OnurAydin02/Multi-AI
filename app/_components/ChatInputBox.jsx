import React, { useContext, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { Paperclip, Mic, Send } from "lucide-react";
import AiMultiModels from './AiMultiModels';
import AiModelList from "@/shared/AiModelList";
import { AiSelectedModelConetxt } from '@/context/AiSelectedModelContext';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'next/navigation';
import { db } from '@/config/FirebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth, useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

function ChatInputBox() {

    const [userInput, setUserInput] = useState("");
    const { aiSelectedModels, setAiSelectedModels, messages, setMessages } = useContext(AiSelectedModelConetxt);
    const { user } = useUser();
    const [chatId, setChatId] = useState();
    const params = useSearchParams();
    const { has, isLoaded } = useAuth();
    const paidUser = isLoaded && has ? has({ plan: 'unlimited_plan' }) : false;

    useEffect(() => {
        const paramChatId = params.get('chatId');
        if (paramChatId) {
            setChatId(paramChatId);
            GetMessages(paramChatId);
        }
        else {
            setChatId(uuidv4());
            setMessages({}); // Clear messages for a truly new chat

            // Optional: Reset enabled models to default or keep user preference?
            // Usually for a clean slate, we just clear messages. 
            // The models stay selecting based on global context (which is fine).
        }
    }, [params])

    const handleSend = async () => {
        if (!userInput.trim()) return;

        // Ensure we wait for auth state
        if (!isLoaded) {
            toast.info("Checking your subscription...");
            return;
        }

        // Call only if User Free
        if (!paidUser) {
            // Deduct and Check Token Limit
            try {
                const result = await axios.post('/api/user-remaining-msg', {
                    token: 1
                });
                const remainingToken = result?.data?.remainingToken

                if (remainingToken <= 0) {
                    console.log("Limit Exceed")
                    toast.error("Maximum Daily Limit Exceed");
                    return;
                }
            } catch (err) {
                console.error("Token check failed", err);
                // If token API fails, we might want to block or allow. 
                // Let's block for safety.
                toast.error("Error checking message limit.");
                return;
            }
        }

        // 1 🧩 Add user message to all enabled models
        setMessages((prev) => {
            const updated = { ...prev };
            Object.keys(aiSelectedModels).forEach((modelKey) => {
                if (aiSelectedModels[modelKey].enable === false) return;
                updated[modelKey] = [
                    ...(updated[modelKey] ?? []),
                    { role: "user", content: userInput },
                ];
            });
            return updated;
        });

        const currentInput = userInput; // capture before reset
        setUserInput("");

        // 2 🤖 Fetch response from each enabled model
        Object.entries(aiSelectedModels).forEach(async ([parentModel, modelInfo]) => {
            if (!modelInfo.modelId) return;
            if (modelInfo.enable === false) return;

            // Add loading placeholder before API call
            setMessages((prev) => ({
                ...prev,
                [parentModel]: [
                    ...(prev[parentModel] ?? []),
                    { role: "assistant", content: "loading...", model: parentModel, loading: true },
                ],
            }));

            try {
                // Find model config to get systemPrompt
                const modelConfig = AiModelList.find(m => m.model === parentModel);

                // Combine system prompt with user input to ensure compatibility with all APIs
                const combinedContent = modelConfig?.systemPrompt
                    ? `${modelConfig.systemPrompt}\n\nKullanıcı: ${currentInput}`
                    : currentInput;

                const result = await axios.post("/api/ai-multi-model", {
                    model: modelInfo.modelId,
                    msg: [{ role: "user", content: combinedContent }],
                    parentModel,
                });

                const { aiResponse, model } = result.data;

                // 3 🎯 Add AI response to that model’s messages
                setMessages((prev) => {
                    const updated = [...(prev[parentModel] ?? [])];
                    const loadingIndex = updated.findIndex((m) => m.loading);

                    if (loadingIndex !== -1) {
                        updated[loadingIndex] = {
                            role: "assistant",
                            content: aiResponse,
                            model,
                            loading: false,
                        };
                    } else {
                        // fallback if no loading msg found
                        updated.push({
                            role: "assistant",
                            content: aiResponse,
                            model,
                            loading: false,
                        });
                    }

                    return { ...prev, [parentModel]: updated };
                });
            } catch (err) {
                console.error(err);
                setMessages((prev) => ({
                    ...prev,
                    [parentModel]: [
                        ...(prev[parentModel] ?? []),
                        { role: "assistant", content: "⚠️ Error fetching response." },
                    ],
                }));
            }
        });
    };

    useEffect(() => {
        // Only save when messages change. 
        // We checking chatId exists to ensure valid save, but don't trigger ON chatId change.
        if (user && messages && chatId && Object.keys(messages).length > 0) {
            SaveMessages();
        }
    }, [messages, user])

    const SaveMessages = async () => {
        const docRef = doc(db, 'chatHistory', chatId)

        await setDoc(docRef, {
            chatId: chatId,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            messages: messages,
            lastUpdated: Date.now()
        })
    }

    const GetMessages = async (id) => {
        const currentId = id || chatId;
        if (!currentId) return;

        const docRef = doc(db, 'chatHistory', currentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Loaded messages:", docSnap.data());
            const docData = docSnap.data();
            setMessages(docData.messages)
        } else {
            setMessages({})
        }
    }

    return (
        <div className='relative min-h-screen pb-32'>
            {/* Page Content */}
            <div>
                <AiMultiModels />
            </div>
            {/* Fixed Chat Input */}
            <div className='fixed bottom-0 left-0 w-full flex justify-center px-4 pb-4'>
                <div className='w-full border rounded-xl shadow-md max-w-2xl p-4'>
                    <input type="text"
                        placeholder='Ask me anything...'
                        className='border-0 outline-none w-full'
                        value={userInput}
                        onChange={(event) => setUserInput(event.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <div className='mt-3 flex justify-between items-center'>
                        <Button className={''} variant={'ghost'} size={'icon'}>
                            <Paperclip className='h-5 w-5' />
                        </Button>

                        <div className='flex gap-3'>
                            <Button variant={'ghost'} size={'icon'}><Mic /></Button>
                            <Button size={'icon'} className={'bg-blue-500'} onClick={handleSend}><Send /></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatInputBox