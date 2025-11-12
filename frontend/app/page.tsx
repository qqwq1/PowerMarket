import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Factory, Search, MessageSquare, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
              Платформа аренды производственных мощностей
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance mb-8">
              Эффективное решение для сведения предприятий и передачи в аренду производственных мощностей
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Начать работу</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Войти</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-16 md:py-24 bg-muted/50">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Возможности платформы</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <Factory className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Управление услугами</h3>
                <p className="text-muted-foreground">
                  Размещайте свои производственные мощности и управляйте доступностью
                </p>
              </Card>
              <Card className="p-6">
                <Search className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Поиск и аренда</h3>
                <p className="text-muted-foreground">
                  Находите необходимые производственные мощности и отправляйте запросы на аренду
                </p>
              </Card>
              <Card className="p-6">
                <MessageSquare className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Коммуникация</h3>
                <p className="text-muted-foreground">Общайтесь с партнерами напрямую через встроенную систему чатов</p>
              </Card>
              <Card className="p-6">
                <Shield className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Безопасность</h3>
                <p className="text-muted-foreground">
                  Защищенная платформа с проверкой предприятий и безопасными транзакциями
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Готовы начать?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Присоединяйтесь к платформе и начните эффективно использовать производственные мощности
            </p>
            <Button size="lg" asChild>
              <Link href="/register">Зарегистрироваться</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2025 PowerMarket. Все права защищены.
        </div>
      </footer>
    </div>
  )
}
