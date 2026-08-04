"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Eye, Download, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/csv-export";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const t = useTranslations("AdminUsers");
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [taskerProfile, setTaskerProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("registered_at", { ascending: false });
      if (error) {
        toast.error("Failed to load users: " + error.message);
        setLoading(false);
        return;
      }
      if (data) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, [supabase]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ role: newRole as any }).eq("id", userId);
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success("User role updated successfully");
    } else {
      toast.error("Error updating role: " + error.message);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const { error } = await supabase.from("profiles").update({ status: newStatus as any }).eq("id", userId);
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success("User status updated to " + newStatus);
    } else {
      toast.error("Error updating status: " + error.message);
    }
  };

  const handleImpersonate = async (targetAuthId: string) => {
    if (!targetAuthId) {
      toast.error("User does not have a valid auth session");
      return;
    }
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: targetAuthId }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      toast.error(error || "Failed to start impersonation");
      return;
    }
    toast.success("Impersonation active. Redirecting to dashboard...");
    setTimeout(() => { window.location.href = "/dashboard"; }, 1000);
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

  const openUserDetails = async (user: any) => {
    setSelectedUser(user);
    if (user.role === 'tasker') {
      setLoadingProfile(true);
      const { data, error } = await supabase.from('tasker_profiles').select('*').eq('id', user.id).single();
      if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" for non-taskers or incomplete profiles
        toast.error("Failed to load tasker profile: " + error.message);
      }
      setTaskerProfile(data || null);
      setLoadingProfile(false);
    } else {
      setTaskerProfile(null);
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
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUserDetails(user)}
                          className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                        {user.role !== "admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleImpersonate(user.auth_id)}
                            className="h-8 text-xs font-semibold text-owl-violet hover:bg-owl-violet/10 flex items-center gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" /> Impersonate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border-owl-violet/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-6 border-b border-border/50">
              <div>
                <h2 className="text-xl font-semibold">User Details</h2>
                <Badge variant="outline" className="mt-1 capitalize bg-muted">{selectedUser.role}</Badge>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-owl-violet/10 text-owl-violet flex items-center justify-center text-2xl font-bold">
                  {selectedUser.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Phone</p>
                  <p className="font-medium">{selectedUser.phone || "Not provided"}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase mb-1">City</p>
                  <p className="font-medium">{selectedUser.city || selectedUser.location || "Not provided"}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Joined</p>
                  <p className="font-medium">{selectedUser.registered_at ? new Date(selectedUser.registered_at).toLocaleDateString() : "Unknown"}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Wallet Balance</p>
                  <p className="font-medium text-owl-emerald">Rs {selectedUser.wallet_balance || 0}</p>
                </div>
              </div>

              {selectedUser.role === 'tasker' && (
                <div className="pt-4 border-t border-border/50">
                  <h4 className="font-semibold mb-4">Tasker Profile</h4>
                  {loadingProfile ? (
                    <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-owl-violet" /></div>
                  ) : taskerProfile ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-xl border border-border/50 text-sm">
                        <p className="text-xs text-muted-foreground uppercase mb-2">Bio</p>
                        <p>{taskerProfile.bio || "No bio provided."}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                          <p className="text-xs text-muted-foreground uppercase mb-1">Rating</p>
                          <p className="font-medium">⭐ {taskerProfile.rating?.toFixed(1) || "New"}</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                          <p className="text-xs text-muted-foreground uppercase mb-1">Jobs Completed</p>
                          <p className="font-medium">{taskerProfile.jobs_completed || 0}</p>
                        </div>
                      </div>
                      {taskerProfile.services && taskerProfile.services.length > 0 && (
                        <div>
                           <p className="text-xs text-muted-foreground uppercase mb-2">Offered Services</p>
                           <div className="flex flex-wrap gap-2">
                             {taskerProfile.services.map((s: string) => (
                               <Badge key={s} variant="secondary">{s}</Badge>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Tasker profile details not found.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
