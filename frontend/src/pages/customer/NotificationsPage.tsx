import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/api';
import { NotificationItem } from '../../types/customer';
import { Bell, CheckCircle2, Ticket, AlertCircle, Info, Clock, CheckCheck, RefreshCw } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [markingAll, setMarkingAll] = useState<boolean>(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const updated = await markAllNotificationsAsRead();
      setNotifications(updated);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel-glow rounded-3xl p-6 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-3">
              <Bell className="w-7 h-7 text-amber-400" />
              <span>Queue Notifications</span>
            </h1>
            {unreadCount > 0 && (
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Live alerts, turn reminders, and position updates for your queue tickets.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          )}

          <button
            onClick={fetchNotifs}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Fetching notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-panel p-8 rounded-3xl text-center space-y-3 max-w-md mx-auto border border-slate-800">
          <Bell className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-bold text-slate-200">No Notifications</h3>
          <p className="text-xs text-slate-400">You're all caught up! Real-time alerts will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isUnread = !notif.is_read;

            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'glass-panel-glow border-blue-500/40 bg-blue-950/20'
                    : 'glass-panel border-slate-800/80 opacity-90'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 border ${
                      isUnread
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Ticket className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        {notif.type.replace('_', ' ')}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      {new Date(notif.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {isUnread && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="flex items-center space-x-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-xl transition cursor-pointer flex-shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Read</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

