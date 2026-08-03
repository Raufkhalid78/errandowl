export default function TaskerProfileLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero header skeleton */}
      <div className="relative py-16 gradient-hero overflow-hidden pt-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-3xl bg-white/20 animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 bg-white/20 rounded-xl animate-pulse" />
              <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 md:px-6 max-w-4xl py-12 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 rounded-2xl border border-border/50 bg-card animate-pulse space-y-2">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="h-6 w-12 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full animate-pulse" />
          <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
