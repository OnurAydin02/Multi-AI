"use client"
import React, { useContext, useState } from 'react'
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
import { MessageSquare, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AiSelectedModelConetxt } from '@/context/AiSelectedModelContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/FirebaseConfig';
import { useUser } from '@clerk/nextjs';

function AiMultiModels() {
  const { user } = useUser();
  const [aiModelList, setAiModelList] = useState(AiModelList);
  const { aiSelectedModels, setAiSelectedModels } = useContext(AiSelectedModelConetxt);

  const onToggleChange = (model, value) => {
    setAiModelList((prev) =>
      prev.map((m) => (m.model === model ? { ...m, enable: value } : m))
    );
  };

  // Select işlemi
  const onSelectValue = async (parentModel, value) => {
    setAiSelectedModels((prev) => ({
      ...prev,
      [parentModel]: {
        modelId: value,
      },
    }));

    // Firebase güncelle
    if (user?.primaryEmailAddress?.emailAddress) {
const docRef = doc(db, "users", user?.primaryEmailAddress?.emailAddress);
      await updateDoc(docRef, {
        selectedModelPref: {
          ...aiSelectedModels,
          [parentModel]: { modelId: value }
        }
      });
    }
  };

  return (
    <div className='flex flex-1 h-[75vh] border-b'>

      {aiModelList.map((model, index) => {
        const selectedModel = aiSelectedModels?.[model.model]?.modelId;

        return (
          <div
            key={index}
            className={`flex flex-col border-r h-full overflow-auto 
              ${model.enable ? 'flex-1 min-w-[400px]' : 'w-[100px] flex-none'}`}
          >
            {/* Header */}
            <div className='flex w-full h-[70px] items-center justify-between border-b p-4'>
              <div className='flex items-center gap-4'>
                <Image
                  src={model.icon}
                  alt={model.model}
                  width={24}
                  height={24}
                />

                {model.enable && (
                  <Select
                    defaultValue={selectedModel}
                    onValueChange={(value) =>
                      onSelectValue(model.model, value)
                    }
                    disabled={model.premium}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={selectedModel || "Choose model"} />
                    </SelectTrigger>

                    <SelectContent>
                      {/* Free Models */}
                      <div className='px-3 text-sm text-gray-400'>Free</div>
                      {model.subModel
                        .filter((x) => !x.premium)
                        .map((sub, idx) => (
                          <SelectItem key={idx} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}

                      {/* Premium */}
                      <div className='px-3 text-sm text-gray-400 mt-2'>Premium</div>
                      {model.subModel
                        .filter((x) => x.premium)
                        .map((sub, idx) => (
                          <SelectItem
                            key={idx}
                            value={sub.id}
                            disabled={true}
                          >
                            {sub.name} <Lock className='h-4 w-4 inline' />
                          </SelectItem>
                        ))}
                    </SelectContent>

                  </Select>
                )}
              </div>

              {/* Switch */}
              <div>
                {model.enable ? (
                  <Switch
                    checked={model.enable}
                    onCheckedChange={(v) => onToggleChange(model.model, v)}
                  />
                ) : (
                  <MessageSquare
                    onClick={() => onToggleChange(model.model, true)}
                    className="cursor-pointer"
                  />
                )}
              </div>
            </div>

            {/* Premium ekranı */}
            {model.premium && model.enable && (
              <div className='flex items-center justify-center h-full'>
                <Button>
                  <Lock /> Upgrade to unlock
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AiMultiModels;
