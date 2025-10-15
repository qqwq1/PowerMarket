import SettingsIcon from '@/assets/icons/settingsIcon.svg?react'
import DropdownListItem from '@/shared/Dropdowns/DropdownListItem'

interface IProps {
  text: string
  onClick: () => void
  disabled?: boolean
}

const DropdownListItemSettings = (props: IProps) => {
  return (
    <DropdownListItem
      icon={<SettingsIcon className="text-default" />}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <p className="text-nm">{props.text}</p>
    </DropdownListItem>
  )
}

export default DropdownListItemSettings
