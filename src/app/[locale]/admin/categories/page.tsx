"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AdminCategoriesPage() {
  const t = useTranslations("AdminCategories");
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // New category form state
  const [newCat, setNewCat] = useState({ id: "", name_en: "", name_ur: "", icon: "", description_en: "", description_ur: "" });

  const fetchData = useCallback(async () => {
    const { data: cats } = await supabase.from("categories").select("*").order("sort_order");
    const { data: svcs } = await supabase.from("services").select("*");
    
    if (cats) setCategories(cats);
    if (svcs) setServices(svcs);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.id || !newCat.name_en || !newCat.name_ur) return alert("Required fields missing");
    
    const { error } = await supabase.from("categories").insert([
        { ...newCat, active: true }
    ]);
    
    if (error) {
        alert(error.message);
    } else {
        setIsAdding(false);
        setNewCat({ id: "", name_en: "", name_ur: "", icon: "", description_en: "", description_ur: "" });
        fetchData();
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
      const { error } = await supabase.from("categories").update({ active: !currentStatus }).eq("id", id);
      if (!error) {
          setCategories(categories.map(c => c.id === id ? { ...c, active: !currentStatus } : c));
      }
  };

  const svcByCat: Record<string, number> = {};
  services.forEach((s: any) => { svcByCat[s.category_id] = (svcByCat[s.category_id] || 0) + 1; });

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-owl-violet text-white hover:bg-owl-violet-dark transition-colors"
        >
          <Plus className="h-4 w-4" /> {t("addCategory")}
        </button>
      </div>

      {isAdding && (
          <Card className="border-owl-violet shadow-lg mb-6">
              <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">{t("newCategory")}</h3>
                      <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground">
                          <X className="h-5 w-5" />
                      </button>
                  </div>
                  <form onSubmit={handleAddCategory} className="grid gap-4 md:grid-cols-2">
                      <div>
                          <label className="text-xs font-medium mb-1 block">{t("idLabel")}</label>
                          <input type="text" required value={newCat.id} onChange={e => setNewCat({...newCat, id: e.target.value})} className="w-full p-2 border rounded-md bg-background" />
                      </div>
                      <div>
                          <label className="text-xs font-medium mb-1 block">{t("iconLabel")}</label>
                          <input type="text" value={newCat.icon} onChange={e => setNewCat({...newCat, icon: e.target.value})} className="w-full p-2 border rounded-md bg-background" />
                      </div>
                      <div>
                          <label className="text-xs font-medium mb-1 block">{t("nameEnLabel")}</label>
                          <input type="text" required value={newCat.name_en} onChange={e => setNewCat({...newCat, name_en: e.target.value})} className="w-full p-2 border rounded-md bg-background" />
                      </div>
                      <div>
                          <label className="text-xs font-medium mb-1 block">{t("nameUrLabel")}</label>
                          <input type="text" required value={newCat.name_ur} onChange={e => setNewCat({...newCat, name_ur: e.target.value})} className="w-full p-2 border rounded-md bg-background text-right" dir="rtl" />
                      </div>
                      <div className="md:col-span-2">
                          <button type="submit" className="w-full bg-owl-violet text-white rounded-md py-2 hover:bg-owl-violet-dark">{t("saveCategory")}</button>
                      </div>
                  </form>
              </CardContent>
          </Card>
      )}

      {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-owl-violet" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.length === 0 ? (
                <div className="col-span-3 text-center p-10 text-muted-foreground border border-dashed rounded-xl">{t("noCategories")}</div>
            ) : categories.map((cat: any) => (
            <Card key={cat.id} className="hover-lift transition-all">
                <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                    <span className="text-3xl">{cat.icon}</span>
                    <div>
                        <h3 className="font-semibold">{cat.name_en} / {cat.name_ur}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{cat.description_en}</p>
                    </div>
                    </div>
                    <button 
                        onClick={() => handleToggleActive(cat.id, cat.active)}
                        className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                        cat.active ? "bg-owl-emerald/10 text-owl-emerald hover:bg-destructive/10 hover:text-destructive" : "bg-muted text-muted-foreground hover:bg-owl-emerald/10 hover:text-owl-emerald"
                        }`}
                        title="Click to toggle status"
                    >
                        {cat.active ? t("active") : t("inactive")}
                    </button>
                </div>
                <div className="flex items-center justify-between text-sm pt-3 border-t border-border/30">
                    <span className="text-muted-foreground">{t("servicesCount", { count: svcByCat[cat.id] || 0 })}</span>
                    <span className="text-muted-foreground">ID: {cat.id}</span>
                </div>
                </CardContent>
            </Card>
            ))}
        </div>
      )}
    </div>
  );
}
