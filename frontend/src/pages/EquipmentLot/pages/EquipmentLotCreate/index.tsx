import { useState } from 'react'
import TextInput from '@/shared/Inputs/TextInput'
import DropdownInput from '@/shared/Inputs/DropdownInput'
import Button from '@/shared/Buttons/Button'
import SidePage from '@/shared/SidePage'
import FormField from '@/shared/Forms/FormField'
import SeparateLine from '@/shared/SeparateLine'
import equipmentLotCreateConstants from './equipmentLotCreate.constants'
import equipmentLotUtils from '../../equipmentLot.utils'
import useHttpLoader from '@/shared/hooks/useHttpLoader'
import equipmentLotApi from '../../equipmentLot.api'
import { useSetRecoilState } from 'recoil'
import equipmentLotAtom from '../../equipmentLot.atom'
import { TEquipmentLotDto } from '../../equipmentLot.types'
import TextArea from '@/shared/Inputs/TextArea'
import AntDateRangePicker from '@/shared/Forms/DatePickers/AntDateRangePicker'

interface IProps {
  open: boolean
  onClose?: () => void
}

const EquipmentLotCreate = (props: IProps) => {
  const setEquipmentLotState = useSetRecoilState(equipmentLotAtom)
  // const [files, setFiles] = useState<File[]>([])
  // const dropAreaCtrl = useDroparea({ onFiles: (files) => setFiles((prev) => [...prev, ...files]) })
  // const fileInputHandler = useInputFile({ onFiles: (files) => setFiles((prev) => [...prev, ...files]) })
  const [form, setForm] = useState<TEquipmentLotDto>(equipmentLotUtils.generateEmptyEquipmentLot())
  const { wait } = useHttpLoader()

  const handleChange = (val: string | number, name: keyof TEquipmentLotDto) => {
    setForm((prev) => ({ ...prev, [name]: val }))
  }

  const handleSubmit = () => {
    console.log('123123')
    wait(equipmentLotApi.createEquipmentLot(form), (resp) => {
      console.log(resp)
      if (resp.status === 'success') {
        setEquipmentLotState((prev) => ({
          ...prev,
          items: [...prev.items, resp.body],
        }))
      }
    })
  }

  const handleRangeChange = (index: number, startTs: number, endTs: number) => {
    const startDate = startTs ? new Date(startTs).toISOString() : ''
    const endDate = endTs ? new Date(endTs).toISOString() : ''

    setForm((prev) => {
      const newAvailabilities = [...prev.availabilities]
      if (!newAvailabilities[index]) return prev
      newAvailabilities[index] = { startDate, endDate }
      return {
        ...prev,
        availabilities: newAvailabilities,
      }
    })
  }

  // const renderFilesBlock = () => {
  //   return (
  //     <div className="flex-lines gap16" style={{ marginTop: '16px', marginBottom: '16px' }}>
  //       <Button
  //         size="default"
  //         type="default"
  //         text="Добавить файл"
  //         fullWidth={true}
  //         icon={<PlusIcon />}
  //         onClick={fileInputHandler}
  //       />
  //       <div>
  //         {files.map((f, index) => (
  //           <AttachmentLine
  //             index={index}
  //             file={f}
  //             onDelete={() => setFiles((prev) => formsUtils.arrays.removeItem(prev, index))}
  //           />
  //         ))}
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <SidePage onClose={props.onClose} open={props.open}>
      <div className="flex-lines height100 gap16" style={{ scrollBehavior: 'smooth' }}>
        <h4 className="text-heading-4">Создание лота</h4>
        <SeparateLine />
        <div className="inline-flex-gap gap16 height100" style={{ minHeight: 0 }}>
          <div
            className="flex-lines gap16 width100"
            style={{
              overflow: 'auto',
              paddingRight: '24px',
              height: '100%',
              minHeight: 0,
              paddingLeft: '2px',
              scrollBehavior: 'smooth',
            }}
          >
            <FormField label="Название оборудования" required={true}>
              <TextInput
                placeHolder="Введите название оборудования"
                value={form.title}
                name="title"
                onChange={handleChange}
              />
            </FormField>
            <FormField label="Описание" required={true}>
              <TextInput
                name="description"
                value={form.description}
                onChange={handleChange}
                placeHolder="Введите описание"
              />
            </FormField>
            <FormField label="Категория оборудования" required={true}>
              <DropdownInput
                name="category"
                options={equipmentLotCreateConstants.categoryOptions}
                selectedOption={form.category as string}
                onSelect={(val) => handleChange(val, 'category')}
                title="Выберите категорию"
              />
            </FormField>
            <FormField label="Цена в ₽ за день" required={true}>
              <TextInput
                name="price"
                value={form.pricePerDay?.toString() ?? ''}
                onChange={(val) => handleChange(Number(val), 'pricePerDay')}
                placeHolder="руб./день"
                type="number"
              />
            </FormField>
            <FormField label="Адрес" required={true}>
              <TextInput
                name="location"
                value={form.location as string}
                onChange={handleChange}
                placeHolder="Введите город"
              />
            </FormField>
            <FormField label="Технические характеристики">
              <TextArea
                name="technicalSpecs"
                value={form.technicalSpecs as string}
                onChange={handleChange}
                placeHolder="Дополнительная техническая информация"
              />
            </FormField>

            <div className="flex-lines gap24">
              <div className="flex-space-between">
                <p className="text-nm" style={{ whiteSpace: 'pre-wrap' }}>
                  Периоды доступности <span className="text-nm text-error">*</span>
                </p>
                <Button
                  size="default"
                  type="default"
                  text="Добавить период"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      availabilities: [...prev.availabilities, { startDate: null, endDate: null }],
                    }))
                  }
                />
              </div>
              <div className="flex-lines gap16">
                {form.availabilities.map((availability, index) => (
                  <AntDateRangePicker
                    key={index}
                    onChange={(startTs, endTs) => handleRangeChange(index, startTs, endTs)}
                    allowSelectInFuture
                    startTs={availability.startDate ? Date.parse(availability.startDate) : null}
                    endTs={availability.endDate ? Date.parse(availability.endDate) : null}
                    panelStyle={{ width: '100%' }}
                  />
                ))}
              </div>
            </div>
            {/* <DropArea
              onDrop={dropAreaCtrl.handleDrop}
              isActive={dropAreaCtrl.over}
              onDragOver={dropAreaCtrl.handleDragOver}
              onDragEnter={dropAreaCtrl.handleDragEnter}
              onDragLeave={dropAreaCtrl.handleDragLeave}
            >
              {renderFilesBlock()}
            </DropArea> */}
          </div>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <SeparateLine />
        </div>
        <div className="inline-flex-gap">
          <Button size="default" type="primary" text="Добавить" onClick={handleSubmit} />
          <Button size="default" type="default" text="Отменить" onClick={props.onClose} />
        </div>
      </div>
    </SidePage>
  )
}

export default EquipmentLotCreate
