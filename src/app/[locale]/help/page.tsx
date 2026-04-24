import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Help Center", description: "Get help with ErrandOwl — FAQs, contact support, and troubleshooting guides." };

const faqSections = [
  {
    title: "For Clients",
    items: [
      { q: "How do I book a task?", a: "Browse services or search for taskers, select one that fits your needs, fill in the details (date, time, location, description), and submit your booking request." },
      { q: "How much does it cost?", a: "Each tasker sets their own hourly rate. A 10% service fee is added to cover platform costs and insurance. You can compare rates before booking." },
      { q: "What if I'm not satisfied?", a: "We have a Happiness Pledge. Contact our support team within 48 hours and we'll work to make it right, including re-doing the task or providing a refund." },
      { q: "How do payments work?", a: "Payments are processed securely via PayFast. We support JazzCash, EasyPaisa, and bank transfers. You're only charged when the task is completed." },
      { q: "Can I cancel a booking?", a: "Yes, you can cancel a booking up to 2 hours before the scheduled time at no charge. Late cancellations may incur a small fee." },
    ],
  },
  {
    title: "For Taskers",
    items: [
      { q: "How do I become a tasker?", a: "Click 'Become a Tasker', create an account, complete the CNIC verification, and set up your profile with skills and rates." },
      { q: "How much can I earn?", a: "You keep 85% of every task. Earnings depend on your hourly rate, number of tasks, and reviews. Top taskers earn Rs 50,000+ per month." },
      { q: "When do I get paid?", a: "Payments are released within 24 hours of task completion and deposited to your registered account via PayFast." },
      { q: "How do reviews work?", a: "Clients rate your work after completion. Higher ratings lead to more visibility and bookings." },
    ],
  },
  {
    title: "Account & Security",
    items: [
      { q: "How do I reset my password?", a: "Click 'Forgot Password' on the login page. Enter your email and we'll send you a reset link." },
      { q: "Is my data secure?", a: "Yes. We use industry-standard encryption and follow best practices for data security. See our Privacy Policy for details." },
      { q: "How do I delete my account?", a: "Contact our support team at support@errandowl.com.pk and we'll process your account deletion within 48 hours." },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="relative py-16 gradient-hero overflow-hidden">
          <div className="hero-orb hero-orb-1 opacity-20" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Help <span className="gradient-text">Center</span>
            </h1>
            <p className="text-white/60 text-lg">Find answers to your questions</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-12">
            {faqSections.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                <div className="space-y-3">
                  {section.items.map((faq, i) => (
                    <details key={i} className="group rounded-xl border border-border/50 overflow-hidden">
                      <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm hover:bg-muted/50 transition-colors">
                        {faq.q}
                        <span className="ml-4 text-owl-violet text-lg group-open:rotate-45 transition-transform">+</span>
                      </summary>
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
                    </details>
                  ))}
                </div>
              </div>
            ))}

            {/* Contact */}
            <div className="glass-card rounded-2xl p-8 text-center">
              <h2 className="text-lg font-bold mb-2">Still need help?</h2>
              <p className="text-sm text-muted-foreground mb-4">Our support team is here to assist you.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
                <a href="mailto:support@errandowl.com.pk" className="px-6 py-3 rounded-xl bg-owl-violet text-white hover:bg-owl-violet-dark transition-colors">
                  Email Support
                </a>
                <a href="tel:+923001234567" className="px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors">
                  Call: +92 300 1234 567
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
