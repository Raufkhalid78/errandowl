import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@/i18n/routing"

export default async function ServicesPage() {
  const supabase = await createClient()

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)

  // Fallback to mock data if DB is empty for demonstration purposes
  const categories = categoriesData && categoriesData.length > 0 ? categoriesData : [
    { id: "cat-1", name: "Furniture Assembly", icon: "🪑", description: "Assemble or disassemble furniture items" },
    { id: "cat-2", name: "Home Cleaning", icon: "🧹", description: "Professional home and apartment cleaning" },
    { id: "cat-3", name: "Moving Help", icon: "📦", description: "Loading, unloading, and packing assistance" },
    { id: "cat-4", name: "Mounting & Installation", icon: "🔧", description: "Mount TVs, shelves, art, and more" },
    { id: "cat-5", name: "Plumbing", icon: "🔩", description: "Fix leaks, clogs, and plumbing issues" },
    { id: "cat-6", name: "Electrical", icon: "⚡", description: "Light fixtures, outlets, and wiring" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Services</h2>
        <p className="text-muted-foreground">
          Browse categories and book a tasker for your needs.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link href={`/dashboard/book?category=${category.id}`} key={category.id}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{category.icon}</div>
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {category.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
