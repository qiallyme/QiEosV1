import React, { useState, useEffect, useCallback } from 'react';
import { ClientRequest, Client, Project, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LifeBuoy } from 'lucide-react';

export default function ClientRequestForm() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [urgency, setUrgency] = useState('medium');
    const [projectId, setProjectId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [client, setClient] = useState(null);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadClientData = useCallback(async () => {
        setIsLoading(true);
        try {
            const user = await User.me();
            const clientRecords = await Client.filter({ user_email: user.email });
            if (clientRecords.length > 0) {
                const currentClient = clientRecords[0];
                setClient(currentClient);
                const projectRecords = await Project.filter({ client_id: currentClient.id });
                setProjects(projectRecords || []);
            } else {
                toast.error("Could not find an associated client account.");
            }
        } catch (error) {
            console.error("Error loading client data:", error);
            toast.error("An error occurred while loading your data.");
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadClientData();
    }, [loadClientData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !client) {
            toast.warning("Please fill in a title for your request.");
            return;
        }
        setIsSubmitting(true);
        try {
            await ClientRequest.create({
                title,
                description,
                urgency,
                client_id: client.id,
                project_id: projectId || null,
            });
            toast.success("Your request has been submitted!");
            navigate(createPageUrl("ClientIssues"));
        } catch (error) {
            console.error("Error submitting request:", error);
            toast.error("Failed to submit your request. Please try again.");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-2xl mx-auto">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <LifeBuoy className="w-8 h-8 text-blue-600" />
                            <div>
                                <CardTitle className="text-2xl font-bold text-slate-900">Submit a New Request</CardTitle>
                                <CardDescription>Have a new idea or need something done? Let us know here.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p>Loading form...</p>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="title" className="font-medium">Request Title</label>
                                    <Input id="title" placeholder="e.g., 'Update homepage banner image'" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="description" className="font-medium">Description</label>
                                    <Textarea id="description" placeholder="Provide as much detail as possible about what you need." value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="urgency" className="font-medium">Urgency</label>
                                        <Select value={urgency} onValueChange={setUrgency}>
                                            <SelectTrigger id="urgency">
                                                <SelectValue placeholder="Select urgency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="project" className="font-medium">Related Project (Optional)</label>
                                        <Select value={projectId} onValueChange={setProjectId}>
                                            <SelectTrigger id="project">
                                                <SelectValue placeholder="Select a project" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={null}>None</SelectItem>
                                                {projects.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit Request"}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}