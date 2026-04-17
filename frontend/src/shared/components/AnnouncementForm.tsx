/**
 * Enhanced AnnouncementForm Component
 * Created by CaptainCode
 * Flexible form for creating announcements with recipient and notification options
 * Works for both admin and instructor roles
 */

import { useEffect, useMemo, useState } from 'react';
import { ActionButton, Card, PageHeading } from '@/shared/ui/talentFlow';
import { instructorAPI, adminAPI, announcementsAPI } from '@/shared/api/client';
import { useNavigate } from 'react-router-dom';

interface Recipient {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  name?: string;
}

interface AnnouncementFormProps {
  isAdmin?: boolean;
  onSuccess?: () => void;
}

export function AnnouncementForm({ isAdmin = false, onSuccess }: AnnouncementFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState('all');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<number[]>([]);
  const [notifyMethods, setNotifyMethods] = useState<string[]>(['in-platform', 'email']);

  // Data fetching
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);

  // Fetch recipients on mount
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        setRecipientsLoading(true);
        let response;
        
        if (isAdmin) {
          // For admin, fetch all users
          response = await adminAPI.listUsers();
        } else {
          // For instructor, fetch their learners
          response = await instructorAPI.getLearners();
        }
        
        const data = response?.data?.data || response?.data || [];
        setRecipients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch recipients:', err);
        setError('Failed to load recipients');
      } finally {
        setRecipientsLoading(false);
      }
    };

    fetchRecipients();
  }, [isAdmin]);

  // Calculate recipient count
  const recipientCount = useMemo(() => {
    if (recipientType === 'all') {
      return recipients.length;
    } else if (recipientType === 'specific') {
      return selectedRecipientIds.length;
    }
    return 0;
  }, [recipientType, selectedRecipientIds, recipients]);
  void recipientCount;

  // Get display name for recipient
  const getRecipientName = (recipient: Recipient) => {
    if (recipient.firstName && recipient.lastName) {
      return `${recipient.firstName} ${recipient.lastName}`;
    }
    return recipient.name || recipient.email;
  };

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

      const recipientIdsToSend =
        recipientType === 'all' 
          ? recipients.map((r) => r.id)
          : selectedRecipientIds;

      await announcementsAPI.createAnnouncement({
        title: subject,
        content: message,
        recipientType: recipientType === 'all' ? 'all_learners' : 'specific_users',
        recipientIds: recipientIdsToSend,
        notifyVia: notifyMethods,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(isAdmin ? '/admin/announcements' : '/instructor/announcements');
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
  const toggleRecipient = (id: number) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id)
        ? prev.filter((rid) => rid !== id)
        : [...prev, id]
    );
  };

  // Select/deselect all recipients
  const toggleAllRecipients = () => {
    if (selectedRecipientIds.length === recipients.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(recipients.map((r) => r.id));
    }
  };

  const recipientLabel = isAdmin ? 'Users' : 'Learners';

  return (
    <div className="max-w-[700px] space-y-5">
      <PageHeading 
        title="Add Announcement" 
        subtitle="Compose and send a new announcement"
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
              <option value="all">All {recipientLabel} ({recipients.length})</option>
              <option value="specific">Specific {recipientLabel}</option>
            </select>
          </div>

          {/* Specific Recipients Selection */}
          {recipientType === 'specific' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-[#646b95]">
                  Selected: {selectedRecipientIds.length} {recipientLabel.toLowerCase()}
                </p>
                <button
                  type="button"
                  onClick={toggleAllRecipients}
                  className="text-[10px] text-[#f08a2c] font-semibold hover:underline"
                >
                  {selectedRecipientIds.length === recipients.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {recipientsLoading ? (
                <div className="text-[11px] text-[#a0a6c4]">Loading {recipientLabel.toLowerCase()}...</div>
              ) : (
                <div className="max-h-[200px] overflow-y-auto border border-[#e4e6f2] rounded-md p-2 space-y-1">
                  {recipients.map((recipient) => (
                    <label
                      key={recipient.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-[#f5f7ff] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRecipientIds.includes(recipient.id)}
                        onChange={() => toggleRecipient(recipient.id)}
                        className="h-4 w-4 accent-[#08107b]"
                      />
                      <span className="text-[11px] text-[#2a315f] flex-1">
                        {getRecipientName(recipient)}
                      </span>
                      <span className="text-[10px] text-[#a0a6c4]">{recipient.email}</span>
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
              onClick={() => navigate(isAdmin ? '/admin/announcements' : '/instructor/announcements')}
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

export default AnnouncementForm;
