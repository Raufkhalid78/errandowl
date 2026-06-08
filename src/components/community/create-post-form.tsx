"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function CreatePostForm({ authorId }: { authorId: string | undefined }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("general")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorId) return alert("You must be logged in to post.")
    
    setLoading(true)
    const { error } = await supabase.from("forum_posts").insert({
      author_id: authorId,
      title,
      content,
      category
    })

    if (error) {
      alert(error.message)
    } else {
      setTitle("")
      setContent("")
      setCategory("general")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        required
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-sm"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="general">General Discussion</option>
        <option value="tips">Tasker Tips</option>
        <option value="questions">Questions & Help</option>
        <option value="local">Local Recommendations</option>
      </select>
      <textarea
        required
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-owl-violet/20 outline-none"
      />
      <Button type="submit" disabled={loading} className="w-full bg-owl-violet hover:bg-owl-violet-dark text-white">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Post
      </Button>
    </form>
  )
}
