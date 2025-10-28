import AttachmentIcon from '../../../../assets/icons/attachment.svg?react'
import domUtils from '../../../../utils/dom.utils.ts'
import TrashIcon from '../../../../assets/icons/trash.svg?react'
import css from './attachmentLine.module.css'
import { memo } from 'react'

interface IProps {
  index: number
  file: File
  onDelete?: (index: number) => void
}

const AttachmentLine = (props: IProps) => {
  return (
    <div className={`${css.wrapper} inline-flex-gap gap16 width100 flex-space-between center`}>
      <div className="inline-flex-gap gap8 center">
        <AttachmentIcon className="text-secondary" />
        <p
          className="text-nm text-primary"
          style={{ cursor: 'pointer' }}
          onClick={() => domUtils.openLink(URL.createObjectURL(props.file))}
        >
          {props.file.name}
        </p>
      </div>
      <TrashIcon className={css.icon} onClick={() => props.onDelete(props.index)} style={{ cursor: 'pointer' }} />
    </div>
  )
}

export default memo(AttachmentLine)
