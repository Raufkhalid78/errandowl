"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Trash2, Image as ImageIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

interface PortfolioItem {
  id: string
  image_url: string
  description: string
}

export function PortfolioManager({ taskerId, initialItems }: { taskerId: string, initialItems?: PortfolioItem[] }) {
  const items = initialItems || []
  const isLoading = false
  const [isUploading, setIsUploading] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const t = useTranslations("PortfolioManager")

  const refreshData = () => {
    router.refresh()
  }

  // Data is fetched via RSC

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert("You must be logged in to upload files.")
      setIsUploading(false)
      return
    }
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${taskerId}-${crypto.randomUUID()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Upload image
    const { error: uploadError } = await supabase.storage
      .from('portfolios')
      .upload(filePath, file)

    if (uploadError) {
      alert(t("errorUpload"))
      setIsUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('portfolios')
      .getPublicUrl(filePath)

    // Insert record
    await supabase.from("portfolio_items").insert({
      tasker_id: taskerId,
      image_url: publicUrl,
      description: "Portfolio Image"
    })

    refreshData()
    setIsUploading(false)
  }

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm(t("confirmDelete"))) return
    
    const { data: { user } } = await supabase.auth.getUser()
    // Attempt to extract filename from URL to delete from storage as well
    const fileName = imageUrl.split('/').pop()
    if (fileName && user) {
      await supabase.storage.from('portfolios').remove([`${user.id}/${fileName}`])
    }

    await supabase.from("portfolio_items").delete().eq("id", id)
    refreshData()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("title")}</h3>
        <div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {t("addImage")}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="border border-dashed rounded-xl p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
          <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
          <p className="text-sm">{t("emptyState")}</p>
          <p className="text-xs mt-1">{t("emptySub")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_url} alt={t("altImg")} className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => handleDelete(item.id, item.image_url)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
