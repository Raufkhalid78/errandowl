import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ErrandOwl Pakistan — Get Things Done",
    template: "%s | ErrandOwl Pakistan",
  },
  description:
    "Connect with trusted, vetted professionals in Pakistan for cleaning, repairs, delivery, furniture assembly and more. Same-day availability in Karachi, Lahore, Islamabad.",
  keywords: [
    "tasker",
    "errand",
    "pakistan",
    "home services",
    "cleaning",
    "plumbing",
    "electrician",
    "karachi",
    "lahore",
    "islamabad",
  ],
  metadataBase: new URL("https://errandowl.com.pk"),
  openGraph: {
    title: "ErrandOwl Pakistan — Get Things Done",
    description:
      "Your trusted marketplace for everyday tasks. Connect with skilled taskers across Pakistan.",
    siteName: "ErrandOwl Pakistan",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ErrandOwl Pakistan — Get Things Done",
    description:
      "Your trusted marketplace for everyday tasks. Connect with skilled taskers across Pakistan.",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦉</text></svg>",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
