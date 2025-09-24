import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Clock, 
  Zap,
  Mail,
  Phone,
  Video,
  Users,
  MessageCircle
} from "lucide-react";

const methodIcons = {
  email: Mail,
  phone: Phone,
  slack: MessageCircle,
  teams: Users,
  zoom: Video,
  in_person: Users
};

const methodLabels = {
  email: "Email",
  phone: "Phone Calls",
  slack: "Slack",
  teams: "Microsoft Teams", 
  zoom: "Zoom/Video Calls",
  in_person: "In-Person Meetings"
};

const frequencyLabels = {
  daily: "Daily Updates",
  weekly: "Weekly Check-ins",
  bi_weekly: "Bi-weekly Reviews",
  monthly: "Monthly Reports",
  as_needed: "As Needed"
};

const styleLabels = {
  formal: "Formal & Professional",
  casual: "Casual & Friendly",
  detailed: "Detailed & Comprehensive",
  brief: "Brief & Concise"
};

export default function CommunicationPreferences({ client }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <MessageSquare className="w-5 h-5" />
          Communication Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Communication Methods */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-slate-600" />
            <h4 className="font-semibold text-slate-800">Preferred Methods</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {client.communication_methods && client.communication_methods.length > 0 ? (
              client.communication_methods.map((method) => {
                const IconComponent = methodIcons[method] || MessageSquare;
                return (
                  <Badge key={method} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    <IconComponent className="w-3 h-3 mr-1" />
                    {methodLabels[method] || method}
                  </Badge>
                );
              })
            ) : (
              <span className="text-slate-500 text-sm">No preferences specified</span>
            )}
          </div>
        </div>

        {/* Communication Frequency */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <h4 className="font-semibold text-slate-800">Communication Frequency</h4>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800">
            {frequencyLabels[client.communication_frequency] || client.communication_frequency || "Not specified"}
          </Badge>
        </div>

        {/* Communication Style */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-600" />
            <h4 className="font-semibold text-slate-800">Communication Style</h4>
          </div>
          <Badge className="bg-purple-100 text-purple-800">
            {styleLabels[client.communication_style] || client.communication_style || "Not specified"}
          </Badge>
        </div>

        {/* Budget & Payment Info */}
        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div className="p-3 bg-slate-50 rounded-lg">
            <h5 className="font-medium text-slate-800 mb-1">Budget Range</h5>
            <div className="text-slate-700">
              {client.budget_range ? `$${client.budget_range.replace('k', ',000').replace('+', '+')}` : 'Not specified'}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <h5 className="font-medium text-slate-800 mb-1">Payment Terms</h5>
            <div className="text-slate-700">
              {client.payment_terms ? client.payment_terms.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}