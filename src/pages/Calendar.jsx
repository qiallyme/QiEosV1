import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { Project } from "@/api/entities";
import { Task } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  add,
} from "date-fns";

import CalendarHeader from "../components/calendar/CalendarHeader";
import CalendarView from "../components/calendar/CalendarView";
import EventModal from "../components/calendar/EventModal";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadData();
  }, [currentDate, view]);

  const getInterval = () => {
    switch (view) {
      case "month":
        return {
          start: startOfWeek(startOfMonth(currentDate)),
          end: endOfWeek(endOfMonth(currentDate)),
        };
      case "week":
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate),
        };
      case "day":
        return {
          start: currentDate,
          end: currentDate,
        };
      default:
        return { start: new Date(), end: new Date() };
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    const interval = getInterval();
    try {
      const [eventData, projectData, taskData] = await Promise.all([
        Event.list("-start_time"),
        Project.list("-due_date"),
        Task.list("-due_date"),
      ]);
      setEvents(eventData || []);
      setProjects(projectData || []);
      setTasks(taskData || []);
    } catch (error) {
      console.error("Error loading calendar data:", error);
      setEvents([]);
      setProjects([]);
      setTasks([]);
    }
    setIsLoading(false);
  };
  
  const handleCreateEvent = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };
  
  const handleSelectEvent = (event) => {
    setSelectedDate(null);
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col">
      <div className="max-w-full mx-auto space-y-6 flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Calendar
            </h1>
            <p className="text-slate-600 mt-1 font-medium">
              Manage your schedule, events, and deadlines in one place.
            </p>
          </div>
          <Button
            onClick={() => handleCreateEvent(new Date())}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Calendar Controls */}
        <CalendarHeader
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          view={view}
          setView={setView}
        />

        {/* Calendar View */}
        <div className="flex-1">
          <CalendarView
            view={view}
            currentDate={currentDate}
            events={events}
            projects={projects}
            tasks={tasks}
            isLoading={isLoading}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleCreateEvent}
          />
        </div>

        {/* Event Modal */}
        {isModalOpen && (
          <EventModal
            event={selectedEvent}
            selectedDate={selectedDate}
            onClose={handleModalClose}
            projects={projects}
          />
        )}
      </div>
    </div>
  );
}