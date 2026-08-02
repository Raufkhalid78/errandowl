import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Link } from "@/i18n/routing"
import { ArrowLeft, Clock } from "lucide-react"
import { CommentForm } from "@/components/community/comment-form"

export default async function ForumPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", user.id).single()

  const { data: post } = await supabase
    .from("forum_posts")
    .select("*, author:author_id(name, avatar)")
    .eq("id", id)
    .single()

  if (!post) redirect("/dashboard/community")

  const { data: comments } = await supabase
    .from("forum_comments")
    .select("*, author:author_id(name, avatar)")
    .eq("post_id", id)
    .order("created_at", { ascending: true })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard/community" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Community
      </Link>

      <div className="p-6 rounded-2xl border border-border/50 bg-card glass">
        <div className="flex gap-2 items-center mb-3">
          <span className="text-[10px] uppercase font-bold text-owl-violet bg-owl-violet/10 px-2 py-0.5 rounded-full">
            {post.category}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(post.created_at as string), { addSuffix: true })}
          </span>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {post.author?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatar as string} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              (post.author?.name as string)?.[0] || "U"
            )}
          </div>
          <span className="font-medium text-sm">{(post.author?.name as string) || "Anonymous"}</span>
        </div>

        <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
          {post.content}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Comments ({comments?.length || 0})</h3>
        
        <div className="space-y-4">
          {comments?.map((comment) => (
            <div key={comment.id} className="p-4 rounded-xl border border-border/50 bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden text-xs">
                    {comment.author?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={comment.author.avatar as string} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      (comment.author?.name as string)?.[0] || "U"
                    )}
                  </div>
                  <span className="font-medium text-sm">{(comment.author?.name as string) || "Anonymous"}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at as string), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm pl-8 text-foreground/80 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <CommentForm postId={post.id} authorId={profile?.id} />
        </div>
      </div>
    </div>
  )
}
