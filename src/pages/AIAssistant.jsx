
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { agentSDK } from '@/agents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Plus, 
  // Bot, // Removed as per instructions
  Smartphone,
  ExternalLink,
  Sparkles,
  Users,
  Shield
} from 'lucide-react';

import ChatInterface from '../components/ai/ChatInterface';
import ConversationList from '../components/ai/ConversationList';

export default function AIAssistant() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('admin');
  const [conversations, setConversations] = useState({ admin: [], client: [] }); // Initialize as an object
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        await loadConversations(); // Await conversation loading
      } catch (e) {
        console.error("Failed to fetch user:", e);
      }
    };
    initialize();
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const [adminConversations, clientConversations] = await Promise.all([
        agentSDK.listConversations({ agent_name: 'admin_assistant' }),
        agentSDK.listConversations({ agent_name: 'client_assistant' })
      ]);
      
      setConversations({
        admin: adminConversations || [],
        client: clientConversations || []
      });
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations({ admin: [], client: [] });
    }
    setIsLoading(false);
  };

  const createNewConversation = async (agentType) => {
    try {
      const agentName = agentType === 'admin' ? 'admin_assistant' : 'client_assistant';
      const conversation = await agentSDK.createConversation({
        agent_name: agentName,
        metadata: {
          name: `${agentType === 'admin' ? 'Admin' : 'Client'} Chat - ${new Date().toLocaleString()}`,
          description: `New conversation with ${agentType} assistant`
        }
      });
      
      setSelectedConversation(conversation);
      await loadConversations(); // Refresh the conversation list after creation
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleConversationSelect = async (conversationId) => {
    try {
      const conversation = await agentSDK.getConversation(conversationId);
      setSelectedConversation(conversation);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  // Handle conversation updates (refresh list and current conversation)
  const handleConversationUpdate = async () => {
    await loadConversations();
    
    // Refresh current conversation if one is selected
    if (selectedConversation?.id) {
      try {
        const updatedConversation = await agentSDK.getConversation(selectedConversation.id);
        setSelectedConversation(updatedConversation);
      } catch (error) {
        console.error('Error refreshing conversation:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <p className="text-lg text-slate-600">Loading AI Assistant...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Authentication Required</h2>
          <p className="text-slate-600">Please log in to access your AI assistants.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d2b6512b6ece2d5ede928f/b33c4a7fc_logo.png" 
                alt="QiEos" 
                className="w-8 h-8 object-contain"
              />
              AI Assistant
            </h1>
            <p className="text-slate-600 mt-1 font-medium">Intelligent helpers for project management and client communication</p>
          </div>
        </div>

        {/* AI Assistant Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin Assistant
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Client Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin" className="mt-6">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Admin Assistant Info & Actions */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Admin Assistant
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Your comprehensive project management assistant. Get help with client management, project planning, financial insights, and business operations.
                    </p>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-800 text-sm">Capabilities:</h4>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Manage clients and projects</li>
                        <li>• Generate reports and insights</li>
                        <li>• Track time and finances</li>
                        <li>• Schedule and organize tasks</li>
                        <li>• Business intelligence</li>
                      </ul>
                    </div>

                    <Button 
                      onClick={() => createNewConversation('admin')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Conversation
                    </Button>

                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(agentSDK.getWhatsAppConnectURL('admin_assistant'), '_blank')}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      WhatsApp
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>

                <ConversationList 
                  conversations={conversations.admin || []}
                  onSelect={handleConversationSelect}
                  selectedId={selectedConversation?.id}
                  agentType="admin"
                />
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-3">
                {selectedConversation ? (
                  <ChatInterface 
                    conversation={selectedConversation}
                    agentType="admin"
                    onConversationUpdate={handleConversationUpdate} // Use new handler
                  />
                ) : (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 h-96 flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <h3 className="text-xl font-medium text-slate-600 mb-2">Welcome to Admin Assistant</h3>
                      <p className="text-slate-500 mb-4">Start a new conversation or select an existing one to get help with your project management tasks.</p>
                      <Button onClick={() => createNewConversation('admin')}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Start Chatting
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="client" className="mt-6">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Client Assistant Info & Actions */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <Users className="w-5 h-5 text-green-600" />
                      Client Assistant
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">
                      A client-friendly assistant for project updates, progress tracking, and communication. Perfect for client portals and support.
                    </p>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-800 text-sm">Features:</h4>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Project progress updates</li>
                        <li>• Deliverable explanations</li>
                        <li>• Timeline inquiries</li>
                        <li>• Document access</li>
                        <li>• Communication support</li>
                      </ul>
                    </div>

                    <Button 
                      onClick={() => createNewConversation('client')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Conversation
                    </Button>

                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(agentSDK.getWhatsAppConnectURL('client_assistant'), '_blank')}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      WhatsApp
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>

                <ConversationList 
                  conversations={conversations.client || []}
                  onSelect={handleConversationSelect}
                  selectedId={selectedConversation?.id}
                  agentType="client"
                />
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-3">
                {selectedConversation ? (
                  <ChatInterface 
                    conversation={selectedConversation}
                    agentType="client"
                    onConversationUpdate={handleConversationUpdate} // Use new handler
                  />
                ) : (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 h-96 flex items-center justify-center">
                    <div className="text-center">
                      <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <h3 className="text-xl font-medium text-slate-600 mb-2">Welcome to Client Assistant</h3>
                      <p className="text-slate-500 mb-4">Create a conversation to help clients with project updates and support.</p>
                      <Button 
                        onClick={() => createNewConversation('client')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Start Chatting
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
