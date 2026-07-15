import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@jisp/ui";

export const metadata: Metadata = {
  title: {
    default: "JISP Admin",
    template: "%s | JISP Admin",
  },
  description: "JISP Admin — manage products, orders, and content.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
