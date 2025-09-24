import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

export default function TaskCreationModal({ projects, onClose, onSubmit }) {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    project_id: "",
    status: "todo",
    priority: "medium",
    estimated_hours: "",
    due_date: "",
    start_date: "",
    assignee: "",
    tags: []
  });
  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskData.title && taskData.project_id) {
      onSubmit({
        ...taskData,
        estimated_hours: taskData.estimated_hours ? parseFloat(taskData.estimated_hours) : null
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !taskData.tags.includes(newTag.trim())) {
      setTaskData({
        ...taskData,
        tags: [...taskData.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTaskData({
      ...taskData,
      tags: taskData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={taskData.title}
                onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskData.description}
                onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                placeholder="Task description..."
                className="h-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_id">Project *</Label>
              <Select value={taskData.project_id} onValueChange={(value) => setTaskData({...taskData, project_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={taskData.status} onValueChange={(value) => setTaskData({...taskData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={taskData.priority} onValueChange={(value) => setTaskData({...taskData, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                min="0"
                step="0.5"
                value={taskData.estimated_hours}
                onChange={(e) => setTaskData({...taskData, estimated_hours: e.target.value})}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={taskData.start_date}
                onChange={(e) => setTaskData({...taskData, start_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={taskData.due_date}
                onChange={(e) => setTaskData({...taskData, due_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                value={taskData.assignee}
                onChange={(e) => setTaskData({...taskData, assignee: e.target.value})}
                placeholder="Assign to..."
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {taskData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {taskData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-slate-300 rounded-full p-0.5 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!taskData.title || !taskData.project_id}
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}