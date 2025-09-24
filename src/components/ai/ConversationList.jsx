import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Clock,
  Trash2,
  Archive
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ConversationList({ conversations, onSelect, selectedId, agentType }) {
  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, HH:mm');
    } catch {
      return 'Unknown';
    }
  };

  const getLastMessage = (conversation) => {
    const messages = conversation.messages || [];
    if (messages.length === 0) return 'No messages yet';
    
    const lastMessage = messages[messages.length - 1];
    const preview = lastMessage.content?.substring(0, 60) || 'No content';
    return preview + (lastMessage.content?.length > 60 ? '...' : '');
  };

  const getMessageCount = (conversation) => {
    return (conversation.messages || []).length;
  };

  const agentColors = {
    admin: 'border-blue-200 hover:border-blue-300',
    client: 'border-green-200 hover:border-green-300'
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-900 text-base">
          <MessageSquare className="w-4 h-4" />
          Conversations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-6">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-500">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  "p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-slate-50",
                  selectedId === conversation.id 
                    ? `border-${agentType === 'admin' ? 'blue' : 'green'}-400 bg-${agentType === 'admin' ? 'blue' : 'green'}-50` 
                    : agentColors[agentType] || agentColors.admin
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-slate-900 truncate">
                      {conversation.metadata?.name || `${agentType} Conversation`}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {formatTime(conversation.updated_date)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getMessageCount(conversation)} msgs
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {getLastMessage(conversation)}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}