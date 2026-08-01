"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, X } from "lucide-react"
import { useTranslations } from "next-intl"

interface DisputeModalProps {
  bookingId: string
  userId: string
  onClose: () => void
}

export function DisputeModal({ bookingId, userId, onClose }: DisputeModalProps) {
  const [reason, setReason] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const supabase = createClient()
  const t = useTranslations("Disputes")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError(t("errorReason"))
      return
    }

    setIsLoading(true)
    setError(null)

    // 1. Create dispute record
    const { data: dispute, error: disputeError } = await supabase
      .from("disputes")
      .insert({
        booking_id: bookingId,
        raised_by: userId,
        reason: reason
      })
      .select("id")
      .single()

    if (disputeError) {
      setError(disputeError.message)
      setIsLoading(false)
      return
    }

    // 2. Upload evidence if exists
    if (file && dispute) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${dispute.id}-${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('disputes')
        .upload(fileName, file)

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('disputes')
          .getPublicUrl(fileName)
          
        await supabase.from("dispute_evidence").insert({
          dispute_id: dispute.id,
          uploaded_by: userId,
          image_urls: [publicUrl],
          evidence_text: "Initial evidence"
        })
      }
    }

    setIsLoading(false)
    alert(t("successAlert"))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold text-lg">{t("raiseDisputeTitle")}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("reasonLabel")}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-xl border border-border bg-background focus:outline-none focus:border-owl-violet resize-none text-sm"
              placeholder={t("reasonPlaceholder")}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("evidenceLabel")}</label>
            <input 
              type="file" 
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-owl-violet/10 file:text-owl-violet hover:file:bg-owl-violet/20"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="w-full" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="destructive" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
