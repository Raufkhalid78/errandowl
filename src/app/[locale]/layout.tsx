import type { Metadata } from "next";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const urduFont = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  display: "swap",
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Common' });
  
  return {
    title: {
      default: `${t('title')} — ${t('tagline')}`,
      template: `%s | ${t('title')}`,
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
      title: `${t('title')} — ${t('tagline')}`,
      description:
        "Your trusted marketplace for everyday tasks. Connect with skilled taskers across Pakistan.",
      siteName: t('title'),
      locale: locale === 'ur' ? 'ur_PK' : 'en_PK',
      type: "website",
    },
    icons: {
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦉</text></svg>",
    },
    manifest: "/manifest.json",
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const isRtl = locale === 'ur';

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} className={`${inter.variable} ${urduFont.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className={`min-h-full flex flex-col ${isRtl ? 'font-urdu' : 'font-sans'}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster richColors position="top-center" />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
