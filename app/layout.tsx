import type { Metadata } from "next";
import { AppPreferencesProvider } from "@/components/ui/AppPreferences";
import "./globals.css";

export const metadata: Metadata = {
  title: "MatchDay",
  description: "Demo match center with live-style football fixtures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" data-theme="dark">
      <body className="min-h-full flex flex-col">
        <AppPreferencesProvider>{children}</AppPreferencesProvider>
      </body>
    </html>
  );
}
