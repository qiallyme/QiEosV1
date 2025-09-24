import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  UserPlus, 
  FileText, 
  MessageSquare,
  Star,
  Calendar,
  CheckCircle
} from "lucide-react";
import { ClientNote } from "@/api/entities";
import { format } from "date-fns";

const eventIcons = {
  client_created: UserPlus,
  note_added: MessageSquare,
  document_uploaded: FileText,
  meeting_scheduled: Calendar,
  milestone_reached: CheckCircle,
  feedback_received: Star
};

const eventColors = {
  client_created: "bg-emerald-100 text-emerald-800",
  note_added: "bg-blue-100 text-blue-800",
  document_uploaded: "bg-purple-100 text-purple-800",
  meeting_scheduled: "bg-amber-100 text-amber-800",
  milestone_reached: "bg-rose-100 text-rose-800",
  feedback_received: "bg-cyan-100 text-cyan-800"
};

export default function RelationshipTimeline({ clientId }) {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTimelineEvents();
  }, [clientId]);

  const loadTimelineEvents = async () => {
    setIsLoading(true);
    try {
      const notes = await ClientNote.filter({ client_id: clientId }, "-created_date", 10);
      
      // Transform notes into timeline events
      const events = notes.map(note => ({
        id: note.id,
        type: `note_${note.note_type}`,
        title: note.title,
        description: note.content,
        date: note.created_date,
        created_by: note.created_by,
        is_important: note.is_important
      }));

      // Add client creation event (mock data for now)
      events.push({
        id: 'client_created',
        type: 'client_created',
        title: 'Client Profile Created',
        description: 'Client was successfully onboarded to the system',
        date: new Date().toISOString(), // This would be the actual client creation date
        created_by: 'System',
        is_important: true
      });

      // Sort by date (newest first)
      events.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setTimelineEvents(events);
    } catch (error) {
      console.error("Error loading timeline events:", error);
    }
    setIsLoading(false);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Clock className="w-5 h-5" />
          Relationship Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {timelineEvents.length > 0 ? (
              timelineEvents.map((event, index) => {
                const IconComponent = eventIcons[event.type.split('_')[0]] || MessageSquare;
                return (
                  <div key={event.id} className="relative flex gap-4">
                    {/* Timeline line */}
                    {index < timelineEvents.length - 1 && (
                      <div className="absolute left-5 top-12 w-0.5 h-8 bg-slate-200"></div>
                    )}
                    
                    {/* Event icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      eventColors.note_added
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    {/* Event content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{event.title}</h4>
                        {event.is_important && (
                          <Badge className="bg-red-100 text-red-800 text-xs">Important</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{format(new Date(event.date), 'MMM d, yyyy • h:mm a')}</span>
                        {event.created_by && (
                          <>
                            <span>•</span>
                            <span>{event.created_by}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No timeline events yet. Activity will appear here as you interact with this client.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}