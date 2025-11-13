"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api"
import type { Rental } from "@/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Star } from "lucide-react"

export default function CreateReviewPage() {
  const router = useRouter()
  const params = useParams()
  const rentalId = params.id as string
  const [rental, setRental] = useState<Rental | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")

  useEffect(() => {
    loadRental()
  }, [rentalId])

  const loadRental = async () => {
    try {
      const data = await api.get<Rental>(`/rentals/${rentalId}`)
      setRental(data)
    } catch (error) {
      console.error("Ошибка загрузки аренды:", error)
      alert("Не удалось загрузить аренду")
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert("Пожалуйста, выберите оценку")
      return
    }

    setSubmitting(true)
    try {
      await api.post("/reviews", {
        rentalId: Number.parseInt(rentalId),
        rating,
        comment: comment.trim() || undefined,
      })
      router.push("/dashboard/rentals")
    } catch (error) {
      console.error("Ошибка создания отзыва:", error)
      alert("Не удалось создать отзыв")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !rental) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Оставить отзыв</h1>
        <p className="text-muted-foreground mt-1">Поделитесь своим опытом аренды</p>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-1">{rental.service?.title}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(rental.startDate).toLocaleDateString("ru-RU")} -{" "}
            {new Date(rental.endDate).toLocaleDateString("ru-RU")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Оценка *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 && "Очень плохо"}
                {rating === 2 && "Плохо"}
                {rating === 3 && "Нормально"}
                {rating === 4 && "Хорошо"}
                {rating === 5 && "Отлично"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий (необязательно)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Расскажите о вашем опыте аренды..."
              rows={5}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting || rating === 0} className="flex-1">
              {submitting ? "Отправка..." : "Отправить отзыв"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
              Отмена
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
