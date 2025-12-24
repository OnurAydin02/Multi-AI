"use client"
import React, { useContext, useState, useEffect } from 'react'
import AiModelList from '@/shared/AiModelList';
import Image from "next/image";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Lock, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectGroup, SelectLabel } from '@radix-ui/react-select';
import { AiSelectedModelConetxt } from '@/context/AiSelectedModelContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/FirebaseConfig';
import { useUser } from '@clerk/nextjs';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '@clerk/nextjs';

function AiMultiModels() {
    const { user } = useUser();
    const [aiModelList, setAiModelList] = useState(AiModelList)
    const { aiSelectedModels, setAiSelectedModels, messages, setMessages } = useContext(AiSelectedModelConetxt);
    const { has, isLoaded } = useAuth();
    const paidUser = isLoaded && has ? has({ plan: 'unlimited_plan' }) : false;


    useEffect(() => {
        if (aiSelectedModels) {
            setAiModelList(prev => prev.map(model => ({
                ...model,
                enable: aiSelectedModels[model.model]?.enable ?? model.enable
            })))
        }
    }, [aiSelectedModels])

    const onToggleChange = (modelName, value) => {
        setAiModelList((prev) =>
            prev.map((m) =>
                m.model === modelName ? { ...m, enable: value } : m))

        setAiSelectedModels((prev) => {
            const currentModelData = prev?.[modelName] || {};
            const updatedModelData = {
                ...currentModelData,
                enable: value
            };

            // If enabling and no modelId exists, find default from AiModelList
            if (value && !updatedModelData.modelId) {
                const modelConfig = AiModelList.find(m => m.model === modelName);
                if (modelConfig && modelConfig.subModel && modelConfig.subModel.length > 0) {
                    updatedModelData.modelId = modelConfig.subModel[0].id;
                }
            }

            return {
                ...prev,
                [modelName]: updatedModelData
            };
        });
    }


    console.log(aiSelectedModels)

    const onSelecteValue = async (parentModel, value) => {
        setAiSelectedModels(prev => ({
            ...prev,
            [parentModel]: {
                ...(prev?.[parentModel] ?? {}),
                modelId: value
            }
        }))
    }

    return (
        <div className='flex flex-row flex-1 h-[75vh] border-b overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar'>
            {aiModelList.map((model, index) => (
                <div key={index} className={`flex flex-col border-r h-full
         overflow-y-auto snap-center
         ${model.enable ? 'min-w-full md:min-w-[400px] flex-1' : 'min-w-[60px] md:min-w-[100px] flex-none'}`}>
                    <div className='flex w-full h-[70px] items-center justify-between border-b p-4'>
                        <div className='flex items-center gap-4'>
                            <Image src={model.icon} alt={model.model}
                                width={24} height={24}
                            />

                            {model.enable && <Select
                                defaultValue={(!paidUser && model.premium) ? "" : (aiSelectedModels[model.model]?.modelId || model.subModel[0].id)}
                                onValueChange={(value) => onSelecteValue(model.model, value)}
                                disabled={model.premium && !paidUser}
                            >
                                <SelectTrigger className="w-[130px] md:w-[180px]">
                                    <SelectValue className='truncate' placeholder={(!paidUser && model.premium) ? "" : (aiSelectedModels[model.model]?.modelId || model.subModel[0].name)} />
                                </SelectTrigger>
                                <SelectContent>
                                    {model.subModel.some(sm => sm.premium == false) && (
                                        <SelectGroup className='px-3'>
                                            <SelectLabel className='text-sm text-gray-400'>Free</SelectLabel>
                                            {model.subModel.map((subModel, index) => subModel.premium == false && (
                                                <SelectItem key={index} value={subModel.id}>
                                                    {subModel.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    )}

                                    {model.subModel.some(sm => sm.premium == true) && (
                                        <SelectGroup className='px-3'>
                                            <SelectLabel className='text-sm text-gray-400'>Premium</SelectLabel>
                                            {model.subModel.map((subModel, index) => subModel.premium == true && (
                                                <SelectItem key={index} value={subModel.id} disabled={!paidUser} >
                                                    <div className="flex items-center gap-2">
                                                        {subModel.name} {(!paidUser) && <Lock className='h-4 w-4 text-gray-400' />}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    )}
                                </SelectContent>
                            </Select>}
                        </div>
                        <div>
                            {model.enable ? <Switch checked={model.enable} disabled={!paidUser && model.premium}
                                onCheckedChange={(v) => onToggleChange(model.model, v)}
                            /> : <MessageSquare onClick={() => onToggleChange(model.model, true)} />}
                        </div>
                    </div>

                    {isLoaded && !paidUser && model.premium && model.enable && <div className='flex items-center justify-center h-full'>
                        <Button> <Lock /> Upgrade to unlock</Button>
                    </div>}

                    {model.enable && (!model.premium || paidUser || !isLoaded) && <div className='flex-1 p-4'>
                        <div className='flex-1 p-4 space-y-2'>
                            {messages[model.model]?.map((m, i) => (
                                <div
                                    key={i}
                                    className={`p-2 rounded-md ${m.role === "user" ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-900"}`}
                                >
                                    {m.role === "assistant" && (
                                        <span className='text-sm text-gray-400'>{m.model ?? model.model}</span>
                                    )}
                                    {m.content === "loading..." && (
                                        <div className='flex items-center gap-2'>
                                            <Loader className='animate-spin h-4 w-4' />
                                            <span>Thinking...</span>
                                        </div>
                                    )}
                                    {m.content !== "loading..." &&
                                        <div className='text-sm leading-7'>
                                            <Markdown remarkPlugins={[remarkGfm]}>
                                                {m.content}
                                            </Markdown>
                                        </div>
                                    }
                                </div>
                            ))}
                        </div>
                    </div>}

                </div>
            ))}
        </div>
    )
}

export default AiMultiModels