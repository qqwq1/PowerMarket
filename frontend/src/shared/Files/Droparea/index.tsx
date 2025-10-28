import { CSSProperties, DragEventHandler, ReactNode } from 'react'
import css from './dropArea.module.css'

interface IDropAreaProps {
  isActive: boolean
  onDrop: DragEventHandler<HTMLDivElement>
  onDragEnter: DragEventHandler<HTMLDivElement>
  onDragLeave: DragEventHandler<HTMLDivElement>
  onDragOver: DragEventHandler<HTMLDivElement>
  children: ReactNode
  style?: CSSProperties
}

const DropArea = ({ isActive, children, style, ...bound }: IDropAreaProps) => {
  return (
    <div style={{ ...(style || {}), position: 'relative' }} {...bound}>
      {isActive && (
        <div className={css.visualDropArea}>
          <p className="text-nm text-primary">Отпустите файлы</p>
        </div>
      )}
      {children}
    </div>
  )
}

export default DropArea
