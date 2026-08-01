"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

interface TaskerMapProps {
  taskers: any[];
}

const TaskerMapInner = dynamic(() => import("./tasker-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-muted/30 rounded-2xl flex flex-col items-center justify-center border border-dashed text-muted-foreground gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-owl-violet" />
      <span className="text-sm font-medium">Loading Interactive Map...</span>
    </div>
  ),
});

export function TaskerMap({ taskers }: TaskerMapProps) {
  return (
    <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-border/50 shadow-md relative">
      <TaskerMapInner taskers={taskers} />
    </div>
  );
}
