import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { projectTaxonomy } from "./projectTaxonomy";

export default function ProjectBasicsForm({ data, clients, onChange, onNext }) {
    
    const handleClientChange = (clientId) => {
        const selectedClient = clients.find(c => c.id === clientId);
        onChange({ 
            client_id: clientId,
            client_user_email: selectedClient ? selectedClient.user_email : ""
        });
    };
    
    return (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
                <CardTitle>Project Basics</CardTitle>
                <CardDescription>Start by defining the core details of your new project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Project Title</label>
                    <Input 
                        placeholder="e.g., New E-commerce Website"
                        value={data.title}
                        onChange={(e) => onChange({ title: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Client</label>
                    <Select value={data.client_id} onValueChange={handleClientChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>
                                    {client.company_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Project Type</label>
                    <Select value={data.project_type} onValueChange={(value) => onChange({ project_type: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a project type" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(projectTaxonomy).map(([category, details]) => (
                                <div key={category}>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">{details.label}</div>
                                    {details.types.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </div>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Project Description</label>
                    <Textarea 
                        placeholder="Briefly describe the project goals and objectives."
                        value={data.description}
                        onChange={(e) => onChange({ description: e.target.value })}
                        className="h-24"
                    />
                </div>
                
                <div className="flex justify-end">
                    <Button onClick={onNext} disabled={!data.title || !data.client_id || !data.project_type}>
                        Next: Define Scope
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}