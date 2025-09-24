import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, FolderOpen, Users, FileArchive, MessageSquare, Settings, LifeBuoy, Wand2
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const clientNavigationItems = [
  { title: "Dashboard", url: createPageUrl("ClientDashboard"), icon: LayoutDashboard },
  { title: "My Projects", url: createPageUrl("Projects"), icon: FolderOpen },
  { title: "Submit a Request", url: createPageUrl("ClientRequestForm"), icon: LifeBuoy },
  { title: "My Requests", url: createPageUrl("ClientIssues"), icon: MessageSquare },
  { title: "My Files", url: createPageUrl("FileManager"), icon: FileArchive },
  { title: "AI Assistant", url: createPageUrl("AIAssistant"), icon: Wand2 },
  { title: "My Profile", url: createPageUrl("Settings"), icon: Settings },
];

export default function ClientLayout({ user, children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <head>
        <link rel="icon" type="image/png" href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d2b6512b6ece2d5ede928f/b33c4a7fc_logo.png" />
        <title>QiEos - Client Portal</title>
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
                <p className="text-xs text-slate-500 font-medium">Client Portal</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {clientNavigationItems.map((item) => (
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
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                  <AvatarFallback>{user?.full_name ? user.full_name[0] : 'C'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{user?.full_name || 'Client'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'Not logged in'}</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
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