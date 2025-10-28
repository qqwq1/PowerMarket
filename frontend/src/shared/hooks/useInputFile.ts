interface IProps {
  onFiles: (event: File[]) => void
  multiple?: boolean
  accept?: string
}

const useInputFile = (props: IProps) => {
  return () => {
    const input = document.createElement('input') as HTMLInputElement
    input.type = 'file'
    input.accept = props.accept ?? ''
    input.multiple = Boolean(props.multiple)
    input.onchange = (ev: Event) => {
      props.onFiles(Array.from((ev.currentTarget as HTMLInputElement).files || []))
      input.remove()
    }
    input.click()
  }
}

export default useInputFile
