
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";

import AdminLayout from "./components/layout/AdminLayout";
import ClientLayout from "./components/layout/ClientLayout";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children, currentPageName }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
            } catch (e) {
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [children]); // Re-check user when page content changes

    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-slate-100">
                <p>Loading...</p>
            </div>
        );
    }
    
    // Render the appropriate layout based on user role
    const layout = currentUser?.role === 'admin' ? (
        <AdminLayout user={currentUser} currentPageName={currentPageName}>
            {children}
        </AdminLayout>
    ) : (
        <ClientLayout user={currentUser} currentPageName={currentPageName}>
            {children}
        </ClientLayout>
    );

    return (
        <>
            {layout}
            <Toaster position="bottom-right" richColors />
        </>
    );
}
