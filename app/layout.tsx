// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Imperium Sports',
    description: 'Marketplace de bicicletas e esportes',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <html lang="pt-BR">
            <body className="bg-[#1E1F22] text-[#EFEDE6]">
            {children}
            </body>
            </html>
        </ClerkProvider>
    )
}