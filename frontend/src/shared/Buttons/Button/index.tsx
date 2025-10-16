import { ReactNode } from 'react'
import css from './button.module.css'

export interface IButtonProps {
  icon?: ReactNode
  size: 'large' | 'default' | 'small'
  type: 'primary' | 'default' | 'tetriary' | 'dim'
  ghost?: boolean
  isLink?: boolean
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  text?: string
  danger?: boolean
  onClick?: () => void
  buttonType?: 'submit' | 'reset' | 'button'
}

const Button = (props: IButtonProps) => {
  return (
    <button
      className={css.button}
      data-size={props.size}
      data-type={props.type}
      data-loading={Boolean(props.loading)}
      data-full-width={Boolean(props.fullWidth)}
      data-ghost={Boolean(props.ghost)}
      data-link={Boolean(props.isLink)}
      data-icon-only={Boolean(props.icon) && !Boolean(props.text)}
      data-danger={Boolean(props.danger)}
      disabled={Boolean(props.disabled)}
      onClick={props.onClick}
      type={props.buttonType || 'button'}
    >
      {props.icon || null}
      {props.text && (
        <span
          className={css.text}
          data-size={props.size}
          data-type={props.type}
          data-ghost={Boolean(props.ghost)}
          data-disabled={Boolean(props.disabled)}
        >
          {props.text}
        </span>
      )}
    </button>
  )
}

export default Button
