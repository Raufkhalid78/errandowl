"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function TaskerStatusToggle({ profileId, initialStatus }: { profileId: string, initialStatus: boolean }) {
  const [active, setActive] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const toggleStatus = async () => {
    setLoading(true)
    const newStatus = !active
    
    const { error } = await supabase
      .from("tasker_profiles")
      .update({ active: newStatus })
      .eq("profile_id", profileId)

    if (error) {
      toast.error("Failed to update status")
      console.error(error)
    } else {
      setActive(newStatus)
      toast.success(`Tasker marked as ${newStatus ? "Active" : "Inactive"}`)
    }
    
    setLoading(false)
  }

  return (
    <button 
      onClick={toggleStatus}
      disabled={loading}
      className={`flex items-center justify-center gap-1 text-xs px-3 py-1 rounded-full font-medium transition-colors ${
        active 
          ? "bg-owl-emerald/10 text-owl-emerald hover:bg-owl-emerald/20" 
          : "bg-destructive/10 text-destructive hover:bg-destructive/20"
      }`}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
      {active ? "Active" : "Inactive"}
    </button>
  )
}
