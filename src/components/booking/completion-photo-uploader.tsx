"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CompletionPhotoUploaderProps {
  bookingId: string;
  userId: string;
}

export function CompletionPhotoUploader({ bookingId, userId }: CompletionPhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const file = files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/${bookingId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("completion_photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("completion_photos")
        .getPublicUrl(filePath);

      setPhotoUrls((prev) => [...prev, data.publicUrl]);
      toast.success("Job completion photo uploaded!");
    } catch (err: any) {
      toast.error("Upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-border/50 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm">Job Completion Proof (Before / After Photos)</h4>
          <p className="text-xs text-muted-foreground">Upload photos showing completed work before closing booking.</p>
        </div>

        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-owl-violet text-white text-xs font-bold rounded-xl hover:bg-owl-violet-dark transition-all">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            Upload Photo
          </span>
        </label>
      </div>

      {photoUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-3 pt-2">
          {photoUrls.map((url, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden aspect-square border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Completion proof ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
