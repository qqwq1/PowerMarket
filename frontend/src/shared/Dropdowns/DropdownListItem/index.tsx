import cn from '@/utils/cn.ts'
import css from './dropdownListItem.module.css'
import { PropsWithChildren, ReactNode, MouseEvent, forwardRef, CSSProperties } from 'react'

interface IProps {
  icon?: ReactNode
  active?: boolean
  onClick?: (ev: MouseEvent<HTMLDivElement>) => void
  disabled?: boolean
  style?: CSSProperties
}

const DropdownListItem = forwardRef<HTMLDivElement, PropsWithChildren<IProps>>((props, ref) => {
  return (
    <div
      ref={ref}
      style={props.style}
      className={cn('inline-flex-gap gap8 width100 center', css.option)}
      data-active={Boolean(props.active)}
      data-disabled={Boolean(props.disabled)}
      onClick={props.disabled ? null : props.onClick}
    >
      {props.icon ?? null}
      {props.children}
    </div>
  )
})

export default DropdownListItem
