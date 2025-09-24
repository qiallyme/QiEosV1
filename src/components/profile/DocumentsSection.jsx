
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Plus, 
  Upload,
  ExternalLink,
  Trash2,
  File,
  FileSignature // Corrected icon
} from "lucide-react";
import { ClientDocument } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { format } from "date-fns";

const documentTypeIcons = {
  contract: FileSignature, // Corrected icon
  agreement: FileSignature, // Corrected icon
  proposal: FileText,
  invoice: FileText,
  other: File
};

const documentTypeColors = {
  contract: "bg-emerald-100 text-emerald-800",
  agreement: "bg-blue-100 text-blue-800",
  proposal: "bg-purple-100 text-purple-800",
  invoice: "bg-amber-100 text-amber-800",
  other: "bg-slate-100 text-slate-800"
};

export default function DocumentsSection({ clientId, documents, onDocumentsUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newDocument, setNewDocument] = useState({
    document_name: "",
    document_type: "other",
    description: "",
    file_url: ""
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setNewDocument({
        ...newDocument,
        file_url,
        document_name: newDocument.document_name || file.name
      });
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDocument.file_url) return;

    try {
      await ClientDocument.create({
        ...newDocument,
        client_id: clientId
      });
      setNewDocument({ document_name: "", document_type: "other", description: "", file_url: "" });
      setShowForm(false);
      onDocumentsUpdate();
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await ClientDocument.delete(documentId);
      onDocumentsUpdate();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5" />
            Documents ({documents.length})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <div className="space-y-4">
              <Input
                placeholder="Document name"
                value={newDocument.document_name}
                onChange={(e) => setNewDocument({...newDocument, document_name: e.target.value})}
                required
              />
              
              <Select 
                value={newDocument.document_type} 
                onValueChange={(value) => setNewDocument({...newDocument, document_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="agreement">Agreement</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Description (optional)"
                value={newDocument.description}
                onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                  disabled={uploading}
                />
                {uploading && (
                  <div className="text-sm text-slate-600">Uploading...</div>
                )}
                {newDocument.file_url && (
                  <div className="text-sm text-emerald-600">✓ File uploaded successfully</div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-slate-900 hover:bg-slate-800"
                  disabled={!newDocument.file_url}
                >
                  Save Document
                </Button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {documents.length > 0 ? (
            documents.map((document) => {
              const IconComponent = documentTypeIcons[document.document_type] || FileText;
              return (
                <div key={document.id} className="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        documentTypeColors[document.document_type]
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-slate-900">{document.document_name}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={documentTypeColors[document.document_type]}>
                            {document.document_type}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {format(new Date(document.created_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={document.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(document.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {document.description && (
                    <p className="text-slate-600 text-sm">{document.description}</p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No documents uploaded yet. Add contracts, agreements, or other important files.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
