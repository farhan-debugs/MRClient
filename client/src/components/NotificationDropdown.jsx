import React from 'react';
import { CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { api } from '../utils/api';
import { formatRelativeTime } from '../utils/helpers';

export default function NotificationDropdown({ onClose }) {
  const { notifications, fetchNotifications, openTaskDetail } = useTasks();

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (item) => {
    if (!item.isRead) {
      await api.markNotificationRead(item.id);
      fetchNotifications();
    }
    if (item.taskId) {
      openTaskDetail(item.taskId);
    }
    onClose();
  };

  return (
    <div
      id="notification-panel"
      className="absolute right-0 mt-1.5 w-80 sm:w-88 rounded-xl bg-white border border-stone-200 shadow-xl z-50 overflow-hidden animate-in fade-in duration-100"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200 bg-stone-50">
        <h4 className="text-xs font-semibold text-stone-800">Notifications</h4>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone-400">
            No notifications
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3 text-left transition-colors cursor-pointer flex items-start gap-2.5 ${
                item.isRead
                  ? 'bg-white hover:bg-stone-50 text-stone-600'
                  : 'bg-stone-50/80 hover:bg-stone-100/70 text-stone-900 font-medium'
              }`}
            >
              <div className="mt-1 shrink-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full block ${
                    item.isRead ? 'bg-transparent' : 'bg-rose-500'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-900 leading-tight truncate">
                  {item.title}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>
                <span className="text-[10px] text-stone-400 flex items-center gap-1 mt-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>
              {item.taskId && (
                <ExternalLink className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
