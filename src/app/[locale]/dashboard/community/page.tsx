import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

import { Link } from "@/i18n/routing"

import { MessageSquare, Heart, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { CreatePostForm } from "@/components/community/create-post-form"

export default async function CommunityPage() {
  const supabase = await createClient()


  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", user.id).single()

  const { data: posts } = await supabase
    .from("forum_posts")
    .select("*, author:author_id(name, avatar_url), comments:forum_comments(count)")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Community Forum</h2>
          <p className="text-muted-foreground">Ask questions, share tips, and connect with others.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="p-5 rounded-2xl border border-border/50 bg-card hover:bg-muted/20 transition-colors glass">
                <Link href={`/dashboard/community/${post.id}`} className="block">
                  <div className="flex gap-2 items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-owl-violet bg-owl-violet/10 px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.content}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {post.author?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={post.author.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          post.author?.name?.[0]
                        )}
                      </div>
                      <span>{post.author?.name || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes_count}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.comments?.[0]?.count || 0}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center p-12 border border-dashed rounded-2xl bg-muted/10">
              <p className="text-muted-foreground mb-4">No posts yet. Be the first to start a discussion!</p>
            </div>
          )}
        </div>

        <div className="sticky top-24">
          <div className="p-5 rounded-2xl border border-border/50 bg-card glass">
            <h3 className="font-semibold mb-4">Start a Discussion</h3>
            <CreatePostForm authorId={profile?.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
