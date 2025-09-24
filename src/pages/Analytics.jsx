import React, { useState, useEffect } from 'react';
import { Project } from "@/api/entities";
import { Task } from "@/api/entities";
import { TimeEntry } from "@/api/entities";

import TimeDistributionChart from '../components/analytics/TimeDistributionChart';
import ProductivityHeatmap from '../components/analytics/ProductivityHeatmap';
import ProjectProfitability from '../components/analytics/ProjectProfitability';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, DollarSign, Clock } from 'lucide-react';

export default function Analytics() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, tasksData, timeEntriesData] = await Promise.all([
        Project.list(),
        Task.list(),
        TimeEntry.list()
      ]);
      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setTimeEntries(timeEntriesData || []);
    } catch (error) {
      console.error("Error loading analytics data:", error);
      setProjects([]);
      setTasks([]);
      setTimeEntries([]);
    }
    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
            <p className="text-slate-600 mt-1 font-medium">Deep dive into your productivity and profitability</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Clock className="w-5 h-5" />
                Time Distribution by Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimeDistributionChart 
                timeEntries={timeEntries} 
                projects={projects} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <BarChart2 className="w-5 h-5" />
                Productivity Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductivityHeatmap 
                timeEntries={timeEntries} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <DollarSign className="w-5 h-5" />
              Project Profitability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectProfitability
              projects={projects}
              timeEntries={timeEntries}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}