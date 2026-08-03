"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, X, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ManageServicesModalProps {
  categoryId: string;
  categoryName: string;
  initialServices: any[];
  onClose: () => void;
  onUpdate: () => void;
}

export function ManageServicesModal({ categoryId, categoryName, initialServices, onClose, onUpdate }: ManageServicesModalProps) {
  const supabase = createClient();
  const [services, setServices] = useState<any[]>(initialServices);
  const [loading, setLoading] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name_en: "", name_ur: "", base_price: "" });

  const fetchServices = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("category_id", categoryId)
      .order("name_en");
      
    if (data) setServices(data);
    setLoading(false);
  };
  
  // No initial fetch since we have initialServices

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_en || !formData.name_ur) return toast.error("Required fields missing");

    const payload = {
      category_id: categoryId,
      name_en: formData.name_en,
      name_ur: formData.name_ur,
      base_price: formData.base_price ? parseFloat(formData.base_price) : 0,
      active: true,
    };

    if (editingId) {
      const { error } = await supabase.from("services").update(payload).eq("id", editingId);
      if (error) toast.error(error.message);
      else {
        toast.success("Service updated");
        setEditingId(null);
      }
    } else {
      const { error } = await supabase.from("services").insert([payload]);
      if (error) toast.error(error.message);
      else {
        toast.success("Service added");
        setIsAdding(false);
      }
    }

    setFormData({ name_en: "", name_ur: "", base_price: "" });
    fetchServices();
    onUpdate(); // refresh category page counts
  };

  const handleEdit = (svc: any) => {
    setEditingId(svc.id);
    setFormData({
      name_en: svc.name_en,
      name_ur: svc.name_ur,
      base_price: svc.base_price?.toString() || "0"
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) toast.error(error.message);
      else {
        toast.success("Service deleted");
        fetchServices();
        onUpdate();
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("services").update({ active: !currentStatus }).eq("id", id);
    if (error) toast.error(error.message);
    else fetchServices();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col border-owl-violet shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-muted/30">
          <div>
            <h2 className="text-xl font-bold">Manage Services</h2>
            <p className="text-sm text-muted-foreground">Category: {categoryName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:bg-muted p-2 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {!isAdding && !editingId && (
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsAdding(true)} className="bg-owl-violet hover:bg-owl-violet-dark text-white h-9">
                <Plus className="h-4 w-4 mr-2" /> Add Service
              </Button>
            </div>
          )}

          {(isAdding || editingId) && (
            <div className="bg-muted/30 p-4 rounded-xl border mb-6">
              <h3 className="font-semibold mb-4">{editingId ? "Edit Service" : "New Service"}</h3>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium mb-1 block">Name (EN)</label>
                  <input type="text" required value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="w-full p-2 border rounded-md bg-background" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Name (UR)</label>
                  <input type="text" required value={formData.name_ur} onChange={e => setFormData({...formData, name_ur: e.target.value})} className="w-full p-2 border rounded-md bg-background text-right" dir="rtl" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Base Price (PKR)</label>
                  <input type="number" required value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} className="w-full p-2 border rounded-md bg-background" />
                </div>
                <div className="md:col-span-2 flex gap-2 justify-end mt-2">
                  <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditingId(null); setFormData({ name_en: "", name_ur: "", base_price: "" }); }}>Cancel</Button>
                  <Button type="submit" className="bg-owl-violet hover:bg-owl-violet-dark text-white">Save Service</Button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin h-6 w-6 text-owl-violet" /></div>
          ) : services.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground border border-dashed rounded-xl">No services found for this category.</div>
          ) : (
            <div className="space-y-3">
              {services.map(svc => (
                <div key={svc.id} className="flex items-center justify-between p-3 rounded-xl border hover:border-owl-violet/30 bg-card transition-colors">
                  <div>
                    <h4 className="font-semibold text-sm">{svc.name_en} / {svc.name_ur}</h4>
                    <p className="text-xs text-muted-foreground">Base Price: Rs {svc.base_price || 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleActive(svc.id, svc.active)}
                      className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                        svc.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {svc.active ? "Active" : "Inactive"}
                    </button>
                    <button onClick={() => handleEdit(svc)} className="p-1.5 text-muted-foreground hover:text-owl-violet bg-muted/50 rounded-md">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(svc.id)} className="p-1.5 text-muted-foreground hover:text-red-500 bg-muted/50 rounded-md">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
