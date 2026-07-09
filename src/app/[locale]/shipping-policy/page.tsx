import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy - ErrandOwl",
  description: "Read the ErrandOwl Shipping and Delivery Policy.",
};

export default function ShippingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h1 className="text-3xl font-bold mb-2">Shipping Policy</h1>
            <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-sm max-w-none space-y-6">
              <section>
                <h2 className="text-lg font-semibold mb-2">1. Digital Delivery Only</h2>
                <p className="text-muted-foreground leading-relaxed">
                  ErrandOwl (a product of TechyDez) operates as a digital platform and software service. All features, access, and service provisions granted through our platform are 100% digital.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  <strong>We do not sell, ship, or deliver any physical goods.</strong> Therefore, no physical shipping takes place. 
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-2">2. Instant Access</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Upon successful payment or subscription via our payment gateways, access to the respective digital features on your ErrandOwl account is granted instantly. You will receive an email confirmation of your transaction.
                </p>
              </section>
              
              <section className="mt-8 border-t border-border/50 pt-8">
                <h3 className="font-medium text-foreground mb-2">Contact Us</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If you experience any issues accessing your digital purchase, please contact us immediately:
                  <br /><br />
                  <strong>Phone:</strong> <a href="tel:+447517879333" className="text-owl-violet hover:underline">+447517879333</a><br />
                  <strong>Email:</strong> <a href="mailto:hello@techydez.com" className="text-owl-violet hover:underline">hello@techydez.com</a><br />
                  <strong>Address:</strong> Jhelum, Punjab, Pakistan
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
