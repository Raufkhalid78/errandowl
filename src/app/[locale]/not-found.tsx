import { Link } from "@/i18n/routing";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 select-none text-8xl">🦉</div>
      <h1 className="text-6xl font-extrabold tracking-tight text-owl-violet mb-3">404</h1>
      <h2 className="text-2xl font-bold mb-3">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-10 text-base leading-relaxed">
        Oops — the page you&apos;re looking for has flown the nest. It may have been moved, deleted, or never existed.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-owl-violet text-white font-semibold hover:bg-owl-violet/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card font-semibold hover:bg-muted transition-colors"
        >
          <Search className="h-4 w-4" />
          Find a Tasker
        </Link>
      </div>
    </div>
  );
}
