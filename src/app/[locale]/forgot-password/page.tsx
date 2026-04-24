import { Link } from "@/i18n/routing";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24 flex items-center justify-center py-16">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">🦉</span>
            <h1 className="text-2xl font-bold">Reset Your Password</h1>
            <p className="text-sm text-muted-foreground mt-2">Enter your email and we&apos;ll send you a reset link.</p>
          </div>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <input type="email" required placeholder="name@example.com" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-background focus:border-owl-violet focus:outline-none" />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-owl-violet text-white font-medium hover:bg-owl-violet-dark transition-colors">Send Reset Link</button>
          </form>
          <p className="text-center text-sm mt-6">
            <Link href="/login" className="text-owl-violet hover:underline">← Back to Login</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
