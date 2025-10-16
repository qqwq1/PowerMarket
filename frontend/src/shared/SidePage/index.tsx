import { createPortal } from 'react-dom'
import { CSSProperties, PropsWithChildren } from 'react'
import css from './sidePage.module.css'
import CloseButton from '../Buttons/CloseButton'
import { animated, easings, useTransition } from '@react-spring/web'
import { UseTransitionProps } from '@react-spring/core'

interface IProps {
  onCloseAnimationEnd?: () => void
  onClose: () => void
  open: boolean
  style?: CSSProperties
  size?: 'default' | 'large'
}

const SidePage = (props: PropsWithChildren<IProps>) => {
  const transitions = useTransition(props.open, {
    from: { right: '-100%' },
    enter: { right: '0%' },
    leave: { right: '-100%' },
    config: {
      duration: 250,
      easing: easings.easeInOutCubic,
    },
    onDestroyed: (i, k) => {
      if (i && k && props.onCloseAnimationEnd) {
        props.onCloseAnimationEnd()
      }
    },
  } as UseTransitionProps)

  const body = document.getElementsByTagName('body')[0]

  const renderContent = () => {
    return transitions((style: any, item) => {
      if (!item) return null

      return (
        <animated.div data-size={props.size} className={css.sidePage} style={{ ...(props.style || {}), ...style }}>
          <div className={css.closeIconWrapper}>
            <CloseButton onClick={props.onClose} iconStyle={{ color: 'var(--text-description)' }} />
          </div>
          <>{props.children}</>
        </animated.div>
      )
    })
  }

  // в случае если родительский контейнер компонента имеет css трансформацию, то она
  // будет нарушать позиционирование модального окна, поэтому выносим его из текущего
  // положения в дереве в <body> при помощи portals
  return createPortal(renderContent(), body)
}

export default SidePage
