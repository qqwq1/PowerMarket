import { CSSProperties } from 'react'

interface IProps {
  className?: string
  style?: CSSProperties
}

const SeparateLine = (props: IProps) => {
  return (
    <div
      className={props.className}
      style={{
        height: '1px',
        width: '100%',
        borderTop: '1px solid var(--border-secondary-color)',
        flexShrink: 0,
        ...(props.style || {}),
      }}
    />
  )
}

export default SeparateLine
