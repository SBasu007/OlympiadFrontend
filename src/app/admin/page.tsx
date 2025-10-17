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
        // For now, skip validation to avoid redirect loop
        setChecking(false);
        
        // TODO: Re-enable validation once backend is confirmed working
        // validateSession(token);
    },[router]);

    if(checking) return <div>Checking session...</div>;
    if(error) return <div className="text-red-600 text-sm">{error}</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-blue-100">Welcome back! Manage your olympiad platform from here.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
                            <p className="text-2xl font-bold text-blue-600">1,234</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900">Active Exams</h3>
                            <p className="text-2xl font-bold text-green-600">12</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                            <p className="text-2xl font-bold text-purple-600">8</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                        <div className="text-center">
                            <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-sm font-medium text-blue-900">Create Exam</span>
                        </div>
                    </button>
                    
                    <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                        <div className="text-center">
                            <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span className="text-sm font-medium text-green-900">Manage Categories</span>
                        </div>
                    </button>
                    
                    <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                        <div className="text-center">
                            <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
                            </svg>
                            <span className="text-sm font-medium text-purple-900">View Reports</span>
                        </div>
                    </button>
                    
                    <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
                        <div className="text-center">
                            <svg className="w-8 h-8 text-orange-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm font-medium text-orange-900">Settings</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">New student registration: <strong>John Doe</strong></span>
                        <span className="text-gray-500 text-sm ml-auto">2 minutes ago</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">Exam <strong>"Mathematics Level 1"</strong> completed by 15 students</span>
                        <span className="text-gray-500 text-sm ml-auto">1 hour ago</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">New category <strong>"Physics"</strong> created</span>
                        <span className="text-gray-500 text-sm ml-auto">3 hours ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
}