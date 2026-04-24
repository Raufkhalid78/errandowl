"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function CheckoutForm({ bookingId, amount }: { bookingId: string, amount: number }) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const supabase = createClient()

  const handlePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Call the Supabase Edge Function to initiate PayFast checkout
      const { data, error: fnError } = await supabase.functions.invoke("payfast-checkout", {
        body: { bookingId, amount },
      })

      if (fnError) {
        throw new Error(fnError.message || "Failed to initialize payment")
      }

      if (data?.url) {
        // Redirect to PayFast checkout page
        window.location.href = data.url
      } else {
        throw new Error("No payment URL returned")
      }
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <CardDescription>
          Booking ID: {bookingId.slice(0, 8)}...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center py-4 border-b border-t mb-4">
          <span className="font-medium">Total Amount Due</span>
          <span className="text-2xl font-bold">Rs. {amount.toLocaleString()}</span>
        </div>
        {error && <div className="text-sm text-red-500 font-medium mb-4">{error}</div>}
      </CardContent>
      <CardFooter>
        <Button onClick={handlePayment} disabled={isLoading} className="w-full h-12 text-lg">
          {isLoading && (
            <svg
              className="mr-2 h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          Pay with PayFast
        </Button>
      </CardFooter>
    </Card>
  )
}
