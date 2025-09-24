
import React, { useState, useEffect, useCallback } from "react";
import { Project } from "@/api/entities";
import { Task } from "@/api/entities";
import { TimeEntry } from "@/api/entities";
import { Client } from "@/api/entities";
import { User } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, CheckSquare, FolderOpen, Calendar, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

import DashboardStats from "../components/dashboard/DashboardStats";
import ActiveProjects from "../components/dashboard/ActiveProjects";
import TaskOverview from "../components/dashboard/TaskOverview";
import UpcomingDeadlines from "../components/dashboard/UpcomingDeadlines";
import TimeTrackingSummary from "../components/dashboard/TimeTrackingSummary";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const loadDashboardData = useCallback(async (user) => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (user.role === 'admin') {
        // Admin: Load all their data
        const userFilter = { created_by: user.email };
        const [projectsData, tasksData, timeData] = await Promise.all([
          Project.filter(userFilter),
          Task.filter(userFilter),
          TimeEntry.filter(userFilter)
        ]);
        setProjects(projectsData || []);
        setTasks(tasksData || []);
        setTimeEntries(timeData || []);
      } else {
        // Client user: Load data based on permissions
        const clientRecords = await Client.filter({ user_email: user.email });
        if (clientRecords.length === 0) {
          setIsLoading(false);
          return;
        }
        const client = clientRecords[0];
        const permissions = client.permissions || {};
        
        let projectsData = [];
        if (permissions.can_view_projects) {
            const allProjects = await Project.list();
            projectsData = allProjects.filter(p => p.client_id === client.id);
        }
        
        let tasksData = [];
        if (permissions.can_view_tasks && projectsData.length > 0) {
            const projectIds = projectsData.map(p => p.id);
            const allTasks = await Task.list();
            tasksData = allTasks.filter(t => projectIds.includes(t.project_id));
        }

        setProjects(projectsData);
        setTasks(tasksData);
        setTimeEntries([]); // Clients don't see time entries on the main dashboard
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setProjects([]);
      setTasks([]);
      setTimeEntries([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user.role !== 'admin') {
            // Redirect clients to their own dashboard
            window.location.href = createPageUrl("ClientDashboard");
            return;
        }
        loadDashboardData(user);
      } catch (e) {
        setIsLoading(false);
      }
    };
    initialize();
  }, [loadDashboardData]);

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }
  
  if (!currentUser) {
    return <div className="p-6 text-center">Please log in to view your dashboard.</div>;
  }
  
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    overdueTasks: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length,
    todaysTasks: tasks.filter(t => {
      if (!t.due_date) return false;
      const today = new Date().toDateString();
      return new Date(t.due_date).toDateString() === today;
    }).length,
    thisWeekHours: timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) / 60
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Dashboard</h1>
            <p className="text-slate-600 mt-1 font-medium">Manage your projects, tasks, and track your progress</p>
          </div>
          {currentUser.role === 'admin' && (
            <div className="flex gap-3">
              <Link to={createPageUrl("Tasks")}>
                <Button variant="outline" className="bg-white">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  View All Tasks
                </Button>
              </Link>
              <Link to={createPageUrl("ProjectWizard")}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStats title="Active Projects" value={`${stats.activeProjects} / ${stats.totalProjects}`} icon={FolderOpen} color="text-blue-500" trend={`${stats.totalProjects} total`} />
          <DashboardStats title="Tasks Progress" value={`${stats.completedTasks} / ${stats.totalTasks}`} icon={CheckSquare} color="text-emerald-500" trend={`${((stats.completedTasks / (stats.totalTasks || 1)) * 100).toFixed(0)}% complete`} />
          <DashboardStats title="Due Today" value={stats.todaysTasks} icon={Calendar} color="text-amber-500" trend={stats.overdueTasks > 0 ? `${stats.overdueTasks} overdue` : "On track"} isUrgent={stats.overdueTasks > 0} />
          {currentUser.role === 'admin' && (
            <DashboardStats title="This Week" value={`${stats.thisWeekHours.toFixed(1)}h`} icon={Timer} color="text-purple-500" trend="Hours logged" />
          )}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ActiveProjects projects={projects} isLoading={isLoading} />
            <TaskOverview tasks={tasks} isLoading={isLoading} />
          </div>
          <div className="space-y-6">
            <UpcomingDeadlines tasks={tasks} projects={projects} isLoading={isLoading} />
            {currentUser.role === 'admin' && (
                <TimeTrackingSummary timeEntries={timeEntries} isLoading={isLoading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
