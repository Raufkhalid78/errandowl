import { Loader2 } from "lucide-react";

export default function SearchLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero skeleton */}
      <div className="relative py-16 gradient-hero overflow-hidden pt-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="h-10 w-80 bg-white/20 rounded-xl mx-auto mb-6 animate-pulse" />
          <div className="max-w-2xl mx-auto h-14 bg-white/10 rounded-2xl animate-pulse" />
        </div>
      </div>

      <div className="py-10">
        <div className="container mx-auto px-4 md:px-6">
          {/* Filter bar skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>

          {/* Card grid skeleton */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-border/50 bg-card animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-muted" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-muted rounded w-16" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
