import css from './closeButton.module.css'
import CloseIcon from '../../../assets/icons/close.svg?react'
import { CSSProperties, MouseEvent } from 'react'

interface IProps {
  onClick: (ev: MouseEvent<HTMLDivElement>) => void
  style?: CSSProperties
  iconStyle?: CSSProperties
}

const CloseButton = (props: IProps) => {
  return (
    <div className={css.wrapper} onClick={props.onClick} style={props.style}>
      <CloseIcon className={css.icon} style={props.iconStyle} />
    </div>
  )
}

export default CloseButton
