"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard(){
    const router = useRouter();
    const [checking,setChecking] = useState(true);
    const [error,setError] = useState<string|null>(null);

    useEffect(()=>{
        const token = sessionStorage.getItem("auth_token");
        if(!token){
            router.replace("/auth/admin");
            return;
        }
        setChecking(false);
    },[router]);

    if(checking) return <div>Checking session...</div>;
    if(error) return <div className="text-red-600 text-sm">{error}</div>;

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center space-y-6 max-w-2xl mx-auto px-6">
                {/* Animated Icon */}
                <div className="inline-block p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl animate-pulse">
                    <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                </div>

                {/* Welcome Message */}
                <div className="space-y-3">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Welcome to Dashboard
                    </h1>
                    <p className="text-xl text-gray-600">
                        Manage your Olympiad platform with ease
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="flex justify-center gap-2 mt-8">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
            </div>
        </div>
    );
}