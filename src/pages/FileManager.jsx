import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Client } from '@/api/entities';
import { Project } from '@/api/entities';
import { ClientDocument } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Plus, Folder, File, Users, Home, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

import DocumentList from '../components/files/DocumentList';
import FileManagerHeader from '../components/files/FileManagerHeader';
import FileUploaderModal from '../components/files/FileUploaderModal';
import GenerateFromTemplateModal from '../components/files/GenerateFromTemplateModal';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function FileManager() {
  const query = useQuery();
  const clientId = query.get('client_id');
  const projectId = query.get('project_id');

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView] = useState('all');

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    handleSelectionChange();
  }, [clientId, projectId, clients, projects]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [clientsData, projectsData] = await Promise.all([
        Client.list('-updated_date'),
        Project.list('-updated_date')
      ]);
      setClients(clientsData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
      setClients([]);
      setProjects([]);
    }
  };

  const handleSelectionChange = () => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      const client = clients.find(c => c.id === project?.client_id);
      setSelectedProject(project);
      setSelectedClient(client);
      setView('project');
      loadDocuments(null, projectId);
    } else if (clientId) {
      const client = clients.find(c => c.id === clientId);
      setSelectedClient(client);
      setSelectedProject(null);
      setView('client');
      loadDocuments(clientId, null);
    } else {
      setSelectedClient(null);
      setSelectedProject(null);
      setView('all');
      loadDocuments();
    }
  };

  const loadDocuments = async (filterClientId = null, filterProjectId = null) => {
    setIsLoading(true);
    try {
      const allDocs = await ClientDocument.list('-updated_date');
      const filteredDocs = (allDocs || []).filter(doc => {
        if (filterProjectId) return doc.project_id === filterProjectId;
        if (filterClientId) return doc.client_id === filterClientId;
        return true;
      });
      setDocuments(filteredDocs);
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
    }
    setIsLoading(false);
  };
  
  const handleDocumentChange = () => {
      handleSelectionChange();
  };

  const Breadcrumbs = () => (
    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
      <Link to="/files" className="flex items-center gap-1 hover:text-slate-900">
        <Home className="w-4 h-4" />
        <span>All Files</span>
      </Link>
      {selectedClient && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to={`/files?client_id=${selectedClient.id}`} className="flex items-center gap-1 hover:text-slate-900">
            <Users className="w-4 h-4" />
            <span>{selectedClient.company_name}</span>
          </Link>
        </>
      )}
      {selectedProject && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link to={`/files?project_id=${selectedProject.id}`} className="flex items-center gap-1 hover:text-slate-900">
            <Folder className="w-4 h-4" />
            <span>{selectedProject.title}</span>
          </Link>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <FileManagerHeader 
          onUpload={() => setUploadModalOpen(true)} 
          onGenerate={() => setTemplateModalOpen(true)}
        />
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <div className="p-4 border-b border-slate-200/60">
            <Breadcrumbs />
          </div>
          <DocumentList
            documents={documents}
            clients={clients}
            projects={projects}
            isLoading={isLoading}
            onRefresh={handleDocumentChange}
          />
        </Card>

        {isUploadModalOpen && (
          <FileUploaderModal
            onClose={() => setUploadModalOpen(false)}
            onUploadSuccess={handleDocumentChange}
            clients={clients}
            projects={projects}
            initialClientId={clientId}
            initialProjectId={projectId}
          />
        )}
        
        {isTemplateModalOpen && (
            <GenerateFromTemplateModal
                onClose={() => setTemplateModalOpen(false)}
                onGenerationSuccess={handleDocumentChange}
                clients={clients}
                projects={projects}
                initialClientId={clientId}
                initialProjectId={projectId}
            />
        )}
      </div>
    </div>
  );
}