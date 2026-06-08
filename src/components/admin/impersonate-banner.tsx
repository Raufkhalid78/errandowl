"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImpersonateBannerProps {
  name: string;
  email: string;
}

export function ImpersonateBanner({ name, email }: ImpersonateBannerProps) {
  const handleStopImpersonating = () => {
    // Delete the cookie
    document.cookie = "sb-impersonate-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;";
    // Reload to restore the admin session
    window.location.href = "/admin/users";
  };

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-3 relative z-[999] shadow-md border-b border-amber-600/30">
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping mr-1" />
        <span>Impersonation Active: Viewing platform as <span className="font-bold">{name}</span> ({email})</span>
      </div>
      <Button
        onClick={handleStopImpersonating}
        size="sm"
        className="h-6 px-2.5 bg-slate-950 hover:bg-slate-900 text-white text-[10px] uppercase tracking-wider font-bold rounded flex items-center gap-1 border border-slate-800 transition-all"
      >
        <X className="h-3 w-3" /> Stop
      </Button>
    </div>
  );
}
