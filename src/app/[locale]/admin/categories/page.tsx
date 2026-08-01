"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, X, Sparkles, Wrench, Zap, Truck, Home, Briefcase, Pencil, Trash2, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { ManageServicesModal } from "@/components/admin/manage-services-modal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const IconMap: Record<string, any> = {
  sparkles: Sparkles,
  wrench: Wrench,
  zap: Zap,
  truck: Truck,
  home: Home,
  briefcase: Briefcase
};

const getIconComponent = (iconName: string) => {
  const Icon = IconMap[(iconName || "").toLowerCase()] || Briefcase;
  return <Icon className="h-8 w-8 text-owl-violet" />;
};

export default function AdminCategoriesPage() {
  const t = useTranslations("AdminCategories");
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [managingCategory, setManagingCategory] = useState<any>(null);
  
  const [newCat, setNewCat] = useState({ id: "", name_en: "", name_ur: "", icon: "", description_en: "", description_ur: "" });

  const fetchData = useCallback(async () => {
    const { data: cats } = await supabase.from("categories").select("*").order("sort_order");
    const { data: svcs } = await supabase.from("services").select("*");
    
    if (cats) setCategories(cats);
    if (svcs) setServices(svcs);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.id || !newCat.name_en || !newCat.name_ur) return toast.error("Required fields missing");
    
    const { error } = await supabase.from("categories").insert([
        { ...newCat, active: true }
    ]);
    
    if (error) {
        toast.error(error.message);
    } else {
        toast.success("Category added successfully");
        setIsAdding(false);
        setNewCat({ id: "", name_en: "", name_ur: "", icon: "", description_en: "", description_ur: "" });
        fetchData();
    }
  };

  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("categories").update({
      name_en: editingCat.name_en,
      name_ur: editingCat.name_ur,
      icon: editingCat.icon,
      description_en: editingCat.description_en,
      description_ur: editingCat.description_ur
    }).eq("id", editingCat.id);
    
    if (error) toast.error(error.message);
    else {
      toast.success("Category updated successfully");
      setEditingCat(null);
      fetchData();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? All its sub-services will also be lost.")) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) toast.error(error.message);
      else {
         toast.success("Category deleted");
         fetchData();
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
      const { error } = await supabase.from("categories").update({ active: !currentStatus }).eq("id", id);
      if (!error) {
          setCategories(categories.map(c => c.id === id ? { ...c, active: !currentStatus } : c));
          toast.success("Status updated");
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
            onClick={() => { setIsAdding(true); setEditingCat(null); }}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-owl-violet text-white hover:bg-owl-violet-dark transition-colors"
        >
          <Plus className="h-4 w-4" /> {t("addCategory")}
        </button>
      </div>

      {(isAdding || editingCat) && (
          <Card className="border-owl-violet shadow-lg mb-6">
              <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">{editingCat ? "Edit Category" : t("newCategory")}</h3>
                      <button onClick={() => { setIsAdding(false); setEditingCat(null); }} className="text-muted-foreground hover:text-foreground">
                          <X className="h-5 w-5" />
                      </button>
                  </div>
                  <form onSubmit={editingCat ? handleEditCategorySubmit : handleAddCategory} className="grid gap-4 md:grid-cols-2">
                      {!editingCat && (
                        <div>
                            <label className="text-xs font-medium mb-1 block">{t("idLabel")}</label>
                            <input type="text" required value={newCat.id} onChange={e => setNewCat({...newCat, id: e.target.value})} className="w-full p-2 border rounded-md bg-background" />
                        </div>
                      )}
                      <div>
                          <label className="text-xs font-medium mb-1 block">{t("iconLabel")} (e.g. sparkles, wrench, truck)</label>
                          <input type="text" value={editingCat ? editingCat.icon : newCat.icon} onChange={e => editingCat ? setEditingCat({...editingCat, icon: e.target.value}) : setNewCat({...newCat, icon: e.target.value})} className="w-full p-2 border rounded-md bg-background" />
                      </div>
                      <div>
                          <label className="text-xs font-medium mb-1 block">{t("nameEnLabel")}</label>
                          <input type="text" required value={editingCat ? editingCat.name_en : newCat.name_en} onChange={e => editingCat ? setEditingCat({...editingCat, name_en: e.target.value}) : setNewCat({...newCat, name_en: e.target.value})} className="w-full p-2 border rounded-md bg-background" />
                      </div>
                      <div>
                          <label className="text-xs font-medium mb-1 block">{t("nameUrLabel")}</label>
                          <input type="text" required value={editingCat ? editingCat.name_ur : newCat.name_ur} onChange={e => editingCat ? setEditingCat({...editingCat, name_ur: e.target.value}) : setNewCat({...newCat, name_ur: e.target.value})} className="w-full p-2 border rounded-md bg-background text-right" dir="rtl" />
                      </div>
                      <div>
                          <label className="text-xs font-medium mb-1 block">Description (EN)</label>
                          <textarea rows={2} value={editingCat ? editingCat.description_en : newCat.description_en} onChange={e => editingCat ? setEditingCat({...editingCat, description_en: e.target.value}) : setNewCat({...newCat, description_en: e.target.value})} className="w-full p-2 border rounded-md bg-background" />
                      </div>
                      <div>
                          <label className="text-xs font-medium mb-1 block">Description (UR)</label>
                          <textarea rows={2} value={editingCat ? editingCat.description_ur : newCat.description_ur} onChange={e => editingCat ? setEditingCat({...editingCat, description_ur: e.target.value}) : setNewCat({...newCat, description_ur: e.target.value})} className="w-full p-2 border rounded-md bg-background text-right" dir="rtl" />
                      </div>
                      <div className="md:col-span-2">
                          <button type="submit" className="w-full bg-owl-violet text-white rounded-md py-2 hover:bg-owl-violet-dark">{editingCat ? "Update Category" : t("saveCategory")}</button>
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
            <Card key={cat.id} className="hover-lift transition-all flex flex-col group">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                      <div className="bg-owl-violet/10 p-2.5 rounded-xl">
                          {getIconComponent(cat.icon)}
                      </div>
                      <div>
                          <h3 className="font-semibold text-lg">{cat.name_en}</h3>
                          <p className="text-xs text-muted-foreground font-medium">{cat.name_ur}</p>
                      </div>
                      </div>
                      <button 
                          onClick={() => handleToggleActive(cat.id, cat.active)}
                          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                          cat.active ? "bg-emerald-500/10 text-emerald-600 hover:bg-destructive/10 hover:text-destructive" : "bg-muted text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600"
                          }`}
                          title="Click to toggle status"
                      >
                          {cat.active ? t("active") : t("inactive")}
                      </button>
                  </div>
                  
                  {cat.description_en && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{cat.description_en}</p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-border/30">
                      <div className="flex items-center justify-between text-sm mb-4">
                          <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                              <Settings className="h-4 w-4" /> 
                              {t("servicesCount", { count: svcByCat[cat.id] || 0 })}
                          </span>
                          <span className="text-muted-foreground text-xs">ID: {cat.id}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full flex items-center gap-1.5"
                          onClick={() => { setEditingCat(cat); setIsAdding(false); }}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full flex items-center gap-1.5 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                        <Button 
                          className="col-span-2 w-full bg-muted/50 text-foreground hover:bg-muted"
                          size="sm"
                          onClick={() => setManagingCategory(cat)}
                        >
                          Manage Services
                        </Button>
                      </div>
                  </div>
                </CardContent>
            </Card>
            ))}
        </div>
      )}

      {managingCategory && (
        <ManageServicesModal
          categoryId={managingCategory.id}
          categoryName={managingCategory.name_en}
          onClose={() => setManagingCategory(null)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}

