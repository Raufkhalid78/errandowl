"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

export function AdminPromoCodesClient({ initialPromoCodes }: { initialPromoCodes: any[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [promoCodes, setPromoCodes] = useState<any[]>(initialPromoCodes);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingCode, setEditingCode] = useState<any>(null);
  
  const defaultForm = { code: "", discount_type: "percentage", discount_value: "", max_uses: "" };
  const [formData, setFormData] = useState(defaultForm);

  const refreshData = () => {
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_value) return toast.error("Code and discount value required");

    const payload = {
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      active: true,
    };

    if (editingCode) {
      const { error } = await supabase.from("promo_codes").update(payload).eq("id", editingCode.id);
      if (error) toast.error(error.message);
      else {
        toast.success("Promo code updated");
        setEditingCode(null);
      }
    } else {
      const { error } = await supabase.from("promo_codes").insert([payload]);
      if (error) toast.error(error.message);
      else {
        toast.success("Promo code created");
        setIsAdding(false);
      }
    }

    setFormData(defaultForm);
    refreshData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this promo code?")) {
      const { error } = await supabase.from("promo_codes").delete().eq("id", id);
      if (error) toast.error(error.message);
      else {
        toast.success("Promo code deleted");
        refreshData();
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("promo_codes").update({ active: !currentStatus }).eq("id", id);
    if (!error) {
      setPromoCodes(promoCodes.map(p => p.id === id ? { ...p, active: !currentStatus } : p));
      toast.success("Status updated");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
          <p className="text-muted-foreground">Manage promotional codes.</p>
        </div>
        <Button 
            onClick={() => { setIsAdding(true); setEditingCode(null); setFormData(defaultForm); }}
            className="flex items-center gap-2 bg-owl-violet text-white hover:bg-owl-violet-dark"
        >
          <Plus className="h-4 w-4" /> Create Code
        </Button>
      </div>

      {(isAdding || editingCode) && (
        <Card className="border-owl-violet shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{editingCode ? "Edit Promo Code" : "New Promo Code"}</h3>
              <button onClick={() => { setIsAdding(false); setEditingCode(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium mb-1 block">Code</label>
                <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full p-2 border rounded-md bg-background uppercase" placeholder="e.g. SUMMER20" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Discount Type</label>
                <select value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})} className="w-full p-2 border rounded-md bg-background">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (PKR)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Discount Value</label>
                <input type="number" required value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} className="w-full p-2 border rounded-md bg-background" placeholder={formData.discount_type === 'percentage' ? "e.g. 20" : "e.g. 500"} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Max Uses (Optional)</label>
                <input type="number" value={formData.max_uses} onChange={e => setFormData({...formData, max_uses: e.target.value})} className="w-full p-2 border rounded-md bg-background" placeholder="Leave blank for unlimited" />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full bg-owl-violet text-white hover:bg-owl-violet-dark">
                  {editingCode ? "Update Promo Code" : "Save Promo Code"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promoCodes.length === 0 ? (
            <div className="col-span-3 text-center p-10 text-muted-foreground border border-dashed rounded-xl">No promo codes found</div>
          ) : promoCodes.map((p: any) => (
            <Card key={p.id} className="hover-lift transition-all group flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <code className="px-3 py-1.5 rounded-lg bg-owl-violet/10 text-owl-violet font-mono font-bold text-sm tracking-wider">{p.code}</code>
                  <button 
                    onClick={() => handleToggleActive(p.id, p.active)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer border ${
                      p.active ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-destructive/10 hover:text-destructive" : "bg-muted text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600"
                    }`}
                  >
                    {p.active ? "Active" : "Inactive"}
                  </button>
                </div>
                <div className="text-3xl font-bold mb-2">
                  {p.discount_type === "percentage" ? `${p.discount_value}% OFF` : `Rs ${p.discount_value} OFF`}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Used {p.current_uses || 0} times{p.max_uses ? ` / ${p.max_uses}` : ""}
                </div>
                
                <div className="mt-auto grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity pt-4 border-t border-border/30">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1.5"
                    onClick={() => {
                      setEditingCode(p);
                      setFormData({
                        code: p.code,
                        discount_type: p.discount_type,
                        discount_value: p.discount_value.toString(),
                        max_uses: p.max_uses ? p.max_uses.toString() : ""
                      });
                      setIsAdding(false);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1.5 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
    </div>
  );
}
