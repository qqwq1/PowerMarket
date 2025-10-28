import { IFileValidation, IValidateFilesResult } from './files.types'

const validateFile = (file: File, mbyteLimit: number, allowedTypes?: string[], allowedExtensions?: string[]) => {
  const validation: IFileValidation = { errors: [], file }

  if (file.size / 1024 / 1024 > mbyteLimit) {
    validation.errors.push(`Размер файла не должен превышать ${mbyteLimit}МБ`)
  }

  if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    validation.errors.push('Не разрешенный формат файла')
  }

  if (allowedExtensions && allowedExtensions.length > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !allowedExtensions.includes(ext)) {
      validation.errors.push(`Файл с расширением ".${ext}" не разрешён`)
    }
  }

  return validation
}

const validateFiles = (
  files: FileList,
  eachFileMbyteLimit: number,
  allowedTypes?: string[],
  allowedExtensions?: string[]
): IValidateFilesResult => {
  const validatedFiles = [...files]
    .filter(Boolean)
    .map((item) => validateFile(item, eachFileMbyteLimit, allowedTypes, allowedExtensions))

  const correctFiles: IFileValidation[] = []
  const incorrectFiles: IFileValidation[] = []

  validatedFiles.forEach((file) => {
    if (file.errors.length > 0) {
      incorrectFiles.push(file)
    } else {
      correctFiles.push(file)
    }
  })

  return { correctFiles, incorrectFiles }
}

const humanFileSize = (size: number) => {
  if (size === 0) return '0 kB'

  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024))
  return +(size / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
}

const filesUtils = { validateFiles, validateFile, humanFileSize }
export default filesUtils
