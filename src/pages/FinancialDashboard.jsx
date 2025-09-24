import React, { useState, useEffect, useCallback } from 'react';
import { Invoice, Expense, TimeEntry, Project, User } from '@/api/entities';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

import QuickStats from '../components/financial/QuickStats';
import RevenueChart from '../components/financial/RevenueChart';
import ExpenseBreakdown from '../components/financial/ExpenseBreakdown';
import CashFlowForecast from '../components/financial/CashFlowForecast';
import FinancialGoalProgress from '../components/financial/FinancialGoalProgress';

export default function FinancialDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFinancialData = useCallback(async (user) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userFilter = { created_by: user.email };
      const [invoicesData, expensesData, timeData, projectsData] = await Promise.all([
        Invoice.filter(userFilter),
        Expense.filter(userFilter),
        TimeEntry.filter(userFilter),
        Project.filter(userFilter)
      ]);
      setInvoices(invoicesData || []);
      setExpenses(expensesData || []);
      setTimeEntries(timeData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error("Error loading financial data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        loadFinancialData(user);
      } catch (e) {
        setIsLoading(false);
      }
    };
    initialize();
  }, [loadFinancialData]);

  if (isLoading) {
    return <div className="p-6">Loading financial dashboard...</div>;
  }

  if (!currentUser) {
    return <div className="p-6 text-center">Please log in to view your financial dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Dashboard</h1>
            <p className="text-slate-600 mt-1 font-medium">Your business financial health at a glance</p>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats 
          invoices={invoices} 
          expenses={expenses} 
          timeEntries={timeEntries} 
          isLoading={isLoading} 
        />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart invoices={invoices} expenses={expenses} isLoading={isLoading} />
          </div>
          <div>
            <ExpenseBreakdown expenses={expenses} isLoading={isLoading} />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <CashFlowForecast invoices={invoices} expenses={expenses} isLoading={isLoading} />
          <FinancialGoalProgress projects={projects} invoices={invoices} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}