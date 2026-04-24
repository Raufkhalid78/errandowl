"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AdminUsersPage() {
  const t = useTranslations("AdminUsers");
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("registered_at", { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } else {
      alert("Error updating role");
    }
  };

  const filteredUsers = users.filter(u => {
    if (query && !u.name?.toLowerCase().includes(query.toLowerCase()) && !u.email?.toLowerCase().includes(query.toLowerCase())) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <span className="text-sm px-3 py-1.5 rounded-full bg-owl-violet/10 text-owl-violet font-medium">
          {filteredUsers.length} {t("title").toLowerCase()}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:border-owl-violet"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:border-owl-violet"
        >
          <option value="">{t("allRoles")}</option>
          <option value="client">{t("client")}</option>
          <option value="tasker">{t("tasker")}</option>
          <option value="admin">{t("admin")}</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("user")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("location")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("joined")}</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">{t("role")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-owl-violet" /></td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">{t("noUsers")}</td></tr>
                ) : filteredUsers.map((user: any) => (
                  <tr key={user.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-owl-violet/10 text-owl-violet flex items-center justify-center text-xs font-bold">
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium">{user.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{user.city || user.location || "—"}</td>
                    <td className="p-4 text-muted-foreground text-xs">
                      {user.registered_at ? new Date(user.registered_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={user.role || 'client'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full capitalize cursor-pointer border-none outline-none ${
                          user.role === "tasker" ? "bg-owl-amber/10 text-owl-amber" :
                          user.role === "admin" ? "bg-owl-rose/10 text-owl-rose" :
                          "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        <option value="client" className="text-black bg-white">{t("client")}</option>
                        <option value="tasker" className="text-black bg-white">{t("tasker")}</option>
                        <option value="admin" className="text-black bg-white">{t("admin")}</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
