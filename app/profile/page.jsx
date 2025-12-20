"use client"
import React, { useContext, useEffect, useState } from 'react'
import { useUser, useClerk, UserProfile } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Moon, Sun, User2, Zap, ArrowLeft, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { AiSelectedModelConetxt } from '@/context/AiSelectedModelContext'
import AiModelList from '@/shared/AiModelList'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, CreditCard, Mail, Globe, CheckCircle2, MoreHorizontal } from 'lucide-react';
import PricingModal from '../_components/PricingModal';
import axios from 'axios';

function ProfilePage() {
    const { user, isLoaded: userLoaded } = useUser();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { aiSelectedModels, setAiSelectedModels } = useContext(AiSelectedModelConetxt);
    const [fullName, setFullName] = useState("");
    const [updating, setUpdating] = useState(false);
    const { has, isLoaded: authLoaded } = useAuth();
    const paidUser = authLoaded && has ? has({ plan: 'unlimited_plan' }) : false;
    const [freeMsgCount, setFreeMsgCount] = useState(0);
    const [activeTab, setActiveTab] = useState("Profile");
    const { messages } = useContext(AiSelectedModelConetxt);

    useEffect(() => {
        GetRemainingTokenMsgs();
    }, [messages]);

    const GetRemainingTokenMsgs = async () => {
        try {
            const result = await axios.post('/api/user-remaining-msg', {});
            setFreeMsgCount(result?.data?.remainingToken);
        } catch (error) {
            console.error("Error fetching tokens:", error);
        }
    }

    useEffect(() => {
        setMounted(true);
        if (user) {
            setFullName(user.fullName || "");
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        if (!user) return;
        setUpdating(true);
        try {
            await user.update({
                firstName: fullName.split(' ')[0] || "",
                lastName: fullName.split(' ').slice(1).join(' ') || ""
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile.");
        } finally {
            setUpdating(false);
        }
    }

    const onToggleChange = (modelName, value) => {
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
        toast.success(`${modelName} ${value ? 'enabled' : 'disabled'}`);
    }

    if (!mounted || !userLoaded) return null;

    return (
        <div className="min-h-screen bg-transparent p-6 md:p-12 lg:p-20 flex justify-center">
            <div className="max-w-3xl w-full space-y-10">

                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
                            <ArrowLeft className="w-4 h-4" /> Back to Chat
                        </Link>
                        <h1 className="text-4xl font-bold">Profile Settings</h1>
                        <p className="text-gray-500 text-lg">Manage your profile information and AI model preferences.</p>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="rounded-xl"
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Profile Information Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-8">
                    <div>
                        <h2 className="text-xl font-bold">Profile information</h2>
                        <p className="text-gray-400 text-sm">Manage your basic profile details.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
                            <Input
                                value={user?.primaryEmailAddress?.emailAddress || ""}
                                readOnly
                                className="bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 h-12 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full name</label>
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                className="h-12 border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <Button
                            className="w-full h-12 rounded-xl bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black font-bold text-lg transition-all"
                            onClick={handleUpdateProfile}
                            disabled={updating}
                        >
                            {updating ? <Loader2 className="animate-spin mr-2" /> : null}
                            Update profile
                        </Button>
                    </div>
                </div>

                {/* AI Preferences Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-8">
                    <div>
                        <h2 className="text-xl font-bold">Customize your chat AI model preferences</h2>
                        <p className="text-gray-400 text-sm">Easily update your selections anytime in the settings</p>
                    </div>

                    <div className="space-y-4">
                        {AiModelList.map((model, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-2 shadow-sm">
                                        <Image src={model.icon} alt={model.model} width={24} height={24} className="object-contain" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            {model.model}
                                            {model.premium && <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                        </h3>
                                        {model.premium && !paidUser && (
                                            <p className="text-xs text-yellow-600 font-medium">Premium Only</p>
                                        )}
                                    </div>
                                </div>
                                <Switch
                                    checked={aiSelectedModels?.[model.model]?.enable ?? false}
                                    onCheckedChange={(checked) => onToggleChange(model.model, checked)}
                                    disabled={model.premium && !paidUser}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Subscription Information Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-8">
                    <div>
                        <h2 className="text-xl font-bold">Subscription information</h2>
                        <p className="text-gray-400 text-sm">Manage your billing and view your current plan usage.</p>
                    </div>

                    {!paidUser ? (
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl p-6 space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-bold text-red-900 dark:text-red-400 text-lg">Free Plan</h3>
                                <p className="text-red-700/70 dark:text-red-400/60 font-medium">
                                    {5 - freeMsgCount}/5 message Used
                                </p>
                                <Progress
                                    value={((5 - freeMsgCount) / 5) * 100}
                                    className="h-2 bg-red-100 dark:bg-red-900/30"
                                    indicatorClassName="bg-red-500"
                                />
                            </div>
                            <PricingModal>
                                <Button className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold border-none transition-all">
                                    Upgrade for unlimited messages
                                </Button>
                            </PricingModal>
                        </div>
                    ) : (
                        <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 rounded-2xl p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                                    <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-green-900 dark:text-green-400 text-lg">Unlimited Plan</h3>
                                    <p className="text-green-700/70 dark:text-green-400/60">Your subscription is active</p>
                                </div>
                            </div>
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                    )}
                    <p className="text-xs text-gray-400 text-center italic">
                        Tips: Try not to use every AI model for smaller queries - this helps conserve tokens and ensures more meaningful results.
                    </p>
                </div>

                {/* Clerk UserProfile Section */}
                <div className="w-full">
                    <UserProfile
                        routing="hash"
                        appearance={{
                            elements: {
                                rootBox: "w-full shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden",
                                card: "w-full bg-white dark:bg-gray-900 border-none shadow-none",
                                navbar: "bg-gray-50/50 dark:bg-gray-800/20 border-r border-gray-100 dark:border-gray-800",
                                pageScrollBox: "p-8",
                                navbarItem: "rounded-xl font-medium",
                                headerTitle: "text-2xl font-bold",
                                headerSubtitle: "text-gray-400",
                                profileSectionPrimaryButton: "text-blue-600 hover:text-blue-700 font-medium",
                                badge: "bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full",
                                formButtonPrimary: "bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black rounded-xl h-10",
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default ProfilePage
