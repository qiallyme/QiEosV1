import React, { useState, useEffect } from "react";
import { Project } from "@/api/entities";
import { Task } from "@/api/entities";
import { TimeEntry } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import LiveTimer from "../components/time-tracking/LiveTimer";
import ManualTimeEntryForm from "../components/time-tracking/ManualTimeEntryForm";
import RecentTimeEntries from "../components/time-tracking/RecentTimeEntries";
import TimeTrackingStats from "../components/time-tracking/TimeTrackingStats";

export default function TimeTracking() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, tasksData, timeEntriesData] = await Promise.all([
        Project.list("-updated_date"),
        Task.list("-updated_date"),
        TimeEntry.list("-start_time")
      ]);
      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setTimeEntries(timeEntriesData || []);
    } catch (error) {
      console.error("Error loading time tracking data:", error);
      setProjects([]);
      setTasks([]);
      setTimeEntries([]);
    }
    setIsLoading(false);
  };

  const handleTimeEntryCreate = async (entryData) => {
    try {
      await TimeEntry.create(entryData);
      loadData();
      setShowManualEntry(false);
    } catch (error) {
      console.error("Error creating time entry:", error);
    }
  };
  
  const handleTimeEntryUpdate = async (entryId, updates) => {
    try {
      await TimeEntry.update(entryId, updates);
      loadData();
    } catch (error) {
      console.error("Error updating time entry:", error);
    }
  };

  const handleTimeEntryDelete = async (entryId) => {
    try {
      await TimeEntry.delete(entryId);
      loadData();
    } catch (error) {
      console.error("Error deleting time entry:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Time Tracking</h1>
            <p className="text-slate-600 mt-1 font-medium">Track your work, gain insights, and improve productivity</p>
          </div>
          <Button onClick={() => setShowManualEntry(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Time Manually
          </Button>
        </div>

        {/* Top Section: Timer and Stats */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveTimer 
              projects={projects}
              tasks={tasks}
              onTimerStop={handleTimeEntryCreate}
              isLoading={isLoading}
            />
          </div>
          <TimeTrackingStats timeEntries={timeEntries} isLoading={isLoading} />
        </div>
        
        {/* Recent Entries */}
        <div>
          <RecentTimeEntries 
            timeEntries={timeEntries}
            projects={projects}
            tasks={tasks}
            onUpdate={handleTimeEntryUpdate}
            onDelete={handleTimeEntryDelete}
            isLoading={isLoading}
          />
        </div>
        
        {/* Manual Entry Modal */}
        {showManualEntry && (
          <ManualTimeEntryForm 
            projects={projects}
            tasks={tasks}
            onClose={() => setShowManualEntry(false)}
            onSubmit={handleTimeEntryCreate}
          />
        )}
      </div>
    </div>
  );
}