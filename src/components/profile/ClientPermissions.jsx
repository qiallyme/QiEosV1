import React, { useState, useEffect } from 'react';
import { Client } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const permissionItems = [
    { id: 'can_view_projects', label: 'View Projects', description: 'Allow client to see their associated projects.' },
    { id: 'can_view_tasks', label: 'View Tasks', description: 'Allow client to see tasks within their projects.' },
    { id: 'can_view_invoices', label: 'View Invoices', description: 'Allow client to see their invoices.' },
    { id: 'can_view_financials', label: 'View Financials', description: 'Allow client to see project budgets and financial summaries.' },
];

export default function ClientPermissions({ client, onUpdate }) {
    const [permissions, setPermissions] = useState(client.permissions || {});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Ensure all permissions have a default value
        const initialPermissions = permissionItems.reduce((acc, item) => {
            acc[item.id] = client.permissions?.[item.id] || false;
            return acc;
        }, {});
        setPermissions(initialPermissions);
    }, [client.permissions]);

    const handleToggle = (permissionId) => {
        setPermissions(prev => ({ ...prev, [permissionId]: !prev[permissionId] }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await Client.update(client.id, { permissions });
            toast.success("Permissions updated successfully!");
            if(onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update permissions:", error);
            toast.error("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
                <CardTitle>Client Portal Permissions</CardTitle>
                <CardDescription>
                    Control what this client can see and do when they log into the portal.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {permissionItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                            <div>
                                <Label htmlFor={item.id} className="font-medium text-slate-800">{item.label}</Label>
                                <p className="text-sm text-slate-500">{item.description}</p>
                            </div>
                            <Switch
                                id={item.id}
                                checked={permissions[item.id]}
                                onCheckedChange={() => handleToggle(item.id)}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}