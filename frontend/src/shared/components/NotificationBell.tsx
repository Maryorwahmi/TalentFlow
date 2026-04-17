import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
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

export const NotificationBell = () => {
  const panelId = 'notification-panel';
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  const typeBadgeStyles = {
    info: 'bg-blue-200 text-blue-800',
    success: 'bg-green-200 text-green-800',
    warning: 'bg-yellow-200 text-yellow-800',
    error: 'bg-red-200 text-red-800',
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
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

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

  const handleRefresh = () => {
    fetchNotifications();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-[#6c7197] transition hover:border-[#d9dced] hover:bg-white"
        title="Notifications"
        type="button"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          aria-label="Notifications"
          className="absolute right-0 top-12 z-50 flex max-h-96 w-96 flex-col rounded-lg border border-gray-200 bg-white shadow-xl"
          id={panelId}
          role="dialog"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900" id="notification-panel-title">Notifications</h3>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                aria-label="Refresh notifications"
                className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
                title="Refresh"
                type="button"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
                className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
                title="Close"
                type="button"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div aria-live="polite" className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-600">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-red-600">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-600">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      typeStyles[notification.type]
                    } ${!notification.read ? 'bg-opacity-80' : 'bg-opacity-50'}`}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                    onKeyDown={(event) => {
                      if ((event.key === 'Enter' || event.key === ' ') && !notification.read) {
                        event.preventDefault();
                        handleMarkAsRead(notification.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${typeBadgeStyles[notification.type]}`}>
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-[#FF7A18] hover:text-[#E66C0B] transition-colors inline-block"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
