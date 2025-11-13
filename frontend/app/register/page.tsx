"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Factory } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
    inn: "",
    phone: "",
    address: "",
    role: "TENANT" as "SUPPLIER" | "TENANT",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!/^\d{10}$|^\d{12}$/.test(formData.inn)) {
      setError("ИНН должен содержать 10 или 12 цифр")
      return
    }

    if (formData.password.length < 8) {
      setError("Пароль должен содержать минимум 8 символов")
      return
    }

    setLoading(true)

    try {
      await register(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации")
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                <Factory className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Создать аккаунт</CardTitle>
            <CardDescription>Присоединяйтесь к PowerMarket для аренды или размещения мощностей</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">ФИО *</Label>
                <Input
                    id="fullName"
                    placeholder="Иванов Иван Иванович"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    maxLength={200}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Название компании *</Label>
                  <Input
                      id="companyName"
                      placeholder="ООО Ваша Компания"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                      maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inn">ИНН *</Label>
                  <Input
                      id="inn"
                      placeholder="1234567890"
                      value={formData.inn}
                      onChange={(e) => setFormData({ ...formData, inn: e.target.value.replace(/\D/g, "") })}
                      required
                      maxLength={12}
                  />
                  <p className="text-xs text-muted-foreground">10 или 12 цифр</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                      id="phone"
                      type="tel"
                      placeholder="+79991234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль *</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Минимум 8 символов"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Адрес</Label>
                <Input
                    id="address"
                    placeholder="г. Москва, ул. Примерная, д. 1"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Тип аккаунта *</Label>
                <RadioGroup
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as "SUPPLIER" | "TENANT" })}
                >
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-3">
                    <RadioGroupItem value="TENANT" id="tenant" />
                    <Label htmlFor="tenant" className="flex-1 cursor-pointer">
                      <div className="font-medium">Арендатор</div>
                      <div className="text-sm text-muted-foreground">Я хочу арендовать мощности</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-3">
                    <RadioGroupItem value="SUPPLIER" id="landlord" />
                    <Label htmlFor="landlord" className="flex-1 cursor-pointer">
                      <div className="font-medium">Арендодатель</div>
                      <div className="text-sm text-muted-foreground">Я хочу сдавать свои мощности</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Создание аккаунта..." : "Создать аккаунт"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Уже есть аккаунт? </span>
              <Link href="/login" className="text-primary hover:underline">
                Войти
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
