"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface AvailabilityCalendarProps {
  taskerProfileId: string;
}

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export function AvailabilityCalendar({ taskerProfileId }: AvailabilityCalendarProps) {
  const [schedule, setSchedule] = useState<Record<string, { enabled: boolean; start: string; end: string }>>({
    mon: { enabled: true, start: "09:00", end: "18:00" },
    tue: { enabled: true, start: "09:00", end: "18:00" },
    wed: { enabled: true, start: "09:00", end: "18:00" },
    thu: { enabled: true, start: "09:00", end: "18:00" },
    fri: { enabled: true, start: "09:00", end: "18:00" },
    sat: { enabled: false, start: "10:00", end: "16:00" },
    sun: { enabled: false, start: "10:00", end: "16:00" },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchAvailability = async () => {
      const { data } = await supabase
        .from("tasker_availability")
        .select("*")
        .eq("tasker_id", taskerProfileId);

      if (data && data.length > 0) {
        const newSched = { ...schedule };
        data.forEach((row) => {
          if (row.day_of_week && newSched[row.day_of_week]) {
            newSched[row.day_of_week] = {
              enabled: !row.is_blocked,
              start: row.start_time || "09:00",
              end: row.end_time || "18:00",
            };
          }
        });
        setSchedule(newSched);
      }
      setLoading(false);
    };

    fetchAvailability();
  }, [taskerProfileId, supabase]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert availability rows per day
      const upserts = Object.keys(schedule).map((dayKey) => ({
        tasker_id: taskerProfileId,
        day_of_week: dayKey,
        start_time: schedule[dayKey].start,
        end_time: schedule[dayKey].end,
        is_blocked: !schedule[dayKey].enabled,
      }));

      const { error } = await supabase.from("tasker_availability").upsert(upserts, {
        onConflict: "tasker_id,day_of_week",
      });

      if (error) throw error;

      toast.success("Working schedule updated successfully!");
    } catch (err: any) {
      toast.error("Error saving availability: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-owl-violet" /></div>;
  }

  return (
    <div className="p-6 rounded-3xl border border-border/50 glass space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-owl-violet" /> Working Availability Schedule
          </h3>
          <p className="text-xs text-muted-foreground">Define your weekly operating hours for incoming booking requests.</p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-owl-violet hover:bg-owl-violet-dark text-white font-bold h-10 px-5 rounded-xl gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Schedule
        </Button>
      </div>

      <div className="space-y-3">
        {DAYS.map((day) => {
          const item = schedule[day.key];
          return (
            <div
              key={day.key}
              className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
                item.enabled ? "bg-card border-border/60" : "bg-muted/30 border-dashed border-border/40 opacity-70"
              }`}
            >
              <div className="flex items-center gap-3 min-w-[120px]">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) =>
                    setSchedule((prev) => ({
                      ...prev,
                      [day.key]: { ...prev[day.key], enabled: e.target.checked },
                    }))
                  }
                  className="rounded border-gray-300 text-owl-violet focus:ring-owl-violet h-4 w-4"
                />
                <span className="font-semibold text-sm">{day.label}</span>
              </div>

              {item.enabled ? (
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="time"
                    value={item.start}
                    onChange={(e) =>
                      setSchedule((prev) => ({
                        ...prev,
                        [day.key]: { ...prev[day.key], start: e.target.value },
                      }))
                    }
                    className="px-2 py-1 bg-background border rounded-lg"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={item.end}
                    onChange={(e) =>
                      setSchedule((prev) => ({
                        ...prev,
                        [day.key]: { ...prev[day.key], end: e.target.value },
                      }))
                    }
                    className="px-2 py-1 bg-background border rounded-lg"
                  />
                </div>
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-[11px]">
                  Unavailable / Off
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
