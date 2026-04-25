"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChatInterface } from "@/components/messages/chat-interface";
import { Loader2, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";

export default function MessagesPage() {
  const t = useTranslations("Messages");
  const [userId, setUserId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("id, role").eq("auth_id", user.id).single();
      if (!profile) return;
      
      setUserId(profile.id);

      // Fetch bookings where user is client or tasker
      const { data: userBookings } = await supabase
        .from("bookings")
        .select(`
          id,
          status,
          category_id,
          created_at,
          client:client_id(name, avatar_url),
          tasker:tasker_id(name, avatar_url)
        `)
        .or(`client_id.eq.${profile.id},tasker_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (userBookings) {
        setBookings(userBookings);
        if (userBookings.length > 0) {
          setSelectedBookingId(userBookings[0].id);
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-owl-violet" /></div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="flex-1 bg-background border rounded-lg overflow-hidden flex flex-col md:flex-row shadow-sm">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 border-r flex flex-col bg-muted/10">
          <div className="p-4 border-b font-medium bg-muted/30">
            {t("conversations")}
          </div>
          <ScrollArea className="flex-1">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                {t("noConversations")}
              </div>
            ) : (
              <div className="flex flex-col">
                {bookings.map((booking) => {
                  const isSelected = selectedBookingId === booking.id;
                  // Determine the "other" person in the chat
                  // If we are the client, the other is the tasker, etc.
                  // For simplicity, we just show "Booking {id}"
                  return (
                    <button
                      key={booking.id}
                      onClick={() => setSelectedBookingId(booking.id)}
                      className={`p-4 text-left border-b hover:bg-muted/50 transition-colors flex flex-col gap-1 ${
                        isSelected ? "bg-owl-violet/5 border-l-2 border-l-owl-violet" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-medium text-sm truncate">
                          {t("bookingPrefix")} #{booking.id.slice(0, 6)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`text-xs capitalize ${
                         booking.status === "completed" ? "text-owl-emerald" :
                         booking.status === "pending" ? "text-owl-amber" : "text-blue-500"
                      }`}>
                        {booking.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background relative h-[500px] md:h-auto">
          {selectedBookingId && userId ? (
             <ChatInterface userId={userId} bookingId={selectedBookingId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-2">
              <MessageSquare className="h-12 w-12 opacity-20" />
              <p>{t("selectConversation")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
