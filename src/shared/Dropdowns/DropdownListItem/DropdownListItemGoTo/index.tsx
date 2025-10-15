import GoToIcon from '@/assets/icons/goToLink.svg?react'
import DropdownListItem from '@/shared/Dropdowns/DropdownListItem'

interface IProps {
  text: string
  onClick: () => void
  disabled?: boolean
}

const DropdownListItemGoTo = (props: IProps) => {
  return (
    <DropdownListItem
      icon={<GoToIcon className="text-default" style={{ width: '16px', height: '16px' }} />}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <p className="text-nm">{props.text}</p>
    </DropdownListItem>
  )
}

export default DropdownListItemGoTo
