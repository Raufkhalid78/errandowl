import { createClient } from "@/lib/supabase/server";
import { AdminCategoriesClient } from "./categories-client";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  const { data: services } = await supabase.from("services").select("*");

  return (
    <AdminCategoriesClient 
      initialCategories={categories || []} 
      initialServices={services || []} 
    />
  );
}
