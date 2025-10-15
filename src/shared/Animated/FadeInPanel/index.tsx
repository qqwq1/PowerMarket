import { CSSProperties, PropsWithChildren, useRef } from 'react'
import { animated, easings, useTransition } from '@react-spring/web'
import { UseTransitionProps } from '@react-spring/core'

interface IProps {
  open: boolean
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

const FadeInPanel = (props: PropsWithChildren<IProps>) => {
  const contentRef = useRef<HTMLDivElement>(null)

  const transitions = useTransition(props.open, {
    from: { scale: 0.95, opacity: 0.1 },
    enter: { scale: 1, opacity: 1 },
    leave: { scale: 0.95, opacity: 0 },
    config: {
      duration: 100,
      easing: easings.easeInOutCubic,
    },
  } as UseTransitionProps)

  return transitions((style: any, item) => {
    if (!item) return null

    const normalizedExternalStyles = props.style || {}
    return (
      <animated.div
        className={props.className}
        style={{ ...normalizedExternalStyles, ...style }}
        ref={contentRef}
        onClick={props.onClick as any}
        data-open={props.open}
      >
        <>{props.children}</>
      </animated.div>
    )
  })
}

export default FadeInPanel
