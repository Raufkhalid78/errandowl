import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { format } from "date-fns"


export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, tasker:tasker_id(name, hourly_rate), client:client_id(name, address), payments(amount, tip_amount, created_at, method)")
    .eq("id", id)
    .single()

  if (!booking) redirect("/dashboard/bookings")

  const payment = booking.payments?.[0]
  const invoiceDate = payment?.created_at ? format(new Date(payment.created_at), "PPP") : format(new Date(), "PPP")

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black min-h-screen">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold text-owl-violet">ErrandOwl</h1>
          <p className="text-sm text-gray-500 mt-1">Marketplace Invoice</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold text-gray-800">INVOICE</h2>
          <p className="text-sm text-gray-500 mt-1">#{booking.id.split("-")[0].toUpperCase()}</p>
          <p className="text-sm text-gray-500">Date: {invoiceDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
          <p className="font-medium text-gray-800">{booking.client?.name || "Client"}</p>
          <p className="text-sm text-gray-500 mt-1">{booking.client?.address || "Address on File"}</p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Service Provider</h3>
          <p className="font-medium text-gray-800">{booking.tasker?.name || "Tasker"}</p>
        </div>
      </div>

      <table className="w-full mb-12">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 text-sm font-bold text-gray-600 uppercase">Description</th>
            <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-4">
              <p className="font-medium text-gray-800">{booking.service_name || "Task Service"}</p>
              <p className="text-sm text-gray-500">{booking.description}</p>
              <p className="text-xs text-gray-400 mt-1">Date: {booking.date}</p>
            </td>
            <td className="py-4 text-right font-medium text-gray-800">
              Rs {booking.total_cost?.toLocaleString() || 0}
            </td>
          </tr>
          {payment?.tip_amount > 0 && (
            <tr className="border-b border-gray-100">
              <td className="py-4 text-gray-600">Tasker Tip</td>
              <td className="py-4 text-right font-medium text-gray-800">Rs {payment.tip_amount.toLocaleString()}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>Rs {booking.total_cost?.toLocaleString() || 0}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Platform Fee (0%)</span>
            <span>Rs 0</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-gray-800 border-t border-gray-200 pt-3">
            <span>Total Paid</span>
            <span>Rs {((booking.total_cost || 0) + (payment?.tip_amount || 0)).toLocaleString()}</span>
          </div>
          <p className="text-xs text-right text-gray-500 mt-1">Paid via {payment?.method || "PayFast"}</p>
        </div>
      </div>

      {/* Print Button - Hidden when printing */}
      <div className="text-center print:hidden">
        <button 
          id="print-btn"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-owl-violet text-white shadow hover:bg-owl-violet-dark h-9 px-4 py-2"
          dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Print Invoice` }}
        />
      </div>
      
      {/* Script for the onclick handler since it's a server component */}
      <script dangerouslySetInnerHTML={{ __html: `
        const btn = document.getElementById('print-btn');
        if (btn) {
          btn.onclick = (e) => { e.preventDefault(); window.print(); }
        }
      `}} />
    </div>
  )
}
