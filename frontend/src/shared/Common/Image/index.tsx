import { CSSProperties, useEffect, useRef, useState } from 'react'
import css from './image.module.css'

interface IProps {
  src: string
  className?: string
  style?: CSSProperties
  alt: string

  wrapperStyle?: CSSProperties
  wrapperClassname?: string
  onClick?: () => void
  loading?: boolean
  loader?: React.ReactNode
}

const Image = (props: IProps) => {
  const ref = useRef<HTMLImageElement>(null)
  const [loading, setLoading] = useState(Boolean(props.src))
  const [error, setError] = useState(!Boolean(props.src))

  useEffect(() => {
    setError(!Boolean(props.src))
  }, [props.src])

  const handleError = () => {
    setError(true)
    setLoading(false)
  }

  const normalizedStyle = props.style || {}
  if (error) normalizedStyle.padding = '20%'

  const loader = <div className={css.loader}>{props.loader || 'Загрузка...'}</div>

  return (
    <div
      className={`${css.wrapper} ${props.wrapperClassname || ''}`}
      style={props.wrapperStyle}
      onClick={props.onClick}
    >
      {(props.loading || loading) && loader}
      <img
        ref={ref}
        alt={error ? 'Изображение не найдено' : props.alt}
        style={{ objectPosition: 'center', objectFit: 'contain', ...normalizedStyle }}
        src={error ? null : props.src}
        className={props.className}
        key={error ? 1 : 0}
        onLoad={() => setLoading(false)}
        onError={handleError}
      />
    </div>
  )
}

export default Image
