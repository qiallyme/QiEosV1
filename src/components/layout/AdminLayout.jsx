import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Project, Task, TimeEntry } from "@/api/entities";
import {
  LayoutDashboard, FolderOpen, CheckSquare, Users, Timer, Plus, BarChart2,
  Calendar, FileArchive, MessageSquare, TrendingUp, DollarSign, Briefcase,
  Monitor, Wand2, Settings, LifeBuoy
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Summary", url: createPageUrl("SummaryDashboard"), icon: Monitor },
  { title: "AI Assistant", url: createPageUrl("AIAssistant"), icon: Wand2 },
  { title: "Projects", url: createPageUrl("Projects"), icon: FolderOpen },
  { title: "Tasks", url: createPageUrl("Tasks"), icon: CheckSquare },
  { title: "Client Issues", url: createPageUrl("ClientIssues"), icon: LifeBuoy },
  { title: "Clients", url: createPageUrl("ClientList"), icon: Users },
  { title: "Communication", url: createPageUrl("CommunicationHub"), icon: MessageSquare },
  { title: "Time Tracking", url: createPageUrl("TimeTracking"), icon: Timer },
  { title: "Financials", url: createPageUrl("FinancialDashboard"), icon: DollarSign },
  { title: "Invoices", url: createPageUrl("Invoices"), icon: Briefcase },
  { title: "Analytics", url: createPageUrl("Analytics"), icon: BarChart2 },
  { title: "Reports", url: createPageUrl("Reports"), icon: TrendingUp },
  { title: "Calendar", url: createPageUrl("Calendar"), icon: Calendar },
  { title: "File Manager", url: createPageUrl("FileManager"), icon: FileArchive },
  { title: "Settings", url: createPageUrl("Settings"), icon: Settings },
];

const quickActions = [
  { title: "New Project", url: createPageUrl("ProjectWizard"), icon: Plus, color: "text-blue-600 bg-blue-100" },
  { title: "New Task", url: createPageUrl("Tasks"), icon: CheckSquare, color: "text-emerald-600 bg-emerald-100" },
  { title: "New Client", url: createPageUrl("ClientOnboarding"), icon: Users, color: "text-purple-600 bg-purple-100" }
];

export default function AdminLayout({ user, children, currentPageName }) {
  const location = useLocation();
  const [stats, setStats] = useState({ activeProjects: 0, dueToday: 0, hoursThisWeek: 0 });

  const loadInitialData = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
      const userFilter = { created_by: currentUser.email };
      const [projectsData, tasksData, timeData] = await Promise.all([
        Project.filter(userFilter),
        Task.filter(userFilter),
        TimeEntry.filter(userFilter)
      ]);

      const activeProjects = (projectsData || []).filter(p => p.status === 'active').length;
      const today = new Date().toDateString();
      const dueToday = (tasksData || []).filter(t => t.due_date && new Date(t.due_date).toDateString() === today && t.status !== 'completed').length;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const hoursThisWeek = (timeData || [])
        .filter(t => new Date(t.created_date) >= oneWeekAgo)
        .reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) / 60;

      setStats({ activeProjects, dueToday, hoursThisWeek: hoursThisWeek.toFixed(1) });
    } catch (error) {
      console.error("Error loading layout stats:", error);
    }
  }, []);

  useEffect(() => {
    loadInitialData(user);
  }, [loadInitialData, user, location.pathname]);

  return (
    <SidebarProvider>
      <head>
        <link rel="icon" type="image/png" href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d2b6512b6ece2d5ede928f/b33c4a7fc_logo.png" />
        <title>QiEos - Admin</title>
      </head>

      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar className="border-r border-slate-200/60 bg-white/90 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d2b6512b6ece2d5ede928f/44ff85035_logo.png"
                  alt="QiEos Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg tracking-tight">QiEos</h2>
                <p className="text-xs text-slate-500 font-medium">Intelligent Project Management</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-slate-100 hover:text-slate-900 transition-all duration-300 rounded-xl mb-1 ${
                          location.pathname === item.url
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-slate-900 shadow-sm border border-blue-100'
                            : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3 font-medium">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Quick Actions
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {quickActions.map((action) => (
                    <SidebarMenuItem key={action.title}>
                      <SidebarMenuButton asChild>
                        <Link to={action.url} className="flex items-center gap-3 px-4 py-3 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-300 rounded-xl">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                            <action.icon className="w-4 h-4" />
                          </div>
                          <span>{action.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                  <AvatarFallback>{user?.full_name ? user.full_name[0] : 'A'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{user?.full_name || 'Admin'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'Not logged in'}</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d2b6512b6ece2d5ede928f/44ff85035_logo.png"
                alt="QiEos"
                className="w-6 h-6 object-contain"
              />
              <h1 className="text-xl font-bold text-slate-900">{currentPageName}</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}