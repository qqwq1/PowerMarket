import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin", "cyrillic"] })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "PowerMarket - Платформа аренды производственных мощностей",
  description: "Профессиональная платформа для аренды производственных мощностей",
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
      <html lang="ru">
      <body className={inter.className}>
      <AuthProvider>{children}</AuthProvider>
      </body>
      </html>
  )
}
