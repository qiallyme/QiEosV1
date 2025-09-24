import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, RefreshCw, Settings as SettingsIcon, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const generateRandomHex = (size) => {
    const array = new Uint8Array(size);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const AdminSettings = ({ user, onUpdate }) => {
    const [isCleaningUp, setIsCleaningUp] = useState(false);

    const generateNewApiKey = async () => {
        const newKey = generateRandomHex(24);
        try {
            const updatedUser = await User.updateMyUserData({ api_key: newKey });
            onUpdate(updatedUser);
            toast.success('New API Key Generated!');
        } catch (error) {
            toast.error('Failed to generate new API key.');
            console.error(error);
        }
    };
    
    const runClientCleanup = async () => {
        setIsCleaningUp(true);
        try {
            const { cleanupClients } = await import("@/api/functions");
            const response = await cleanupClients();
            
            if (response.data.success) {
                toast.success(`Cleanup completed! Deleted ${response.data.summary.successfully_deleted} clients.`);
            } else {
                toast.error('Cleanup failed: ' + response.data.error);
            }
        } catch (error) {
            toast.error("Error running cleanup: " + (error.message || String(error)));
        } finally {
            setIsCleaningUp(false);
        }
    };

    const copyApiKey = () => {
        if (user?.api_key) {
            navigator.clipboard.writeText(user.api_key);
            toast.success('API Key copied to clipboard!');
        }
    };

    return (
        <>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5" />
                        API Key for Integrations
                    </CardTitle>
                    <CardDescription>
                        Use this API key to connect external services like Zapier.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-key">Your API Key</Label>
                        <div className="flex gap-2">
                            <Input id="api-key" type="text" value={user?.api_key || ''} readOnly />
                            <Button variant="outline" size="icon" onClick={copyApiKey}><Copy className="w-4 h-4" /></Button>
                            <Button variant="outline" size="icon" onClick={generateNewApiKey}><RefreshCw className="w-4 h-4" /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 border-red-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                        <Trash2 className="w-5 h-5" />
                        Data Cleanup
                    </CardTitle>
                    <CardDescription>
                        Permanently delete client records where both company and contact name are "unknown". This action cannot be undone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={runClientCleanup} disabled={isCleaningUp}>
                        {isCleaningUp ? "Cleaning..." : "Clean Up Unknown Clients"}
                    </Button>
                </CardContent>
            </Card>
        </>
    );
};

const ClientSettings = ({ user, onUpdate }) => {
     const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        // Add other client-specific fields here, e.g., avatar_url
    });

    const handleUpdate = async () => {
        try {
            const updatedUser = await User.updateMyUserData(formData);
            onUpdate(updatedUser);
            toast.success('Profile updated!');
        } catch (error) {
            toast.error('Failed to update profile.');
        }
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} readOnly disabled />
                </div>
                <Button onClick={handleUpdate}>Update Profile</Button>
            </CardContent>
        </Card>
    );
};

export default function Settings() {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            setIsLoading(true);
            try {
                const user = await User.me();
                if (user?.role === 'admin' && !user.api_key) {
                    const newKey = generateRandomHex(24);
                    const updatedUser = await User.updateMyUserData({ api_key: newKey });
                    setCurrentUser(updatedUser);
                } else {
                    setCurrentUser(user);
                }
            } catch (e) {
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        initialize();
    }, []);
    
    if (isLoading) {
        return <div className="p-6">Loading settings...</div>;
    }
    
    if (!currentUser) {
        return <div className="p-6 text-center">Please log in to view settings.</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
                    <p className="text-slate-600 mt-1 font-medium">Manage your account and preferences</p>
                </div>
                
                {currentUser.role === 'admin' ? (
                    <AdminSettings user={currentUser} onUpdate={setCurrentUser} />
                ) : (
                    <ClientSettings user={currentUser} onUpdate={setCurrentUser} />
                )}
            </div>
        </div>
    );
}