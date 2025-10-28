import { ChangeEvent, DragEventHandler, useRef, useState } from 'react'
import filesUtils from '../files.utils.ts'
import filesDropUtils from '../files.drop.utils.ts'
import useInputFile from '@/shared/hooks/useInputFile.ts'

const useInputAttachment = ({ onFiles }: { onFiles: (files: File[]) => void }) => {
  const dragCounter = useRef(0)
  const [over, setOver] = useState<boolean>(false)

  const handleFile = (ev: ChangeEvent<HTMLInputElement>) => {
    const { correctFiles, incorrectFiles } = filesUtils.validateFiles(ev.target.files, 50)

    onFiles(correctFiles.map((file) => file.file))

    if (incorrectFiles.length > 0) {
      alert(
        incorrectFiles
          .map((file) => `Файл с именем "${file.file.name}" не прошел валидацию: ${file.errors.join(', ')}`)
          .join('\n')
      )
    }
  }

  const handleDrop: DragEventHandler<HTMLDivElement> = (ev) => {
    const files = filesDropUtils.extractFilesFromEvent(ev)
    handleFile({ target: { files } } as any)
    setOver(false)
  }

  const handleDragEnter: DragEventHandler<HTMLDivElement> = () => {
    dragCounter.current++
    setOver(true)
  }

  const handleDragLeave: DragEventHandler<HTMLDivElement> = () => {
    dragCounter.current--
    if (!dragCounter.current) {
      setOver(false)
    }
  }

  const handleDragOver: DragEventHandler<HTMLDivElement> = (ev) => {
    ev.preventDefault()
  }

  const handleUpload = useInputFile({
    onFiles: (files) => {
      handleFile({ target: { files } } as any)
    },
    multiple: true,
  })

  return { over, handleDrop, handleDragEnter, handleDragLeave, handleDragOver, handleUpload } as const
}

export default useInputAttachment
