"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MarkRepliedButton({ id, replied }: { id: string; replied: boolean }) {
  const [isReplied, setIsReplied] = useState(replied);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const toggle = async () => {
    setLoading(true);
    // Using `any` cast because contact_messages is added via migration and not yet reflected
    const { error } = await (supabase as any)
      .from("contact_messages")
      .update({ replied: !isReplied })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update: " + error.message);
    } else {
      setIsReplied(!isReplied);
    }
    setLoading(false);
  };

  return (
    <Button size="sm" variant={isReplied ? "outline" : "default"} onClick={toggle} disabled={loading}>
      {isReplied ? "Mark as Unreplied" : "Mark as Replied"}
    </Button>
  );
}
