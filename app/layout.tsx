import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Imperium Bikes",
  description: "Marketplace de Bicicletas",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <ClerkProvider>
        <html lang="pt-BR">
        <body>{children}</body>
        </html>
      </ClerkProvider>
  );
}