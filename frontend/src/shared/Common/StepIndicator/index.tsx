import css from './stepIndicator.module.css'
import StepPassedIcon from '../../../assets/icons/checked.svg?react'
import cn from '../../../utils/cn'
import { Fragment } from 'react'

interface IProps {
  stepNames: string[]
  activeStepIndex: number
}

const StepIndicator = (props: IProps) => {
  const renderStepElement = (name: string, index: number) => {
    const isStepPassed = props.activeStepIndex > index
    return (
      <Fragment key={index}>
        <div
          className={cn('inline-flex-gap gap8', css.step)}
          data-active={index === props.activeStepIndex}
          data-step-passed={isStepPassed}
        >
          <div className={css.stepIconWrapper}>
            {isStepPassed ? (
              <StepPassedIcon height={16} width={16} color="var(--primary)" />
            ) : (
              <span className={cn('text-nm', css.stepIconText)}>{index + 1}</span>
            )}
          </div>
          {name && <p className={cn('text-nm', css.stepName)}>{name}</p>}
        </div>
        {index + 1 !== props.stepNames.length && <div className={css.stepTail}></div>}
      </Fragment>
    )
  }

  return <div className={css.wrapper}>{props.stepNames.map(renderStepElement)}</div>
}

export default StepIndicator
