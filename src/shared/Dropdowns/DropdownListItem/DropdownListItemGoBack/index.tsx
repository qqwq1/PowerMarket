import GoBackIcon from '@/assets/icons/arrowLeft.svg?react'
import DropdownListItem from '@/shared/Dropdowns/DropdownListItem'
import { MouseEvent } from 'react'

interface IProps {
  text: string
  onClick: (ev: MouseEvent<HTMLDivElement>) => void
}

const DropdownListItemGoBack = (props: IProps) => {
  return (
    <DropdownListItem icon={<GoBackIcon className="text-default" />} onClick={props.onClick}>
      <p className="text-nm">{props.text}</p>
    </DropdownListItem>
  )
}

export default DropdownListItemGoBack
