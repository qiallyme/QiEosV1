import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  StickyNote, 
  Plus, 
  MessageSquare,
  Calendar,
  FileText,
  Star,
  Target,
  Trash2
} from "lucide-react";
import { ClientNote } from "@/api/entities";
import { format } from "date-fns";

const noteTypeIcons = {
  general: MessageSquare,
  meeting: Calendar,
  project: FileText,
  feedback: Star,
  milestone: Target
};

const noteTypeColors = {
  general: "bg-blue-100 text-blue-800",
  meeting: "bg-purple-100 text-purple-800",
  project: "bg-emerald-100 text-emerald-800",
  feedback: "bg-amber-100 text-amber-800",
  milestone: "bg-rose-100 text-rose-800"
};

export default function NotesSection({ clientId, notes, onNotesUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    note_type: "general",
    is_important: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ClientNote.create({
        ...newNote,
        client_id: clientId
      });
      setNewNote({ title: "", content: "", note_type: "general", is_important: false });
      setShowForm(false);
      onNotesUpdate();
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      await ClientNote.delete(noteId);
      onNotesUpdate();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <StickyNote className="w-5 h-5" />
            Notes ({notes.length})
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <div className="space-y-4">
              <Input
                placeholder="Note title"
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                required
              />
              <Textarea
                placeholder="Note content"
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                className="h-20"
                required
              />
              <div className="flex gap-3">
                <Select 
                  value={newNote.note_type} 
                  onValueChange={(value) => setNewNote({...newNote, note_type: value})}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="important"
                    checked={newNote.is_important}
                    onChange={(e) => setNewNote({...newNote, is_important: e.target.checked})}
                  />
                  <label htmlFor="important" className="text-sm text-slate-700">Important</label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                  Save Note
                </Button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {notes.length > 0 ? (
            notes.map((note) => {
              const IconComponent = noteTypeIcons[note.note_type] || MessageSquare;
              return (
                <div key={note.id} className="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h5 className="font-semibold text-slate-900">{note.title}</h5>
                      <Badge className={noteTypeColors[note.note_type]}>
                        <IconComponent className="w-3 h-3 mr-1" />
                        {note.note_type}
                      </Badge>
                      {note.is_important && (
                        <Badge className="bg-red-100 text-red-800">Important</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-slate-700 text-sm mb-2">{note.content}</p>
                  <div className="text-xs text-slate-500">
                    {format(new Date(note.created_date), 'MMM d, yyyy • h:mm a')}
                    {note.created_by && ` • ${note.created_by}`}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500">
              <StickyNote className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No notes yet. Add your first note to track important information.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}