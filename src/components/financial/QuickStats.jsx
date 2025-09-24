import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  PieChart,
  Target,
  CreditCard
} from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

export default function QuickStats({ metrics, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50">
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "This Month Revenue",
      value: `$${metrics.thisMonthRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-100 text-emerald-600",
      trend: metrics.revenueGrowth > 0 ? `+${metrics.revenueGrowth.toFixed(1)}%` : `${metrics.revenueGrowth.toFixed(1)}%`,
      trendPositive: metrics.revenueGrowth >= 0
    },
    {
      title: "Outstanding",
      value: `$${metrics.outstandingAmount.toLocaleString()}`,
      icon: AlertTriangle,
      color: "bg-amber-100 text-amber-600"
    },
    {
      title: "This Month Expenses",
      value: `$${metrics.thisMonthExpenses.toLocaleString()}`,
      icon: CreditCard,
      color: "bg-red-100 text-red-600"
    },
    {
      title: "Net Profit",
      value: `$${metrics.thisMonthProfit.toLocaleString()}`,
      icon: Target,
      color: metrics.thisMonthProfit >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
    },
    {
      title: "Profit Margin",
      value: `${metrics.profitMargin.toFixed(1)}%`,
      icon: PieChart,
      color: metrics.profitMargin >= 20 ? "bg-emerald-100 text-emerald-600" : 
            metrics.profitMargin >= 10 ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
    },
    {
      title: "Overdue Invoices",
      value: metrics.overdueCount.toString(),
      icon: AlertTriangle,
      color: metrics.overdueCount === 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold text-slate-900 truncate">{stat.value}</div>
                <div className="text-xs text-slate-600">{stat.title}</div>
                {stat.trend && (
                  <div className={`text-xs font-medium ${stat.trendPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stat.trend} vs last month
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}