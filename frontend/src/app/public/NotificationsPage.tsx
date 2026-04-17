import { useState, useEffect } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationsAPI } from '@/shared/api/client';
import { formatDate } from '@/shared/api/live';

interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const typeStyles = {
    info: 'border-l-blue-500 bg-blue-50',
    success: 'border-l-green-500 bg-green-50',
    warning: 'border-l-yellow-500 bg-yellow-50',
    error: 'border-l-red-500 bg-red-50',
  };

  const typeTextStyles = {
    info: 'text-blue-800',
    success: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-red-800',
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationsAPI.listMyNotifications();
      const notificationsData = response.data.data?.notifications || response.data?.notifications || [];
      const mappedNotifications = Array.isArray(notificationsData)
        ? notificationsData.map((n: any) => ({
            id: n.id,
            title: n.title || 'Notification',
            message: n.message || n.content || '',
            type: n.type || 'info',
            read: n.status === 'read',
            createdAt: n.createdAt || new Date().toISOString(),
            link: n.link,
          }))
        : [];
      setNotifications(mappedNotifications);
    } catch (err: any) {
      console.error('Failed to fetch notifications', err);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string | number) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/learner" className="flex items-center gap-2 text-[#000066] hover:text-[#FF7A18] transition-colors mb-4">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <Bell size={32} className="text-[#000066]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 text-sm">Stay updated on your learning progress</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#000066] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-[#000066] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border-l-4 p-4 transition-all ${typeStyles[notification.type]}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-lg font-semibold ${typeTextStyles[notification.type]}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="inline-block h-3 w-3 rounded-full bg-[#FF7A18]" title="Unread"></span>
                      )}
                    </div>
                    <p className={`text-sm mb-2 ${typeTextStyles[notification.type]}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${typeTextStyles[notification.type]} opacity-75`}>
                        {formatDate(notification.createdAt)}
                      </span>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className={`text-xs font-medium px-3 py-1 rounded hover:opacity-80 transition-opacity ${
                              notification.type === 'success'
                                ? 'bg-green-200 text-green-800'
                                : notification.type === 'error'
                                ? 'bg-red-200 text-red-800'
                                : notification.type === 'warning'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-blue-200 text-blue-800'
                            }`}
                          >
                            Mark as read
                          </button>
                        )}
                        {notification.link && (
                          <Link
                            to={notification.link}
                            className="text-xs font-medium px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                          >
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
