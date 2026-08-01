"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ShieldAlert, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SosButtonProps {
  bookingId: string;
  userId: string;
}

export function SosButton({ bookingId, userId }: SosButtonProps) {
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const supabase = createClient();

  const handleTriggerSos = () => {
    setLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await submitSos(pos.coords.latitude, pos.coords.longitude);
        },
        async () => {
          await submitSos(31.5204, 74.3587); // Default to city coordinates if GPS unavailable
        }
      );
    } else {
      submitSos(31.5204, 74.3587);
    }
  };

  const submitSos = async (lat: number, lng: number) => {
    try {
      const { error } = await supabase.from("sos_events").insert({
        booking_id: bookingId,
        user_id: userId,
        lat,
        lng,
        status: "triggered",
      });

      if (error) throw error;

      setTriggered(true);
      setLoading(false);
      toast.error("EMERGENCY ALERT SENT! Admin safety team and contacts notified.", { duration: 10000 });
    } catch (err: any) {
      setLoading(false);
      toast.error("Failed to trigger SOS: " + err.message);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpenModal(true)}
        variant="destructive"
        className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2 shadow-lg shadow-rose-600/30"
      >
        <ShieldAlert className="h-5 w-5 animate-bounce" /> SOS Emergency
      </Button>

      {openModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-rose-500/30 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-5">
            {!triggered ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-10 w-10 animate-pulse" />
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-foreground">Trigger Emergency SOS?</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    This will immediately capture your current GPS location, alert our 24/7 Safety Incident Team, and log an urgent high-priority distress event.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    onClick={handleTriggerSos}
                    disabled={loading}
                    className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base rounded-xl"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldAlert className="h-5 w-5 mr-2" />}
                    CONFIRM & SEND SOS NOW
                  </Button>

                  <Button
                    onClick={() => setOpenModal(false)}
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10" />
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-foreground">SOS Signal Sent</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Emergency coordinates recorded. Safety response team is monitoring this active booking session.
                  </p>
                </div>

                <Button
                  onClick={() => setOpenModal(false)}
                  className="w-full bg-owl-violet text-white font-bold h-12 rounded-xl"
                >
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
