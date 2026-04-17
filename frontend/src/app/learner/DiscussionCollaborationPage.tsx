/**
 * Discussion/Collaboration Area
 * Created by CaptainCode
 * Forum-style interface for peer discussions and course-related conversations
 */

import { useEffect, useState } from 'react';
import { Send, Plus, MessageCircle, Users, Lock, Globe, Search } from 'lucide-react';
import { communicationAPI } from '@/shared/api/client';
import { useAsyncResource, unwrapData } from '@/shared/api/live';
import { useAuthStore } from '@/shared/state/auth';
import {
  ActionButton,
  Card,
  CircleAvatar,
  PageHeading,
  StatusPill,
} from '@/shared/ui/talentFlow';

interface Channel {
  id: number;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'course-specific';
  courseId?: number;
  memberCount?: number;
  messageCount?: number;
  createdAt: string;
}

interface Message {
  id: number;
  channelId: number;
  userId: number;
  content: string;
  createdAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  reactions?: Record<string, number>;
}

export function DiscussionCollaborationPage() {
  const { user: currentUser } = useAuthStore();

  const { data: channelsData, loading: channelsLoading, error: channelsError, refetch: refetchChannels } = 
    useAsyncResource(() => communicationAPI.listChannels().then(unwrapData), []);

  // Ensure channels is always an array
  const channels = (() => {
    if (!channelsData) return [];
    if (Array.isArray(channelsData)) return channelsData;
    if (Array.isArray(channelsData.channels)) return channelsData.channels;
    return [];
  })();

  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChannelForm, setShowNewChannelForm] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch messages when channel is selected
  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel.id);
    }
  }, [selectedChannel]);

  const fetchMessages = async (channelId: number) => {
    try {
      setLoadingMessages(true);
      const response = await communicationAPI.listMessages(channelId);
      
      // Ensure messages is always an array
      const msgList = (() => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (Array.isArray(response.data)) return response.data;
        if (Array.isArray(response.data?.data)) return response.data.data;
        if (Array.isArray(response.data?.messages)) return response.data.messages;
        return [];
      })();
      
      setMessages(msgList);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) {
      return;
    }

    try {
      setSendingMessage(true);
      await communicationAPI.postMessage(selectedChannel.id, {
        content: newMessage,
      });
      setNewMessage('');
      await fetchMessages(selectedChannel.id);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      alert('Channel name is required');
      return;
    }

    try {
      await communicationAPI.createChannel({
        name: newChannelName,
        description: newChannelDesc,
        type: 'public',
      });
      await refetchChannels();
      setNewChannelName('');
      setNewChannelDesc('');
      setShowNewChannelForm(false);
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Error creating channel');
    }
  };

  const filteredChannels = channels.filter((channel: Channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (channel.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const getChannelIcon = (type: string) => {
    if (type === 'private') {
      return <Lock size={16} className="text-red-600" />;
    }
    return <Globe size={16} className="text-blue-600" />;
  };

  if (channelsError) {
    return (
      <div className="p-6">
        <Card className="bg-red-50 border-red-200 text-red-700">
          Error loading channels: {channelsError}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-8">
        <div className="flex justify-between items-center">
          <div>
            <PageHeading title="Discussion Forum" />
            <p className="text-gray-600 mt-2">Collaborate and discuss with peers and instructors</p>
          </div>
          <ActionButton
            variant="primary"
            onClick={() => setShowNewChannelForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            New Channel
          </ActionButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Channels Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              {/* Search */}
              <div className="mb-4 relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* New Channel Form */}
              {showNewChannelForm && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Channel name..."
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <textarea
                      placeholder="Description (optional)..."
                      value={newChannelDesc}
                      onChange={(e) => setNewChannelDesc(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <ActionButton
                        variant="primary"
                        onClick={handleCreateChannel}
                        className="flex-1"
                      >
                        Create
                      </ActionButton>
                      <ActionButton
                        variant="secondary"
                        onClick={() => {
                          setShowNewChannelForm(false);
                          setNewChannelName('');
                          setNewChannelDesc('');
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </ActionButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Channels List */}
              <h3 className="font-semibold text-gray-900 mb-4">Channels ({filteredChannels.length})</h3>
              {channelsLoading ? (
                <p className="text-gray-500 text-sm">Loading channels...</p>
              ) : filteredChannels.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  {channels.length === 0 ? 'No channels yet' : 'No channels match your search'}
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredChannels.map((channel: Channel) => (
                    <div
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChannel?.id === channel.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {getChannelIcon(channel.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">#{channel.name}</p>
                          <p className="text-xs text-gray-600 truncate">{channel.description}</p>
                          <div className="flex gap-2 mt-2 text-xs">
                            <span className="text-gray-500">
                              <Users size={12} className="inline mr-1" />
                              {channel.memberCount || 0}
                            </span>
                            <span className="text-gray-500">
                              <MessageCircle size={12} className="inline mr-1" />
                              {channel.messageCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedChannel ? (
              <Card className="flex flex-col h-[600px]">
                {/* Channel Header */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">#{selectedChannel.name}</h2>
                      <p className="text-gray-600 text-sm mt-1">{selectedChannel.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {selectedChannel.type === 'private' && (
                        <StatusPill label="Private" tone="warning" />
                      )}
                      <StatusPill label={`${selectedChannel.memberCount || 0} members`} tone="primary" />
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 p-4 rounded-lg space-y-4">
                  {loadingMessages ? (
                    <p className="text-gray-500 text-center">Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <MessageCircle size={32} className="mx-auto mb-2 text-gray-400" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = String(message.userId) === String(currentUser?.id);
                      const user = message.user;
                      const initials = user
                        ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
                        : '??';

                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                        >
                          {!isOwnMessage && <CircleAvatar initials={initials} tone="primary" />}
                          <div className={isOwnMessage ? 'text-right' : ''}>
                            <div className="flex items-center gap-2 mb-1">
                              {!isOwnMessage && (
                                <p className="text-sm font-medium text-gray-900">
                                  {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <div
                              className={`p-3 rounded-lg max-w-xs ${
                                isOwnMessage
                                  ? 'bg-blue-600 text-white rounded-br-none'
                                  : 'bg-white border border-gray-200 rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm break-words">{message.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2 border-t border-gray-200 pt-4">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                  <ActionButton
                    variant="primary"
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="flex items-center gap-2"
                  >
                    <Send size={18} />
                  </ActionButton>
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center h-96 text-center">
                <MessageCircle size={48} className="text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">Select a channel to start chatting</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
