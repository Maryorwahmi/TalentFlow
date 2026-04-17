/**
 * AdminAnnouncementForm Component
 * Created by CaptainCode
 * Comprehensive form for admins to create and send announcements platform-wide
 */

import { useEffect, useState } from 'react';
import { ActionButton, Card, PageHeading } from '@/shared/ui/talentFlow';
import { adminAPI, announcementsAPI } from '@/shared/api/client';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AdminAnnouncementFormProps {
  onSuccess?: () => void;
}

export function AdminAnnouncementForm({ onSuccess }: AdminAnnouncementFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState('all_users');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<number[]>([]);
  const [notifyMethods, setNotifyMethods] = useState<string[]>(['in-platform', 'email']);

  // Data fetching
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Fetch users when recipient type is "specific"
  useEffect(() => {
    if (recipientType !== 'specific') return;

    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await adminAPI.listUsers?.();
        const userData = response?.data?.data || response?.data || [];
        setUsers(Array.isArray(userData) ? userData : []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        // Fallback: if admin API not available, create empty list
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [recipientType]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (recipientType === 'specific' && selectedRecipientIds.length === 0) {
      setError('Please select at least one recipient');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload: any = {
        title: subject,
        content: message,
        notifyVia: notifyMethods,
      };

      // Add recipient info based on type
      if (recipientType === 'specific') {
        payload.recipientType = 'specific_users';
        payload.recipientIds = selectedRecipientIds;
      } else {
        // For admin-wide announcements, use recipientType as-is
        payload.recipientType = recipientType;
        payload.recipientIds = [];
      }

      await announcementsAPI.createAnnouncement(payload);

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin/announcements');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  // Handle notify method toggle
  const toggleNotifyMethod = (method: string) => {
    setNotifyMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  // Handle recipient selection toggle
  const toggleRecipient = (userId: number) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Select/deselect all recipients
  const toggleAllRecipients = () => {
    if (selectedRecipientIds.length === users.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(users.map((u) => u.id));
    }
  };

  return (
    <div className="max-w-[700px] space-y-5">
      <PageHeading 
        title="Add Announcement" 
        subtitle="Compose and send a new platform announcement"
      />

      {error && (
        <Card className="border-red-200 bg-red-50 text-sm text-red-700">
          {error}
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="space-y-4">
          {/* Send To - Recipient Selection */}
          <div>
            <label className="block text-[12px] font-semibold text-[#1f2560] mb-2">
              Send To
            </label>
            <select
              value={recipientType}
              onChange={(e) => {
                setRecipientType(e.target.value);
                setSelectedRecipientIds([]);
              }}
              className="w-full h-9 rounded-md border border-[#d8dcee] px-3 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#f08a2c]"
            >
              <option value="all_users">All Users (Platform-wide)</option>
              <option value="all_learners">All Learners</option>
              <option value="all_instructors">All Instructors</option>
              <option value="all_admins">All Admins</option>
              <option value="specific">Specific Users</option>
            </select>
          </div>

          {/* Specific Users Selection */}
          {recipientType === 'specific' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-[#646b95]">
                  Selected: {selectedRecipientIds.length} user(s)
                </p>
                <button
                  type="button"
                  onClick={toggleAllRecipients}
                  className="text-[10px] text-[#f08a2c] font-semibold hover:underline"
                >
                  {selectedRecipientIds.length === users.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {usersLoading ? (
                <div className="text-[11px] text-[#a0a6c4]">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-[11px] text-[#a0a6c4]">No users found</div>
              ) : (
                <div className="max-h-[200px] overflow-y-auto border border-[#e4e6f2] rounded-md p-2 space-y-1">
                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-[#f5f7ff] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRecipientIds.includes(user.id)}
                        onChange={() => toggleRecipient(user.id)}
                        className="h-4 w-4 accent-[#08107b]"
                      />
                      <span className="text-[11px] text-[#2a315f] flex-1">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-[10px] text-[#a0a6c4]">{user.email}</span>
                      <span className="text-[10px] text-[#8f94b2] bg-[#eef0ff] px-2 py-0.5 rounded">
                        {user.role}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subject Field */}
          <div>
            <label className="block text-[12px] font-semibold text-[#1f2560] mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Announcement title..."
              className="w-full h-9 rounded-md border border-[#d8dcee] px-3 text-[11px] placeholder-[#c5cae1] focus:outline-none focus:ring-2 focus:ring-[#f08a2c]"
            />
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-[12px] font-semibold text-[#1f2560] mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement here..."
              className="w-full min-h-[120px] rounded-md border border-[#d8dcee] px-3 py-2 text-[11px] placeholder-[#c5cae1] focus:outline-none focus:ring-2 focus:ring-[#f08a2c] resize-none"
            />
          </div>

          {/* Notify Via */}
          <div>
            <label className="block text-[12px] font-semibold text-[#1f2560] mb-2">
              Notify via
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 p-2 rounded-md border border-[#d8dcee] hover:bg-[#f5f7ff] cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={notifyMethods.includes('in-platform')}
                  onChange={() => toggleNotifyMethod('in-platform')}
                  className="h-4 w-4 accent-[#08107b]"
                />
                <span className="text-[11px] text-[#2a315f]">In-platform</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-md border border-[#d8dcee] hover:bg-[#f5f7ff] cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={notifyMethods.includes('email')}
                  onChange={() => toggleNotifyMethod('email')}
                  className="h-4 w-4 accent-[#08107b]"
                />
                <span className="text-[11px] text-[#2a315f]">Email</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <ActionButton
              loading={loading}
              variant="primary"
              onClick={handleSubmit}
              className="flex-1"
            >
              Send Announcement
            </ActionButton>
            <button
              type="button"
              onClick={() => navigate('/admin/announcements')}
              className="flex-1 px-4 py-2 rounded-md border border-[#d8dcee] text-[11px] font-semibold text-[#2a315f] hover:bg-[#f5f7ff]"
            >
              Cancel
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}

export default AdminAnnouncementForm;
