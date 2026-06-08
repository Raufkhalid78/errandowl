"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface FavoriteButtonProps {
  taskerId: string
  className?: string
}

export function FavoriteButton({ taskerId, className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [userId, setUserId] = React.useState<string | null>(null)
  const supabase = createClient()

  React.useEffect(() => {
    const checkFavorite = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user.id)
        .single()

      if (profile) {
        setUserId(profile.id)
        const { data, error } = await supabase
          .from("favorite_taskers")
          .select("id")
          .eq("client_id", profile.id)
          .eq("tasker_id", taskerId)
          .maybeSingle()
        
        if (data && !error) {
          setIsFavorite(true)
        }
      }
      setIsLoading(false)
    }

    checkFavorite()
  }, [taskerId, supabase])

  const toggleFavorite = async () => {
    if (!userId) {
      toast.error("You must be logged in to save favorites.")
      return
    }

    setIsLoading(true)

    if (isFavorite) {
      // Remove favorite
      const { error } = await supabase
        .from("favorite_taskers")
        .delete()
        .match({ client_id: userId, tasker_id: taskerId })
      
      if (!error) {
        setIsFavorite(false)
        toast.success("Removed from favorites")
      } else {
        toast.error("Failed to remove favorite")
      }
    } else {
      // Add favorite
      const { error } = await supabase
        .from("favorite_taskers")
        .insert({ client_id: userId, tasker_id: taskerId })

      if (!error) {
        setIsFavorite(true)
        toast.success("Added to favorites")
      } else {
        toast.error("Failed to add favorite")
      }
    }
    setIsLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`rounded-full shadow-md bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-md transition-all ${className}`}
      aria-label="Toggle Favorite"
    >
      <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
    </Button>
  )
}
