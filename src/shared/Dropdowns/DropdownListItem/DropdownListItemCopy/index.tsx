import CopyIcon from '@/assets/icons/fileCopy.svg?react'
import DropdownListItem from '@/shared/Dropdowns/DropdownListItem'

interface IProps {
  text: string
  onClick: () => void
  disabled?: boolean
}

const DropdownListItemCopy = (props: IProps) => {
  return (
    <DropdownListItem
      icon={<CopyIcon className="text-default" style={{ width: '16px', height: '16px' }} />}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <p className="text-nm">{props.text}</p>
    </DropdownListItem>
  )
}

export default DropdownListItemCopy
