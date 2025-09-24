import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Clock,
  Users,
  MapPin
} from "lucide-react";

export default function ContactInformation({ client }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <User className="w-5 h-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Contact */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-blue-100 text-blue-800">Primary Contact</Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-600" />
              <div>
                <div className="font-semibold text-slate-900">{client.primary_contact_name}</div>
                <div className="text-sm text-slate-600">{client.primary_contact_role}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-600" />
              <a 
                href={`mailto:${client.primary_contact_email}`}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {client.primary_contact_email}
              </a>
            </div>
            {client.primary_contact_phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-600" />
                <a 
                  href={`tel:${client.primary_contact_phone}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {client.primary_contact_phone}
                </a>
              </div>
            )}
            {client.timezone && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-600" />
                <span className="text-slate-700">Timezone: {client.timezone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Contacts */}
        {client.secondary_contacts && client.secondary_contacts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-600" />
              <h4 className="font-semibold text-slate-800">Secondary Contacts</h4>
            </div>
            <div className="space-y-3">
              {client.secondary_contacts.map((contact, index) => (
                <div key={index} className="p-3 border border-slate-200 rounded-lg bg-white">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{contact.name}</div>
                      <div className="text-sm text-slate-600">{contact.role}</div>
                    </div>
                    <div className="space-y-1">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <a 
                            href={`mailto:${contact.email}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <a 
                            href={`tel:${contact.phone}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Business Hours */}
        {client.business_hours_start && client.business_hours_end && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h4 className="font-semibold text-amber-800">Business Hours</h4>
            </div>
            <div className="text-amber-700">
              {client.business_hours_start} - {client.business_hours_end}
              {client.timezone && (
                <span className="text-amber-600 ml-2">({client.timezone})</span>
              )}
            </div>
            {client.meeting_availability && client.meeting_availability.length > 0 && (
              <div className="mt-2">
                <div className="text-sm text-amber-600 mb-1">Available for meetings:</div>
                <div className="flex flex-wrap gap-1">
                  {client.meeting_availability.map((day) => (
                    <Badge key={day} variant="outline" className="text-amber-700 border-amber-300">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}