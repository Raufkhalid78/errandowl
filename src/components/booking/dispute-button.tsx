"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { DisputeModal } from "./dispute-modal"
import { useTranslations } from "next-intl"

interface DisputeButtonProps {
  bookingId: string
  userId: string
  status: string
}

export function DisputeButton({ bookingId, userId, status }: DisputeButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const t = useTranslations("Disputes")

  // Only allow disputes on active or recently completed bookings
  if (status === "pending" || status === "cancelled") {
    return null
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={() => setIsOpen(true)}
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        {t("raiseDispute")}
      </Button>
      
      {isOpen && (
        <DisputeModal 
          bookingId={bookingId} 
          userId={userId} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  )
}
