import React, { useState, useEffect, useCallback } from "react";
import { Project } from "@/api/entities";
import { Client } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus,
  FolderOpen,
  Calendar,
  DollarSign,
  Clock,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ProjectCard from "../components/projects/ProjectCard";
import ProjectFilters from "../components/projects/ProjectFilters";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    project_type: "all",
    client_id: "all"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
      }
    };
    initialize();
  }, []);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
        // RLS now handles filtering, so we can just list
        const [projectsData, clientsData] = await Promise.all([
            Project.list("-updated_date"),
            currentUser.role === 'admin' ? Client.list("-updated_date") : Client.filter({ user_email: currentUser.email })
        ]);
        setProjects(projectsData || []);
        setClients(clientsData || []);
    } catch (error) {
        console.error("Error loading data:", error);
        setProjects([]);
        setClients([]);
    } finally {
        setIsLoading(false);
    }
  }, [currentUser]);

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...projects];
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.project_type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filters.status !== "all") {
      filtered = filtered.filter(project => project.status === filters.status);
    }
    if (filters.priority !== "all") {
      filtered = filtered.filter(project => project.priority === filters.priority);
    }
    if (filters.project_type !== "all") {
      filtered = filtered.filter(project => project.project_type === filters.project_type);
    }
    if (filters.client_id !== "all") {
      filtered = filtered.filter(project => project.client_id === filters.client_id);
    }
    setFilteredProjects(filtered);
  }, [projects, searchQuery, filters]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    } else {
        setIsLoading(false);
    }
  }, [currentUser, loadData]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    planning: projects.filter(p => p.status === 'planning').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, project) => sum + (project.budget || 0), 0),
    totalHours: projects.reduce((sum, project) => sum + (project.estimated_hours || 0), 0)
  };

  if (isLoading) {
    return <div className="p-6 text-center text-lg text-slate-700">Loading projects...</div>;
  }

  if (!currentUser) {
    return <div className="p-6 text-center text-lg text-slate-700">Please log in to manage your projects.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projects</h1>
            <p className="text-slate-600 mt-1 font-medium">
                {currentUser.role === 'admin' ? "Manage and track all your projects" : "View your projects"}
            </p>
          </div>
          {currentUser.role === 'admin' && (
            <Link to={createPageUrl("ProjectWizard")}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                New Project
                </Button>
            </Link>
          )}
        </div>
        
        {currentUser.role === 'admin' && (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                   <FolderOpen className="w-5 h-5 text-blue-600" />
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                   <div className="text-sm text-slate-600">Total</div>
                 </div>
               </div>
             </div>
             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                   <Calendar className="w-5 h-5 text-emerald-600" />
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
                   <div className="text-sm text-slate-600">Active</div>
                 </div>
               </div>
             </div>
             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                   <Clock className="w-5 h-5 text-amber-600" />
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-slate-900">{stats.planning}</div>
                   <div className="text-sm text-slate-600">Planning</div>
                 </div>
               </div>
             </div>
             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                   <FolderOpen className="w-5 h-5 text-purple-600" />
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-slate-900">{stats.completed}</div>
                   <div className="text-sm text-slate-600">Done</div>
                 </div>
               </div>
             </div>
             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                   <DollarSign className="w-5 h-5 text-green-600" />
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-slate-900">${stats.totalBudget.toLocaleString()}</div>
                   <div className="text-sm text-slate-600">Budget</div>
                 </div>
               </div>
             </div>
             <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                   <Clock className="w-5 h-5 text-indigo-600" />
                 </div>
                 <div>
                   <div className="text-2xl font-bold text-slate-900">{stats.totalHours}h</div>
                   <div className="text-sm text-slate-600">Est. Hours</div>
                 </div>
               </div>
             </div>
           </div>
        )}
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white border-slate-200 focus:border-slate-400"
              />
            </div>
            <ProjectFilters 
              filters={filters}
              onFilterChange={setFilters}
              clients={clients}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Showing {filteredProjects.length} of {projects.length} projects
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} clients={clients} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No projects found</h3>
              <p className="text-slate-500 mb-6">
                {currentUser.role === 'admin' ? "Get started by creating your first project" : "You have not been assigned to any projects yet."}
              </p>
              {currentUser.role === 'admin' && (
                <Link to={createPageUrl("ProjectWizard")}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Project
                    </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}