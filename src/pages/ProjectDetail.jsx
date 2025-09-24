
import React, { useState, useEffect, useCallback } from "react";
import { Project, Task, Client } from "@/api/entities";
import { User } from "@/api/entities";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ProjectDetailHeader from "../components/projects/ProjectDetailHeader";
import ProjectProgressCard from "../components/projects/ProjectProgressCard";
import ProjectFinancialsCard from "../components/projects/ProjectFinancialsCard";
import ProjectTasksList from "../components/projects/ProjectTasksList";
import ProjectAuditModal from "../components/projects/ProjectAuditModal";

export default function ProjectDetail() {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [error, setError] = useState(null);
  
  const projectId = window.location.pathname.split('/').pop();

  const loadProjectData = useCallback(async () => {
    if (!projectId) {
        setError("No project ID provided.");
        setIsLoading(false);
        return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
        const projectData = await Project.get(projectId);
        
        if (!projectData) {
            throw new Error("Project not found. It may have been deleted or you may not have permission to view it.");
        }
        
        setProject(projectData);

        const [clientData, tasksData] = await Promise.all([
            projectData.client_id ? Client.get(projectData.client_id) : Promise.resolve(null),
            Task.filter({ project_id: projectId }, "-created_date")
        ]);

        setClient(clientData);
        setTasks(tasksData || []);
    } catch (err) {
        console.error("Error loading project data:", err);
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  }, [projectId]);

  const handleCreateTasksFromSuggestions = useCallback(async (suggestions) => {
    if (!projectId || !suggestions || suggestions.length === 0) return;
    setIsCreatingTasks(true);
    const tasksToCreate = suggestions.map(s => ({
      ...s,
      project_id: projectId,
      status: 'todo',
    }));

    try {
      await Task.bulkCreate(tasksToCreate);
      toast.success(`${tasksToCreate.length} tasks created from AI suggestions!`);
      await loadProjectData(); // Reload data to show new tasks
    } catch (error) {
      console.error("Error creating tasks from suggestions:", error);
      toast.error("Failed to create AI-suggested tasks.");
    } finally {
      setIsCreatingTasks(false);
    }
  }, [projectId, loadProjectData]); // Added loadProjectData to dependencies
  
  useEffect(() => {
    const suggestionsJSON = sessionStorage.getItem(`taskSuggestions_${projectId}`);
    if (suggestionsJSON) {
      try {
        const suggestions = JSON.parse(suggestionsJSON);
        handleCreateTasksFromSuggestions(suggestions);
      } catch (e) {
        console.error("Error parsing task suggestions from sessionStorage", e);
      } finally {
        sessionStorage.removeItem(`taskSuggestions_${projectId}`);
      }
    }
  }, [projectId, handleCreateTasksFromSuggestions]); // Added handleCreateTasksFromSuggestions to dependencies

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  if (isLoading) {
    return <div className="p-6 text-center">Loading project details...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Project</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <Link to={createPageUrl("Projects")}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
        <div className="p-6 text-center">
            This project could not be found.
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectDetailHeader 
            project={project} 
            client={client} 
            onOpenAudit={() => setIsAuditModalOpen(true)} 
        />
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProjectTasksList 
                tasks={tasks} 
                onTaskUpdate={loadProjectData}
                projectId={projectId} 
                isCreatingTasks={isCreatingTasks}
            />
          </div>
          <div className="space-y-6">
            <ProjectProgressCard project={project} tasks={tasks} />
            <ProjectFinancialsCard project={project} />
          </div>
        </div>
      </div>
      
      {isAuditModalOpen && (
        <ProjectAuditModal
          project={project}
          onClose={() => setIsAuditModalOpen(false)}
        />
      )}
    </div>
  );
}
