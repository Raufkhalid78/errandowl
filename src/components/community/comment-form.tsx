"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function CommentForm({ postId, authorId }: { postId: string, authorId: string | undefined }) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorId) return alert("You must be logged in to comment.")
    if (!content.trim()) return
    
    setLoading(true)
    const { error } = await supabase.from("forum_comments").insert({
      post_id: postId,
      author_id: authorId,
      content
    })

    if (error) {
      alert(error.message)
    } else {
      setContent("")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        required
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[80px] p-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-owl-violet/20 outline-none"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="bg-owl-violet hover:bg-owl-violet-dark text-white">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reply
        </Button>
      </div>
    </form>
  )
}
