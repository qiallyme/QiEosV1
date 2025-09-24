import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Star, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Globe,
  Users,
  Target
} from "lucide-react";
import { format } from "date-fns";

export default function ClientOverviewCard({ client }) {
  const tierConfig = {
    A: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '👑' },
    B: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '⭐' },
    C: { color: 'bg-slate-100 text-slate-800 border-slate-200', icon: '🌱' }
  };

  const statusConfig = {
    active: { color: 'bg-emerald-100 text-emerald-800', label: 'Active Partnership' },
    inactive: { color: 'bg-slate-100 text-slate-800', label: 'Inactive' },
    prospect: { color: 'bg-blue-100 text-blue-800', label: 'Prospect' },
    archived: { color: 'bg-amber-100 text-amber-800', label: 'Archived' }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${
              client.client_tier === 'A' ? 'bg-emerald-100' :
              client.client_tier === 'B' ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              {tierConfig[client.client_tier]?.icon}
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">{client.company_name}</CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={tierConfig[client.client_tier]?.color}>
                  Tier {client.client_tier} Client
                </Badge>
                <Badge variant="outline" className={statusConfig[client.relationship_status]?.color}>
                  {statusConfig[client.relationship_status]?.label}
                </Badge>
              </div>
            </div>
          </div>
          {client.website && (
            <a 
              href={client.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Globe className="w-5 h-5" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-slate-600 mb-1">Industry</div>
            <div className="font-semibold text-slate-900">{client.industry}</div>
            <div className="text-xs text-slate-500 mt-1">{client.company_size} company</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-slate-600 mb-1">Satisfaction</div>
            <div className="font-semibold text-slate-900">{client.satisfaction_score || 0}/10</div>
            <div className="text-xs text-slate-500 mt-1">Client rating</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-slate-600 mb-1">Total Revenue</div>
            <div className="font-semibold text-slate-900">${(client.total_revenue || 0).toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">{client.total_projects || 0} projects</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-slate-600 mb-1">Client Since</div>
            <div className="font-semibold text-slate-900">
              {format(new Date(client.created_date), 'MMM yyyy')}
            </div>
            <div className="text-xs text-slate-500 mt-1">Partnership started</div>
          </div>
        </div>

        {client.notes && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Important Notes
            </h4>
            <p className="text-slate-700 text-sm leading-relaxed">{client.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}