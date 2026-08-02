"use client"

import * as React from "react"
import { useRouter } from "@/i18n/routing"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { getPricingSettings, type PricingSettings } from "@/lib/pricing"

export function BookingForm({ 
  categoryId, 
  userId,
  taskerId,
  taskerRate
}: { 
  categoryId: string; 
  userId: string;
  taskerId?: string;
  taskerRate?: number;
}) {
  const t = useTranslations("Booking")
  const tF = useTranslations("BookingForm")
  const [date, setDate] = React.useState<Date>()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [settings, setSettings] = React.useState<PricingSettings | null>(null)
  const [estimatedHours, setEstimatedHours] = React.useState<number>(2)
  const [recurrence, setRecurrence] = React.useState<string>("none")
  const [isEstimating, setIsEstimating] = React.useState(false)
  const [aiReasoning, setAiReasoning] = React.useState<string | null>(null)
  const [savedAddresses, setSavedAddresses] = React.useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>("new")
  const [newAddressText, setNewAddressText] = React.useState<string>("")
  
  const router = useRouter()
  const supabase = createClient()
  const descriptionRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    getPricingSettings().then(setSettings)
    
    // Fetch saved addresses
    async function fetchAddresses() {
      const { data } = await supabase.from("saved_addresses").select("*").eq("profile_id", userId).order("created_at", { ascending: false })
      if (data && data.length > 0) {
        setSavedAddresses(data)
        const def = data.find(a => a.is_default)
        if (def) setSelectedAddressId(def.id)
      }
    }
    fetchAddresses()
  }, [userId, supabase])

  const rateToUse = taskerRate || 1000 // default fallback
  const totalCost = rateToUse * estimatedHours

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!date) {
      setError(t("errorDate"))
      setIsLoading(false)
      return
    }

    const target = event.target as typeof event.target & {
      description: { value: string }
      time: { value: string }
    }

    const baseDate = new Date(`${format(date, "yyyy-MM-dd")}T${target.time.value}`)
    
    let addressToUse = newAddressText
    if (selectedAddressId !== "new") {
      const saved = savedAddresses.find(a => a.id === selectedAddressId)
      if (saved) addressToUse = saved.address
    }

    if (!addressToUse) {
      setError("Please provide an address.")
      setIsLoading(false)
      return
    }

    const baseBooking = {
      client_id: userId,
      category_id: categoryId,
      tasker_id: taskerId || null,
      description: target.description.value,
      address: addressToUse,
      estimated_hours: settings?.pricing_mode === 'hourly' ? estimatedHours : 1,
      pricing_mode: settings?.pricing_mode || 'hourly',
      recurrence_pattern: recurrence,
      status: "pending" as any,
    }

    const bookingsToInsert = []
    let occurrences = 1
    if (recurrence === 'weekly') occurrences = 4
    if (recurrence === 'biweekly') occurrences = 4
    if (recurrence === 'monthly') occurrences = 3

    for (let i = 0; i < occurrences; i++) {
      const scheduledAt = new Date(baseDate)
      if (recurrence === 'weekly') scheduledAt.setDate(scheduledAt.getDate() + (i * 7))
      if (recurrence === 'biweekly') scheduledAt.setDate(scheduledAt.getDate() + (i * 14))
      if (recurrence === 'monthly') scheduledAt.setMonth(scheduledAt.getMonth() + i)
      
      bookingsToInsert.push({
        ...baseBooking,
        scheduled_at: scheduledAt.toISOString()
      })
    }

    const { error: insertError } = await supabase
      .from("bookings")
      .insert(bookingsToInsert)

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push("/dashboard/bookings?message=Booking created successfully")
    router.refresh()
  }

  if (!settings) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin h-8 w-8 text-owl-violet" />
      </div>
    )
  }

  return (
    <Card className="glass">
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="description">{t('taskDescription')}</Label>
            <textarea
              id="description"
              ref={descriptionRef}
              required
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t('taskPlaceholder')}
            />
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  const desc = descriptionRef.current?.value
                  if (!desc || desc.length < 10) return alert(tF("errorShortDesc"))
                  
                  setIsEstimating(true)
                  try {
                    const res = await fetch("/api/estimate", {
                      method: "POST",
                      body: JSON.stringify({ description: desc })
                    })
                    const data = await res.json()
                    if (data.estimated_hours) setEstimatedHours(data.estimated_hours)
                    if (data.reasoning) setAiReasoning(data.reasoning)
                  } catch (e) {
                    console.error("Estimate failed", e)
                  }
                  setIsEstimating(false)
                }}
                disabled={isEstimating}
                className="text-xs h-8 gap-1 border-owl-violet/30 text-owl-violet hover:bg-owl-violet/10"
              >
                {isEstimating ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="text-base">✨</span>} 
                {isEstimating ? tF("analyzing") : tF("magicEstimate")}
              </Button>
            </div>
            {aiReasoning && (
              <p className="text-xs text-owl-violet bg-owl-violet/10 p-2 rounded-md italic">
                {tF("aiPrefix")} {aiReasoning}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>{t('location')}</Label>
            {savedAddresses.length > 0 && (
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
              >
                {savedAddresses.map(addr => (
                  <option key={addr.id} value={addr.id}>{addr.label} - {addr.address}</option>
                ))}
                <option value="new">New Address...</option>
              </select>
            )}
            
            {selectedAddressId === "new" && (
              <Input 
                id="location" 
                value={newAddressText}
                onChange={(e) => setNewAddressText(e.target.value)}
                required={selectedAddressId === "new"} 
                placeholder={t('locationPlaceholder')} 
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>{t('date')}</Label>
              <Popover>
                <PopoverTrigger render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>{t('pickDate')}</span>}
                  </Button>
                } />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="time">{t('time')}</Label>
              <Input id="time" required type="time" className="h-10" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="recurrence">{tF("recurrence")}</Label>
            <select
              id="recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="none">{tF("recNone")}</option>
              <option value="weekly">{tF("recWeekly")}</option>
              <option value="biweekly">{tF("recBiweekly")}</option>
              <option value="monthly">{tF("recMonthly")}</option>
            </select>
          </div>

          {settings.pricing_mode === 'hourly' && (
            <div className="grid gap-2">
              <Label htmlFor="estimated_hours">{t('estimatedHours')}</Label>
              <Input 
                id="estimated_hours" 
                required 
                type="number" 
                min="1" 
                max="24" 
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 1)}
                className="h-10" 
              />
            </div>
          )}

          {/* Cost Estimate Preview */}
          <div className="bg-muted p-4 rounded-xl flex items-center justify-between mt-2">
            <div>
              <p className="text-sm font-medium">{tF("estimatedCost")}</p>
              <p className="text-xs text-muted-foreground">
                {settings.pricing_mode === 'hourly' 
                  ? `${estimatedHours} hours × Rs ${rateToUse}/hr` 
                  : tF("fixedPrice")}
              </p>
            </div>
            <div className="text-xl font-bold text-owl-violet">
              Rs {totalCost.toLocaleString()}
            </div>
          </div>

          {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full bg-owl-violet hover:bg-owl-violet-dark text-white h-11">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {taskerId ? tF("confirmDirect") : tF("postOpen")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
