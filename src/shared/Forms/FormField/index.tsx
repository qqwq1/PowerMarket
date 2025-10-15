import cn from '@/utils/cn'
import { CSSProperties, PropsWithChildren, ReactNode } from 'react'

interface IProps {
  label: string | ReactNode
  type?: 'normal' | 'description'
  required?: boolean
  fullWidth?: boolean
  style?: CSSProperties
}

const FormField = (props: PropsWithChildren<IProps>) => {
  return (
    <div className={cn('flex-lines gap4', { width100: props.fullWidth })} style={props.style}>
      <div className="inline-flex-gap gap4">
        <p
          className={`text-nm ${props.type === 'description' ? 'text-description' : ''}`}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {props.label}
        </p>
        {props.required && <p className="text-nm text-error">*</p>}
      </div>
      {props.children}
    </div>
  )
}

export default FormField
