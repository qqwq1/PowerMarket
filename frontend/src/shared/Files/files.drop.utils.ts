import { DragEvent } from 'react'

const extractFilesFromEvent = (ev: DragEvent<HTMLDivElement>): File[] => {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault()

  const files: File[] = []

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    ;[...ev.dataTransfer.items].forEach((item) => {
      // If dropped items aren't files, reject them
      if (item.kind === 'file') {
        const file = item.getAsFile()
        files.push(file)
      }
    })
  } else if (ev.dataTransfer.files) {
    // Use DataTransfer interface to access the file(s)
    ;[...ev.dataTransfer.files].forEach((file) => {
      files.push(file)
    })
  }

  return files
}

const filesDropUtils = { extractFilesFromEvent }
export default filesDropUtils
