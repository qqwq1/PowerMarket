import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Factory, TrendingUp, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Factory className="h-6 w-6" />
              <span className="text-xl font-semibold">PowerMarket</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Войти</Button>
              </Link>
              <Link href="/register">
                <Button>Начать работу</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              Платформа аренды производственных мощностей
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
              Соединяем владельцев производственных мощностей с компаниями, которым нужны производственные ресурсы.
              Оптимизируйте операции и максимизируйте использование оборудования.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Арендовать мощности
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Сдать в аренду
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-lg">
                <div className="h-12 w-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Максимальная загрузка</h3>
                <p className="text-muted-foreground">
                  Превратите простаивающие производственные мощности в источник дохода с помощью нашей эффективной
                  платформы.
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg">
                <div className="h-12 w-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Безопасные сделки</h3>
                <p className="text-muted-foreground">
                  Встроенная система управления договорами и подтверждения сделок обеими сторонами.
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg">
                <div className="h-12 w-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Общение в реальном времени</h3>
                <p className="text-muted-foreground">
                  Встроенная система чатов для обсуждения условий и быстрого заключения соглашений.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2025 PowerMarket. Профессиональная платформа аренды производственных мощностей.
          </div>
        </footer>
      </div>
  )
}
