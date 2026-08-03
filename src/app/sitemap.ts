import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://www.errandowl.com.pk'
const LOCALES = ['en', 'ur']
const TASKER_LIMIT = 500 // cap at the most recently active taskers

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static marketing pages
  const staticRoutes = [
    { path: '', changeFrequency: 'daily' as const, priority: 1 },
    { path: '/search', changeFrequency: 'hourly' as const, priority: 0.9 },
    { path: '/services', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/about', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/how-it-works', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/pricing', changeFrequency: 'monthly' as const, priority: 0.6 },
    { path: '/become-a-tasker', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/help', changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  )

  // Fetch dynamic data from Supabase using the service role key
  // Falls back gracefully if env vars aren't available at build time
  let categoryEntries: MetadataRoute.Sitemap = []
  let taskerEntries: MetadataRoute.Sitemap = []

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Active categories → /search?category={id}
      const { data: categories } = await supabase
        .from('categories')
        .select('id, updated_at')
        .eq('active', true)
        .order('sort_order')

      if (categories) {
        categoryEntries = categories.flatMap((cat) =>
          LOCALES.map((locale) => ({
            url: `${BASE_URL}/${locale}/search?category=${cat.id}`,
            lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          }))
        )
      }

      // Most recently active tasker profiles (capped at TASKER_LIMIT)
      const { data: taskers } = await supabase
        .from('tasker_profiles')
        .select('profile_id, updated_at')
        .eq('active', true)
        .order('updated_at', { ascending: false })
        .limit(TASKER_LIMIT)

      if (taskers) {
        taskerEntries = taskers.flatMap((tp) =>
          LOCALES.map((locale) => ({
            url: `${BASE_URL}/${locale}/tasker/${tp.profile_id}`,
            lastModified: tp.updated_at ? new Date(tp.updated_at) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          }))
        )
      }
    }
  } catch (error) {
    // Sitemap generation must not crash the build
    console.error('Sitemap dynamic generation error:', error)
  }

  return [...staticEntries, ...categoryEntries, ...taskerEntries]
}
