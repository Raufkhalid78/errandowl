

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r border-border/50 bg-card p-4 space-y-2 hidden md:block">
        <div className="h-10 bg-muted rounded-xl animate-pulse mb-6" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 bg-muted/60 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-6 space-y-6">
        <div className="h-8 w-48 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-border/50 bg-card animate-pulse space-y-3">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="h-64 bg-card border border-border/50 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
