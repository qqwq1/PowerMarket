import { CSSProperties, PropsWithChildren } from 'react'
import css from './dropdownFadeInPanel.module.css'
import FadeInPanel from '@/shared/Animated/FadeInPanel'
import cn from '@/utils/cn.ts'

interface IProps {
  open: boolean
  style?: CSSProperties
  // default left
  position?: 'right' | 'left'
  onClick?: () => void
}

/** !Панель позиционируется абсолютно */
const DropdownFadeInPanel = (props: PropsWithChildren<IProps>) => {
  return (
    <FadeInPanel
      open={props.open}
      onClick={props.onClick}
      className={cn({
        [css.wrapper]: true,
        [css.wrapperRight]: props.position === 'right',
        [css.wrapperLeft]: props.position !== 'right',
      })}
      style={{ overflowY: 'auto', scrollbarWidth: 'thin', width: '100%', ...(props.style || {}) }}
    >
      {props.children}
    </FadeInPanel>
  )
}

export default DropdownFadeInPanel
