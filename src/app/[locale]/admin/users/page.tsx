"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Eye, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/csv-export";

export default function AdminUsersPage() {
  const t = useTranslations("AdminUsers");
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("profiles").select("*").order("registered_at", { ascending: false });
      if (data) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, [supabase]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success("User role updated successfully");
    } else {
      toast.error("Error updating role: " + error.message);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId);
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success("User status updated to " + newStatus);
    } else {
      toast.error("Error updating status: " + error.message);
    }
  };

  const handleImpersonate = (targetAuthId: string) => {
    if (!targetAuthId) {
      toast.error("User does not have a valid auth session");
      return;
    }
    document.cookie = `sb-impersonate-id=${targetAuthId}; path=/; max-age=3600; SameSite=Lax;`;
    toast.success("Impersonation active. Redirecting to dashboard...");
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  const handleExportCSV = () => {
    const dataToExport = filteredUsers.map(u => ({
      name: u.name || "Unknown",
      email: u.email || "",
      city: u.city || u.location || "—",
      joined: u.registered_at ? new Date(u.registered_at).toLocaleDateString() : "—",
      status: u.status || "active",
      role: u.role || "client"
    }));

    const headersMap = {
      name: "Name",
      email: "Email",
      city: "City/Location",
      joined: "Joined Date",
      status: "Status",
      role: "Role"
    };

    const success = exportToCSV(dataToExport, "errandowl-users.csv", headersMap);
    if (success) {
      toast.success("CSV export downloaded successfully!");
    } else {
      toast.error("No data available to export");
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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 h-9"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <span className="text-sm px-3 py-1.5 rounded-full bg-owl-violet/10 text-owl-violet font-medium">
            {filteredUsers.length} {t("title").toLowerCase()}
          </span>
        </div>
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
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("role")}</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-owl-violet" /></td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">{t("noUsers")}</td></tr>
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
                    <td className="p-4">
                      <select
                        value={user.status || 'active'}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-full capitalize cursor-pointer border font-semibold outline-none ${
                          user.status === "suspended" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                          user.status === "banned" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                          "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }`}
                      >
                        <option value="active" className="text-black bg-white">Active</option>
                        <option value="suspended" className="text-black bg-white">Suspended</option>
                        <option value="banned" className="text-black bg-white">Banned</option>
                      </select>
                    </td>
                    <td className="p-4">
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
                    <td className="p-4 text-right">
                      {user.role !== "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleImpersonate(user.auth_id)}
                          className="h-8 text-xs font-semibold text-owl-violet hover:bg-owl-violet/10 flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="h-3.5 w-3.5" /> Impersonate
                        </Button>
                      )}
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
