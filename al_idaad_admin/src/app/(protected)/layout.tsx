"use client";

import { useAuth } from "@/components/shared/AuthContext";
import Loading from "@/components/shared/Loading";
import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/shared/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/");
        }
    }, [loading, user, router]);

    if (!user) {
        return <Loading></Loading>;
    }

    return (
        <div>
            <div className="h-25 border-b border-border fixed top-0 left-80 right-0 z-100">
                <Navbar></Navbar>
            </div>
            <div className="h-screen w-80 bg-primary fixed left-0 top-0">
                <Sidebar></Sidebar>
            </div>
            <div className="mt-25 ml-80 h-[calc(100vh-100px)] overflow-hidden p-4">{children}</div>
        </div>
    );
};

export default AuthLayout;
