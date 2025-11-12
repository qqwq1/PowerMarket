"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, Search, FileText, MessageSquare, Bell, Settings, Users } from "lucide-react"

interface SidebarProps {
  role: "ADMIN" | "SUPPLIER" | "TENANT"
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const supplierLinks = [
    { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
    { href: "/services", label: "Мои услуги", icon: Package },
    { href: "/rental-requests", label: "Запросы", icon: FileText },
    { href: "/rentals", label: "Аренды", icon: FileText },
    { href: "/chats", label: "Чаты", icon: MessageSquare },
    { href: "/notifications", label: "Уведомления", icon: Bell },
    { href: "/settings", label: "Настройки", icon: Settings },
  ]

  const tenantLinks = [
    { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
    { href: "/search", label: "Поиск услуг", icon: Search },
    { href: "/my-requests", label: "Мои запросы", icon: FileText },
    { href: "/rentals", label: "Аренды", icon: FileText },
    { href: "/chats", label: "Чаты", icon: MessageSquare },
    { href: "/notifications", label: "Уведомления", icon: Bell },
    { href: "/settings", label: "Настройки", icon: Settings },
  ]

  const adminLinks = [
    { href: "/dashboard", label: "Главная", icon: LayoutDashboard },
    { href: "/users", label: "Пользователи", icon: Users },
    { href: "/services", label: "Услуги", icon: Package },
    { href: "/rentals", label: "Аренды", icon: FileText },
    { href: "/settings", label: "Настройки", icon: Settings },
  ]

  const links = role === "ADMIN" ? adminLinks : role === "SUPPLIER" ? supplierLinks : tenantLinks

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card">
      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
