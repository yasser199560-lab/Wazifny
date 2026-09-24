"use client";

import { useEffect, useState } from "react";
import { Eye, Search, ShieldBan, UserRound, X } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminUsers, setAdminUserBlocked, type AdminUser } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const dateLabel = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
    : "—";

export default function UsersPage() {
  const token = useAuthStore((state) => state.token);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const timeout = window.setTimeout(() => {
      getAdminUsers(token, { q: query, role }).then(setUsers).catch(() => setUsers([]));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [token, query, role]);

  const updateUser = async (user: AdminUser) => {
    if (!token) return;
    setUpdatingId(user.id);
    try {
      const updated = await setAdminUserBlocked(token, user.id, !user.is_blocked);
      setUsers((items) => items.map((item) => (item.id === user.id ? updated : item)));
      setSelectedUser((item) => (item?.id === user.id ? updated : item));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminShell>
      <div className="flex items-start gap-3">
        <UserRound className="mt-1 h-7 w-7 text-wazifny-green" />
        <div>
          <h1 className="text-3xl font-bold text-wazifny-navy">User Management</h1>
          <p className="mt-1 text-slate-500">{users.length} registered users</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email..." className="w-full py-3 outline-none" />
        </label>
        <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-wazifny-navy shadow-sm sm:w-48">
          <option value="">All Roles</option>
          <option value="talent">Talent</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Actions</th></tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100 text-slate-600">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-wazifny-green font-bold text-white">{user.full_name.charAt(0).toUpperCase()}</span><div><p className="font-semibold text-wazifny-navy">{user.full_name}</p><p className="text-slate-500">{user.email}</p></div></div></td>
                <td className="px-5 py-4"><span className={user.role === "employer" ? "rounded border border-orange-200 bg-orange-50 px-3 py-1 font-medium text-orange-600" : "rounded border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700"}>{user.role}</span></td>
                <td className="px-5 py-4">{user.location || "—"}</td>
                <td className="px-5 py-4">{dateLabel(user.created_at)}</td>
                <td className="px-5 py-4"><span className={user.is_blocked ? "rounded border border-red-200 bg-red-50 px-3 py-1 font-medium text-red-500" : "rounded border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700"}>{user.is_blocked ? "Blocked" : "Active"}</span></td>
                <td className="px-5 py-4"><div className="flex gap-2"><button onClick={() => setSelectedUser(user)} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 font-medium text-wazifny-navy hover:bg-slate-50"><Eye className="h-4 w-4" />View</button><button disabled={updatingId === user.id} onClick={() => updateUser(user)} className={user.is_blocked ? "rounded-md border border-emerald-300 px-3 py-2 font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50" : "inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"}>{!user.is_blocked && <ShieldBan className="h-4 w-4" />}{user.is_blocked ? "Unblock" : "Block"}</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <p className="px-5 py-12 text-center text-slate-500">No users match the current filters.</p>}
      </div>

      {selectedUser && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold uppercase tracking-wider text-wazifny-green">Account details</p><h2 className="mt-1 text-2xl font-bold text-wazifny-navy">{selectedUser.full_name}</h2></div><button onClick={() => setSelectedUser(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button></div><dl className="mt-6 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-500">Email</dt><dd className="mt-1 font-medium text-wazifny-navy">{selectedUser.email}</dd></div><div><dt className="text-slate-500">Role</dt><dd className="mt-1 capitalize font-medium text-wazifny-navy">{selectedUser.role}</dd></div><div><dt className="text-slate-500">Location</dt><dd className="mt-1 font-medium text-wazifny-navy">{selectedUser.location || "Not provided"}</dd></div><div><dt className="text-slate-500">Joined</dt><dd className="mt-1 font-medium text-wazifny-navy">{dateLabel(selectedUser.created_at)}</dd></div><div className="col-span-2"><dt className="text-slate-500">Access status</dt><dd className={selectedUser.is_blocked ? "mt-1 font-semibold text-red-500" : "mt-1 font-semibold text-emerald-700"}>{selectedUser.is_blocked ? `Blocked${selectedUser.blocked_reason ? ` — ${selectedUser.blocked_reason}` : ""}` : "Active"}</dd></div></dl><div className="mt-7 flex justify-end gap-3"><button onClick={() => setSelectedUser(null)} className="rounded-lg border px-4 py-2 font-medium text-wazifny-navy">Close</button><button disabled={updatingId === selectedUser.id} onClick={() => updateUser(selectedUser)} className={selectedUser.is_blocked ? "rounded-lg bg-wazifny-green px-4 py-2 font-semibold text-white disabled:opacity-50" : "rounded-lg bg-red-500 px-4 py-2 font-semibold text-white disabled:opacity-50"}>{selectedUser.is_blocked ? "Unblock user" : "Block user"}</button></div></div></div>}
    </AdminShell>
  );
}
