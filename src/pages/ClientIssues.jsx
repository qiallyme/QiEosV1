import React, { useState, useEffect, useCallback } from 'react';
import { ClientRequest, Task, Client, Project, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowRight, Check, X, Clock } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
    pending: "bg-amber-100 text-amber-800",
    in_review: "bg-blue-100 text-blue-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-slate-100 text-slate-800"
};

const urgencyColors = {
    low: "text-slate-600",
    medium: "text-blue-600",
    high: "text-red-600"
};

export default function ClientIssues() {
    const [requests, setRequests] = useState([]);
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const user = await User.me();
            setCurrentUser(user);
            
            const [requestData, clientData, projectData] = await Promise.all([
                ClientRequest.list('-created_date'),
                user.role === 'admin' ? Client.list() : Promise.resolve([]),
                user.role === 'admin' ? Project.list() : Promise.resolve([])
            ]);
            
            setRequests(requestData || []);
            setClients(clientData || []);
            setProjects(projectData || []);

        } catch (error) {
            console.error("Error loading client issues:", error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleApprove = async (request) => {
        try {
            const newTask = await Task.create({
                title: request.title,
                description: `Originating from client request: ${request.description}`,
                project_id: request.project_id || projects.find(p=>p.client_id === request.client_id)?.id, // A default project or handle
                status: 'todo',
                priority: request.urgency,
            });
            await ClientRequest.update(request.id, { status: 'approved', related_task_id: newTask.id });
            toast.success("Request approved and converted to task!");
            loadData();
        } catch (error) {
            toast.error("Failed to approve request.");
            console.error(error);
        }
    };
    
    const handleReject = async (requestId) => {
        try {
            await ClientRequest.update(requestId, { status: 'rejected' });
            toast.info("Request has been rejected.");
            loadData();
        } catch (error) {
            toast.error("Failed to reject request.");
        }
    };
    
    const getClientName = (clientId) => clients.find(c => c.id === clientId)?.company_name || 'Unknown Client';
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-4xl mx-auto">
                <CardHeader className="px-0">
                    <CardTitle className="text-3xl font-bold text-slate-900">Client Requests</CardTitle>
                    <CardDescription>
                        {currentUser?.role === 'admin' ? 'Review, approve, or reject incoming client requests.' : 'Track the status of your submitted requests.'}
                    </CardDescription>
                </CardHeader>
                
                <div className="space-y-4">
                    {isLoading && <p>Loading requests...</p>}
                    {!isLoading && requests.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-500">No requests found.</p>
                        </div>
                    )}
                    {requests.map(request => (
                        <Card key={request.id} className="bg-white/80 backdrop-blur-sm shadow-sm">
                            <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className={statusColors[request.status]}>{request.status.replace('_', ' ')}</Badge>
                                        {currentUser?.role === 'admin' && (
                                            <p className="text-sm font-medium">{getClientName(request.client_id)}</p>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-slate-800">{request.title}</h3>
                                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{request.description}</p>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Submitted on {format(new Date(request.created_date), 'MMM d, yyyy')}
                                        <span className={`ml-3 font-medium capitalize ${urgencyColors[request.urgency]}`}>
                                            {request.urgency} Urgency
                                        </span>
                                    </p>
                                </div>
                                {currentUser?.role === 'admin' && request.status === 'pending' && (
                                    <div className="flex gap-2 self-start md:self-center flex-shrink-0">
                                        <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}><X className="w-4 h-4 mr-2"/> Reject</Button>
                                        <Button size="sm" onClick={() => handleApprove(request)}><Check className="w-4 h-4 mr-2"/> Approve</Button>
                                    </div>
                                )}
                                {request.status === 'approved' && request.related_task_id && (
                                     <Button size="sm" variant="link" asChild>
                                        <a href="#">View Task <ArrowRight className="w-4 h-4 ml-2"/></a>
                                     </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}