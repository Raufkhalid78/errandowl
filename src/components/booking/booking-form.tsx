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
  const [date, setDate] = React.useState<Date>()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [settings, setSettings] = React.useState<PricingSettings | null>(null)
  const [estimatedHours, setEstimatedHours] = React.useState<number>(2)
  
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    getPricingSettings().then(setSettings)
  }, [])

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
      location: { value: string }
      time: { value: string }
    }

    const bookingData = {
      client_id: userId,
      category_id: categoryId,
      tasker_id: taskerId || null,
      description: target.description.value,
      location: target.location.value,
      date: format(date, "yyyy-MM-dd"),
      time: target.time.value,
      estimated_hours: settings?.pricing_mode === 'hourly' ? estimatedHours : 1,
      pricing_mode: settings?.pricing_mode || 'hourly',
      status: "pending",
    }

    const { error: insertError } = await supabase
      .from("bookings")
      .insert(bookingData)

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
              required
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t('taskPlaceholder')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">{t('location')}</Label>
            <Input id="location" required placeholder={t('locationPlaceholder')} />
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
              <p className="text-sm font-medium">Estimated Cost</p>
              <p className="text-xs text-muted-foreground">
                {settings.pricing_mode === 'hourly' 
                  ? `${estimatedHours} hours × Rs ${rateToUse}/hr` 
                  : "Fixed price task"}
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
            {taskerId ? "Confirm Direct Booking" : "Post Open Job"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
