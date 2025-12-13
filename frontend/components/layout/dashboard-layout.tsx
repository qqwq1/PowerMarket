'use client'

import type React from 'react'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Factory, LayoutDashboard, Package, MessageSquare, LogOut, Menu, User, Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import urls from './urls'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Главная', href: urls.common.main, icon: Home },
    ...(user?.role === 'SUPPLIER'
      ? [
          { name: 'Мои услуги', href: urls.supplier.services, icon: Package },
          { name: 'Дашборды', href: urls.supplier.dashboard, icon: LayoutDashboard },
        ]
      : [{ name: 'Каталог', href: urls.tenant.catalog, icon: Package }]),
    { name: 'Аренды', href: urls.common.rentals, icon: Factory },
    { name: 'Чаты', href: urls.common.chats, icon: MessageSquare },
    { name: 'Профиль', href: urls.common.profile, icon: User },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Factory className="h-6 w-6" />
            <span className="text-xl font-semibold">PowerMarket</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm">
              <div className="font-medium">{user?.companyName || user?.email}</div>
              <div className="text-muted-foreground text-xs">
                {user?.role === 'SUPPLIER' ? 'Арендодатель' : 'Арендатор'}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 shrink-0">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      isActive ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <div
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                          isActive
                            ? 'bg-accent text-foreground font-medium'
                            : 'text-muted-foreground hover:bg-accent/50'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
