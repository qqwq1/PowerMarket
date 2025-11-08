import locale from 'antd/locale/ru_RU'
import { ConfigProvider } from 'antd'
import { DatePicker } from 'antd'
import dayjs from 'dayjs'
import { CSSProperties, ReactNode } from 'react'

interface IProps {
  startTs: number
  endTs: number

  onChange: (startTs: number, endTs: number) => void

  withTime?: boolean
  disabled?: boolean
  allowSelectInFuture?: boolean
  open?: boolean
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
  className?: string
  panelStyle?: CSSProperties
  getPopupContainer?: (node: HTMLElement) => HTMLElement
  renderExtraFooter?: ReactNode
}

const { RangePicker } = DatePicker

const AntDateRangePicker = (props: IProps) => {
  return (
    <ConfigProvider
      locale={locale}
      theme={{
        token: {
          colorPrimary: '#722ed1',
          colorPrimaryHover: '#9254de',
          colorPrimaryActive: '#531dab',
          colorPrimaryBg: '#f9f0ff',
          motion: true,
        },
      }}
    >
      <RangePicker
        style={props.panelStyle}
        popupClassName={props.className}
        placement={props.placement}
        getPopupContainer={props.getPopupContainer}
        renderExtraFooter={() => props.renderExtraFooter}
        open={props.open}
        showTime={props.withTime ? { format: 'HH:mm:ss' } : false}
        format={props.withTime ? 'DD.MM.YYYY HH:mm:ss' : 'DD.MM.YYYY'}
        onChange={(value: [dayjs.Dayjs, dayjs.Dayjs]) => {
          if (value === null) {
            props.onChange(null, null)
          } else {
            props.onChange(value[0] ? value[0].unix() * 1000 : null, value[1] ? value[1].unix() * 1000 : null)
          }
        }}
        allowClear={true}
        disabledDate={props.allowSelectInFuture ? undefined : disabledDate}
        value={[props.startTs ? dayjs(props.startTs) : null, props.endTs ? dayjs(props.endTs) : null]}
        disabled={props.disabled}
        onOk={(value: [dayjs.Dayjs, dayjs.Dayjs]) => {
          props.onChange(value[0] ? value[0].unix() * 1000 : null, value[1] ? value[1].unix() * 1000 : null)
        }}
      />
    </ConfigProvider>
  )
}

const disabledDate = (date, info) => {
  if (info.type === 'date') {
    return date.isAfter(dayjs().add(1, 'day'))
  }
}

export default AntDateRangePicker
