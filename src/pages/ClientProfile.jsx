import React, { useState, useEffect, useCallback } from "react";
import { Client, ClientNote, Project, Invoice, ClientDocument } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ClientOverviewCard from "../components/profile/ClientOverviewCard";
import ContactInformation from "../components/profile/ContactInformation";
import CommunicationPreferences from "../components/profile/CommunicationPreferences";
import NotesSection from "../components/profile/NotesSection";
import DocumentsSection from "../components/profile/DocumentsSection";
import RelationshipTimeline from "../components/profile/RelationshipTimeline";
import ClientPermissions from "../components/profile/ClientPermissions";

export default function ClientProfile() {
  const [client, setClient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const clientId = window.location.pathname.split('/').pop();

  const loadData = useCallback(async () => {
    if (!clientId) {
      setError("No client ID provided.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const clientData = await Client.get(clientId);

      if (!clientData) {
        throw new Error("Client not found. They may have been deleted or you may not have permission to view them.");
      }
      
      setClient(clientData);

      const [notesData, projectsData, invoicesData, documentsData] = await Promise.all([
        ClientNote.filter({ client_id: clientId }, "-created_date"),
        Project.filter({ client_id: clientId }, "-created_date"),
        Invoice.filter({ client_id: clientId }, "-created_date"),
        ClientDocument.filter({ client_id: clientId }, "-created_date")
      ]);

      setNotes(notesData || []);
      setProjects(projectsData || []);
      setInvoices(invoicesData || []);
      setDocuments(documentsData || []);

    } catch (err) {
      console.error("Error loading client profile:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  if (isLoading) {
    return <div className="p-6 text-center">Loading client profile...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Client</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <Link to={createPageUrl("ClientList")}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Client List
          </Button>
        </Link>
      </div>
    );
  }

  if (!client) {
    return <div className="p-6 text-center">Client could not be found.</div>;
  }

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalRevenue: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    outstandingBalance: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + (i.total_amount - (i.paid_amount || 0)), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("ClientList")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{client.company_name}</h1>
            <p className="text-slate-600 mt-1 font-medium">Client relationship management dashboard</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ClientOverviewCard client={client} stats={stats} />
            <RelationshipTimeline projects={projects} notes={notes} />
          </div>
          <div className="space-y-6">
            <ContactInformation client={client} />
            <CommunicationPreferences client={client} />
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <NotesSection notes={notes} setNotes={setNotes} clientId={clientId} />
            </div>
            <div className="space-y-6">
              <DocumentsSection documents={documents} setDocuments={setDocuments} clientId={clientId} />
            </div>
        </div>
        
        <ClientPermissions client={client} onUpdate={loadData} />

      </div>
    </div>
  );
}