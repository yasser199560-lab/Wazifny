"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2, MessageSquare, TrendingUp, Briefcase } from "lucide-react";
import EmployerShell from "@/components/employer/EmployerShell";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const ICONS: Record<string, typeof Bell> = {
  job_match: TrendingUp,
  application_update: Briefcase,
  message: MessageSquare,
};

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const token = useAuthStore((s) => s.token);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    if (!token) return;
    const res = await getNotifications(token);
    setNotifications(res.notifications);
    setUnreadCount(res.unread_count);
  }

  useEffect(() => {
    load().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleMarkRead(id: string) {
    if (!token) return;
    await markNotificationRead(token, id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function handleMarkAll() {
    if (!token) return;
    await markAllNotificationsRead(token);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  return (
    <EmployerShell>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-wazifny-green" />
            <h1 className="text-2xl font-bold text-wazifny-navy">Notifications</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-wazifny-navy hover:bg-slate-50"
          >
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-wazifny-green" />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <button
                key={n.id}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left shadow-card transition-colors ${
                  n.is_read
                    ? "border-slate-100 bg-white"
                    : "border-wazifny-green/40 bg-wazifny-green/5"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wazifny-orange/10 text-wazifny-orange">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-wazifny-navy">{n.title}</span>
                    <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
                      {timeAgo(n.created_at)}
                      {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-wazifny-orange" />}
                    </span>
                  </span>
                  <span className="block text-sm text-slate-500">{n.content}</span>
                </span>
              </button>
            );
          })}
          {notifications.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
              You&apos;re all caught up.
            </div>
          )}
        </div>
      )}
    </EmployerShell>
  );
}
