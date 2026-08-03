import { createClient } from "@/lib/supabase/server";
import { MarkRepliedButton } from "./mark-replied-button";

export default async function AdminContactMessagesPage() {
  const supabase = await createClient();

  // Using `any` cast because contact_messages is added via migration and not yet reflected
  const { data: messages, error } = await (supabase as any)
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-6 text-red-500">Failed to load messages: {error.message}</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Contact Messages</h1>
      {(!messages || messages.length === 0) && (
        <p className="text-muted-foreground">No messages yet.</p>
      )}
      {messages?.map((msg: any) => (
        <div key={msg.id} className={`border rounded-xl p-4 ${msg.replied ? "opacity-60" : ""}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">{msg.name}</p>
              <a href={`mailto:${msg.email}`} className="text-sm text-owl-violet">{msg.email}</a>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(msg.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-3 text-sm whitespace-pre-wrap">{msg.message}</p>
          <div className="mt-3">
            <MarkRepliedButton id={msg.id} replied={msg.replied} />
          </div>
        </div>
      ))}
    </div>
  );
}
