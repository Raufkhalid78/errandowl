"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, CreditCard, Loader2 } from "lucide-react"

import { useTranslations } from "next-intl"

export default function PaymentPage() {
  const t = useTranslations("Payment")
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  
  const bookingId = searchParams.get("booking") || "TEST-BOOKING-123"
  const amount = searchParams.get("amount") || "1000"

  const handleSimulatePayment = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      // Redirect to success verification page so that database updates are applied
      router.push(`/payment/success?basket_id=${bookingId}`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-owl-violet/20">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="w-16 h-16 bg-owl-violet/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-owl-violet" />
          </div>
          <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-background rounded-xl border p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{t("bookingRef")}</span>
              <span className="font-mono font-medium">{bookingId}</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span className="text-muted-foreground">{t("serviceFee")}</span>
              <span>Rs {parseInt(amount) * 0.1}</span>
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="font-medium">{t("totalAmount")}</span>
              <span className="text-2xl font-bold text-owl-violet">Rs {(parseInt(amount) * 1.1).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 bg-owl-amber/10 border border-owl-amber/20 rounded-xl flex gap-3 text-sm text-owl-amber">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <p>
              <strong>{t("demoNoticeTitle")}</strong> {t("demoNoticeText")}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pb-8">
          <Button 
            className="w-full h-12 text-base font-bold bg-owl-violet hover:bg-owl-violet-dark"
            onClick={handleSimulatePayment}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {t("payBtn")}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => router.back()}
            disabled={loading}
          >
            {t("cancelBtn")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
