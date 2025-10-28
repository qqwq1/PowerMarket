export interface IFileValidation {
  errors: string[]
  file: File
}

export interface IValidateFilesResult {
  correctFiles: IFileValidation[]
  incorrectFiles: IFileValidation[]
}

export interface IFilesProps {
  files: File[]
  onFiles: (files: File[]) => void
  onDeleteFile: (file: File) => void
}
