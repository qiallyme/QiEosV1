import React, { useState, useEffect, useCallback } from "react";
import { Project, Task, Client, User, ClientRequest } from "@/api/entities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FolderOpen, CheckSquare, LifeBuoy, Plus } from "lucide-react";

export default function ClientDashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const loadData = useCallback(async (user) => {
    if (!user) return;
    setIsLoading(true);
    try {
        const [projectsData, tasksData, requestsData] = await Promise.all([
            Project.list(),
            Task.list(),
            ClientRequest.list()
        ]);
        setProjects(projectsData || []);
        setTasks(tasksData || []);
        setRequests(requestsData || []);
    } catch (error) {
        console.error("Error loading client dashboard data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        loadData(user);
      } catch (e) {
        setIsLoading(false);
      }
    };
    initialize();
  }, [loadData]);
  
  if (isLoading) {
    return <div className="p-6">Loading your dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome, {currentUser?.full_name}</h1>
            <p className="text-slate-600 mt-1 font-medium">Here's a summary of your projects and requests.</p>
          </div>
          <Link to={createPageUrl("ClientRequestForm")}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Submit a New Request
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Open Tasks</CardTitle>
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{tasks.filter(t => t.status !== 'completed' && t.assignee === currentUser?.email).length}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                    <LifeBuoy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{requests.filter(r => r.status === 'pending').length}</div>
                </CardContent>
            </Card>
        </div>
        
        {/* Placeholder for more widgets */}
        <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl">
            <h3 className="text-lg font-semibold text-slate-700">More widgets coming soon!</h3>
            <p className="text-slate-500">You'll soon be able to see project progress, recent files, and more.</p>
        </div>
      </div>
    </div>
  );
}