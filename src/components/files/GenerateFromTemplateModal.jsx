
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { InvokeLLM } from '@/api/integrations';
import { ClientDocument, DocumentTemplate } from '@/api/entities';
import { X, Loader2, Wand2 } from 'lucide-react';

export default function GenerateFromTemplateModal({ onClose, onGenerationSuccess, clients, projects, initialClientId, initialProjectId }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(initialClientId || '');
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || '');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const allTemplates = await DocumentTemplate.list();
    setTemplates(allTemplates);
  };

  const handleGenerate = async () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    const client = clients.find(c => c.id === selectedClientId);
    const project = projects.find(p => p.id === selectedProjectId);

    if (!template || !client) {
      setError('Please select a template and a client.');
      return;
    }
    
    setIsGenerating(true);
    setError('');

    const prompt = `You are a professional document generation expert. Populate this business document template with the provided information using current industry standards and professional formatting.

Template: ${template.name} (${template.category})
Template Content:
---
${template.content}
---

Client Information:
- Company: ${client.company_name}
- Contact: ${client.primary_contact_name} (${client.primary_contact_email})
- Industry: ${client.industry || 'Not specified'}
- Phone: ${client.primary_contact_phone || 'Not provided'}

${project ? `Project Information:
- Title: ${project.title}
- Description: ${project.description}
- Budget: $${project.budget?.toLocaleString() || 'Not specified'}
- Timeline: ${project.estimated_hours || 'Not specified'} hours
- Type: ${project.project_type || 'Not specified'}` : ''}

Today's Date: ${new Date().toLocaleDateString()}

Research current professional document formatting standards and replace all placeholders with accurate, professionally formatted information. If data is missing, use appropriate professional language like "To be determined" or "As discussed".`;

    try {
      const response = await InvokeLLM({ 
        prompt,
        add_context_from_internet: true
      });
      setGeneratedContent(response);
    } catch (err) {
      console.error('Generation failed:', err);
      setError('Failed to generate document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent || !selectedClientId) {
        setError('Cannot save empty document. Please generate content first.');
        return;
    }
    setIsSaving(true);
    // This is a placeholder for creating a file from text content.
    // In a real scenario, this would involve a backend function to convert text to a PDF/DocX and then upload it.
    // For now, we'll save the content in the description and link to a dummy file.
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const dummyFile = new File([blob], `${templates.find(t => t.id === selectedTemplateId)?.name}.txt`);
    
    // This is a simplified flow. A real implementation would be more complex.
    const { file_url } = { file_url: "https://example.com/dummy.pdf" }; // Dummy URL
    
    const docData = {
        client_id: selectedClientId,
        project_id: selectedProjectId || null,
        document_name: `${templates.find(t => t.id === selectedTemplateId)?.name} for ${clients.find(c=>c.id === selectedClientId)?.company_name}`,
        document_type: templates.find(t => t.id === selectedTemplateId)?.category || 'other',
        file_url,
        description: `Generated from template. Content:\n\n${generatedContent}`,
        status: 'draft',
    };

    await ClientDocument.create(docData);
    onGenerationSuccess();
    onClose();
    setIsSaving(false);
  };

  const availableProjects = projects.filter(p => p.client_id === selectedClientId);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Document from Template</DialogTitle>
          <DialogDescription>Select a template, client, and project to automatically generate a new document.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="template">Template</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                <SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="client">Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="project">Project (Optional)</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={!selectedClientId}>
                <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  {availableProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating || !selectedTemplateId || !selectedClientId}>
            {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Wand2 className="mr-2 h-4 w-4" />Generate Content</>}
          </Button>

          {generatedContent && (
            <div>
              <Label>Generated Content (Editable)</Label>
              <Textarea 
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || !generatedContent}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
