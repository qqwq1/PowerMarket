"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Building, FileText } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, token } = useAuth()

  useEffect(() => {
    if (!user || !token) {
      router.push("/login")
    }
  }, [user, token, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Профиль</h1>

          <div className="space-y-6">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Личная информация
                </CardTitle>
                <CardDescription>Ваши основные данные</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Полное имя</Label>
                    <Input value={user.fullName} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Роль</Label>
                  <div>
                    <Badge variant={user.role === "SUPPLIER" ? "default" : "secondary"}>
                      {user.role === "SUPPLIER" ? "Поставщик" : user.role === "TENANT" ? "Арендатор" : user.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Info Card */}
            {(user.companyName || user.inn) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Информация о компании
                  </CardTitle>
                  <CardDescription>Данные вашей организации</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {user.companyName && (
                      <div className="space-y-2">
                        <Label>Название компании</Label>
                        <Input value={user.companyName} disabled />
                      </div>
                    )}
                    {user.inn && (
                      <div className="space-y-2">
                        <Label>ИНН</Label>
                        <Input value={user.inn} disabled />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Действия с аккаунтом
                </CardTitle>
                <CardDescription>Управление вашим аккаунтом</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full bg-transparent" disabled>
                  Изменить пароль
                </Button>
                <Button variant="outline" className="w-full bg-transparent" disabled>
                  Редактировать профиль
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
