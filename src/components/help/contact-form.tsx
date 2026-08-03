"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (message.trim().length < 10) {
      toast.error("Message must be at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      // Using `any` cast because contact_messages is added via migration and not yet reflected
      // in the auto-generated types. Re-run `supabase gen types` after applying the migration.
      const { error } = await (supabase as any).from("contact_messages").insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Message sent! We'll get back to you within 24 hours.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">✉️</div>
        <h2 className="text-lg font-bold mb-2">Message Received!</h2>
        <p className="text-sm text-muted-foreground">
          Thanks for reaching out. Our support team will reply to <strong>{email}</strong> within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-8">
      <h2 className="text-lg font-bold mb-1">Still Need Help?</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Send us a message and we&apos;ll get back to you within 24 hours.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="contact-name" className="text-sm font-medium">
              Your Name
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ali Khan"
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:border-owl-violet focus:outline-none focus:ring-2 focus:ring-owl-violet/20 transition-colors disabled:opacity-50"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contact-email" className="text-sm font-medium">
              Email Address
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ali@example.com"
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:border-owl-violet focus:outline-none focus:ring-2 focus:ring-owl-violet/20 transition-colors disabled:opacity-50"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or question..."
            rows={4}
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:border-owl-violet focus:outline-none focus:ring-2 focus:ring-owl-violet/20 transition-colors resize-none disabled:opacity-50"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-owl-violet text-white font-semibold hover:bg-owl-violet/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {loading ? "Sending..." : "Send Message"}
          </button>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="mailto:support@errandowl.com.pk" className="hover:text-owl-violet transition-colors">
              support@errandowl.com.pk
            </a>
            <span>·</span>
            <a href="tel:+923001234567" className="hover:text-owl-violet transition-colors">
              +92 300 1234567
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
