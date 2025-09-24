import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Bot,
  User,
  Loader2,
  Settings,
  MoreVertical
} from 'lucide-react';
import { agentSDK } from '@/agents';
import MessageBubble from './MessageBubble';
import { UploadFile } from '@/api/integrations';

export default function ChatInterface({ conversation, agentType, onConversationUpdate }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize messages when conversation changes
  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages || []);
      setIsTyping(false);
    }
  }, [conversation]);

  // Set up real-time subscription
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = agentSDK.subscribeToConversation(conversation.id, (data) => {
      if (data.messages) {
        setMessages([...data.messages]); // Create new array to force re-render
        setIsTyping(false);
        setIsSending(false);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversation?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);
    setIsTyping(true);
    
    try {
      await agentSDK.addMessage(conversation, {
        role: 'user',
        content: messageText
      });
      
      // Update conversation list
      if (onConversationUpdate) {
        onConversationUpdate();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setIsSending(false);
      // Restore the message if sending failed
      setInputMessage(messageText);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsSending(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      await agentSDK.addMessage(conversation, {
        role: 'user',
        content: `I've uploaded a file: ${file.name}`,
        file_urls: [file_url]
      });
      
      if (onConversationUpdate) {
        onConversationUpdate();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const agentInfo = {
    admin: { 
      name: 'Admin Assistant', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Project Management Expert'
    },
    client: { 
      name: 'Client Assistant', 
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Client Support Specialist'
    }
  };

  const currentAgent = agentInfo[agentType] || agentInfo.admin;

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 flex flex-col h-[600px]">
      <CardHeader className="border-b border-slate-200/60 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${currentAgent.bgColor} flex items-center justify-center`}>
              <Bot className={`w-5 h-5 ${currentAgent.color}`} />
            </div>
            <div>
              <CardTitle className="text-slate-900">{currentAgent.name}</CardTitle>
              <p className="text-sm text-slate-600">{currentAgent.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {messages.length} messages
            </Badge>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Container - Fixed height with scroll */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0"
          style={{ maxHeight: 'calc(600px - 140px)' }}
        >
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">Start a conversation with your {agentType} assistant</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble key={`${conversation?.id}-${index}-${message.role}`} message={message} />
            ))
          )}
          
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${currentAgent.bgColor} flex items-center justify-center`}>
                <Bot className={`w-4 h-4 ${currentAgent.color}`} />
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="border-t border-slate-200/60 p-4 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-400 hover:text-slate-600"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask your ${agentType} assistant anything...`}
              className="flex-1"
              disabled={isSending}
            />
            
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className={agentType === 'admin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
          />
        </div>
      </CardContent>
    </Card>
  );
}