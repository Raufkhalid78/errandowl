"use client";

import { Link } from "@/i18n/routing";
import { XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <XCircle className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        We couldn&apos;t process your payment. This might be due to a technical issue or insufficient funds. Please try again or use a different payment method.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          render={<Link href="/dashboard/book">Try Again</Link>}
          className="bg-owl-violet hover:bg-owl-violet-dark text-white px-8 h-12 rounded-xl"
        />
        <Button
          render={<Link href="/dashboard">Return to Dashboard</Link>}
          variant="outline"
          className="px-8 h-12 rounded-xl"
        />
      </div>
    </div>
  );
}
