import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@jisp/ui";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSupabaseServerReadClient } from "@/lib/supabase";
import { fetchSiteSettings } from "@jisp/database";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "JISP — Journey in Sculpture",
    template: "%s | JISP",
  },
  description:
    "JISP (Journey in Sculpture) — considered, structural clothing for people in motion. Wear Your Journey.",
  openGraph: {
    title: "JISP — Journey in Sculpture",
    description: "Sculpted for the Journey.",
    siteName: "JISP",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;
  try {
    const supabase = getSupabaseServerReadClient();
    settings = await fetchSiteSettings(supabase);
  } catch {
    settings = null;
  }

  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-jisp-white focus:p-3"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer
            instagramUrl={settings?.instagram_url}
            whatsappUrl={settings?.whatsapp_url}
            contactEmail={settings?.contact_email}
            footerContent={settings?.footer_content}
          />
        </ToastProvider>
      </body>
    </html>
  );
}
