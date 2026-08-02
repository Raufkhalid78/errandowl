import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"

export default async function ServicesPage() {
  const supabase = await createClient()
  const t = await getTranslations("DashboardServices")

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)

  const categories = categoriesData || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Link href={`/dashboard/book?category=${category.id}`} key={category.id}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{category.icon}</div>
                    <div>
                      <CardTitle>{category.name_en}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {category.description_en}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-16 border border-dashed rounded-2xl">
            <div className="text-4xl mb-4">🛠️</div>
            <h3 className="font-medium mb-2">No services available</h3>
            <p className="text-sm text-muted-foreground">
              We are currently setting up our service catalog. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
