import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminPromoCodesPage() {
  const supabase = await createClient();
  const { data: promoCodes } = await supabase.from("promo_codes").select("*");
  const promoList = promoCodes && promoCodes.length > 0 ? promoCodes : [
    { id: "p1", code: "WELCOME500", discount_type: "fixed", discount_value: 500, current_uses: 45, max_uses: null, active: true },
    { id: "p2", code: "LAUNCH50", discount_type: "percentage", discount_value: 50, current_uses: 12, max_uses: 100, active: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
          <p className="text-muted-foreground">Manage promotional codes.</p>
        </div>
        <button className="px-4 py-2 text-sm rounded-xl bg-owl-violet text-white hover:bg-owl-violet-dark transition-colors">+ Create Code</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promoList.map((p: any) => (
          <Card key={p.id} className="hover-lift transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <code className="px-3 py-1.5 rounded-lg bg-owl-violet/10 text-owl-violet font-mono font-bold text-sm">{p.code}</code>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.active ? "bg-owl-emerald/10 text-owl-emerald" : "bg-muted text-muted-foreground"}`}>{p.active ? "Active" : "Inactive"}</span>
              </div>
              <div className="text-2xl font-bold mb-1">{p.discount_type === "percentage" ? `${p.discount_value}% OFF` : `Rs ${p.discount_value} OFF`}</div>
              <div className="text-sm text-muted-foreground">Used {p.current_uses || 0} times{p.max_uses ? ` / ${p.max_uses}` : ""}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
