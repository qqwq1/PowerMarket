'use client'

import { type ChangeEvent, useState } from 'react'
import { ExternalLink, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

const FILE_NAME = 'PowerMarket_agreement.pdf'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['.sig', '.p7s', '.xml', '.pdf']

// Use local public file instead of API endpoint
const CONTRACT_URL = `/${FILE_NAME}`

type UploadResponse = {
  validResult: boolean
  message: string
  timestamp: string
  filename: string
  fileSize: number
  fileType: string
}

interface RentalContractModalProps {
  open: boolean
  rentalId: string
  onOpenChange: (open: boolean) => void
  onSuccess: () => void | Promise<void>
}

export function RentalContractModal({ open, rentalId, onOpenChange, onSuccess }: RentalContractModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const resetState = () => {
    setFile(null)
    setError(null)
    setUploading(false)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null
    if (!nextFile) {
      setFile(null)
      return
    }

    const lowerName = nextFile.name.toLowerCase()
    const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))

    if (!hasAllowedExtension) {
      setError('Поддерживаются файлы .sig, .p7s, .xml, .pdf')
      setFile(null)
      return
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      setError('Файл не должен превышать 5 МБ')
      setFile(null)
      return
    }

    setError(null)
    setFile(nextFile)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Выберите файл для загрузки')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      await api.request<UploadResponse>(`/v1/contracts/${rentalId}/signature`, {
        method: 'POST',
        body: formData,
      })

      await onSuccess?.()
      onOpenChange(false)
      resetState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить файл')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async () => {
    // Previously we fetched the contract from API. That logic is commented out
    // to prefer the locally served file in `public/PowerMarket_agreement.pdf`.
    /*
    const downloadUrl = `${API_BASE_URL}/v1/contracts/download/${FILE_NAME}`
    try {
      const token = localStorage.getItem('jwt_token')
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(downloadUrl, { headers })
      if (!res.ok) throw new Error('Не удалось скачать договор')

      const blob = await res.blob()
      // ... old handling ...
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось скачать договор')
    }
    */

    try {
      // Trigger download from the public folder
      const a = document.createElement('a')
      a.href = CONTRACT_URL
      a.download = FILE_NAME
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось скачать договор')
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подписание договора</DialogTitle>
          <DialogDescription>Скачайте договор, подпишите и загрузите файл с подписью.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <a
                href={CONTRACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Открыть договор (PDF)
              </a>
            </Button>

            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Скачать договор (PDF)
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-file">Файл с подписью</Label>
            <Input id="contract-file" type="file" accept={ALLOWED_EXTENSIONS.join(',')} onChange={handleFileChange} />
            <p className="text-sm text-muted-foreground">
              Допустимые форматы: .sig, .p7s, .xml, .pdf. \n Размер файла — до 5 МБ.
            </p>
            {file && <p className="text-sm text-muted-foreground">Выбран файл: {file.name}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleUpload} disabled={uploading || !file} className="w-full">
            {uploading ? 'Отправка...' : 'Отправить файл'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
