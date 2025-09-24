
import React, { useState, useEffect, useCallback } from 'react';
import { Invoice, Client, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

import InvoiceStats from '../components/invoices/InvoiceStats';
import InvoiceCard from '../components/invoices/InvoiceCard';
import InvoiceFilters from '../components/invoices/InvoiceFilters';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', client: 'all', dateRange: 'all_time' });
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvoiceData = useCallback(async (user) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userFilter = { created_by: user.email };
      const [invoicesData, clientsData] = await Promise.all([
        Invoice.filter(userFilter, "-issue_date"),
        Client.filter(userFilter)
      ]);
      setInvoices(invoicesData || []);
      setClients(clientsData || []);
      setFilteredInvoices(invoicesData || []);
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        loadInvoiceData(user);
      } catch (e) {
        setIsLoading(false);
      }
    };
    initialize();
  }, [loadInvoiceData]);
  
  const applyFilters = useCallback(() => {
    // Implement filtering logic based on state `filters`
    // This is a placeholder for brevity.
    setFilteredInvoices(invoices); 
  }, [invoices]);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  if (isLoading) {
    return <div className="p-6">Loading invoices...</div>;
  }
  
  if (!currentUser) {
    return <div className="p-6 text-center">Please log in to manage your invoices.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Invoices</h1>
            <p className="text-slate-600 mt-1 font-medium">Manage your billing and get paid faster</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to={createPageUrl("InvoiceCreator")}>
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Link>
            </Button>
          </div>
        </div>

        <InvoiceStats invoices={invoices} isLoading={isLoading} />
        
        <InvoiceFilters filters={filters} onFilterChange={setFilters} clients={clients} />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map(invoice => (
            <InvoiceCard key={invoice.id} invoice={invoice} client={clients.find(c => c.id === invoice.client_id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
