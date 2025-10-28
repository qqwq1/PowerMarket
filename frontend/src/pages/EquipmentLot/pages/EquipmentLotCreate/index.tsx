import { useState } from 'react'
import DropArea from '@/shared/Files/Droparea'
import TextInput from '@/shared/Inputs/TextInput'
import DropdownInput from '@/shared/Inputs/DropdownInput'
import Button from '@/shared/Buttons/Button'
import { IEquipmentLot } from '@/pages/EquipmentLot/equipmentLot.types'
import SidePage from '@/shared/SidePage'
import FormField from '@/shared/Forms/FormField'
import SeparateLine from '@/shared/SeparateLine'
import equipmentLotCreateConstants from './equipmentLotCreate.constants'
import useDroparea from '@/shared/Files/hooks/useDroparea'
import useInputFile from '@/shared/hooks/useInputFile'
import AttachmentLine from '@/shared/Files/Attachment/AttachmentLine'
import formsUtils from '@/shared/Forms/forms.utils'
import PlusIcon from '@/assets/icons/plus.svg?react'

interface IProps {
  open: boolean
  onClose?: () => void
}

const EquipmentLotCreate = (props: IProps) => {
  const [files, setFiles] = useState<File[]>([])
  const dropAreaCtrl = useDroparea({ onFiles: (files) => setFiles((prev) => [...prev, ...files]) })
  const fileInputHandler = useInputFile({ onFiles: (files) => setFiles((prev) => [...prev, ...files]) })
  const [form, setForm] = useState<Partial<IEquipmentLot>>({
    title: '',
    description: '',
    category: '',
    price: null,
    location: '',
    images: [],
    status: 'moderation',
  })

  const handleChange = (val: string | number, name: keyof IEquipmentLot) => {
    setForm((prev) => ({ ...prev, [name]: val }))
  }

  const handleSubmit = () => {
    alert('Лот создан! (заглушка)' + JSON.stringify(form))
  }

  const renderFilesBlock = () => {
    return (
      <div className="flex-lines gap16" style={{ marginTop: '16px', marginBottom: '16px' }}>
        <Button
          size="default"
          type="default"
          text="Добавить файл"
          fullWidth={true}
          icon={<PlusIcon />}
          onClick={fileInputHandler}
        />
        <div>
          {files.map((f, index) => (
            <AttachmentLine
              index={index}
              file={f}
              onDelete={() => setFiles((prev) => formsUtils.arrays.removeItem(prev, index))}
            />
          ))}
        </div>
      </div>
    )
  }

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
            <FormField label="Цена" required={true}>
              <TextInput
                name="price"
                value={form.price?.toString() ?? ''}
                onChange={(val) => handleChange(Number(val), 'price')}
                placeHolder="Введите цена в ₽ за час"
                type="number"
              />
            </FormField>
            <FormField label="Город/локация" required={true}>
              <TextInput
                name="location"
                value={form.location as string}
                onChange={handleChange}
                placeHolder="Введите город"
              />
            </FormField>
            <FormField label="Статус лота" required={true}>
              <DropdownInput
                name="status"
                options={equipmentLotCreateConstants.statusOptions}
                selectedOption={form.status as string}
                onSelect={(val) => handleChange(val, 'status')}
                title="Статус лота"
              />
            </FormField>
            <DropArea
              onDrop={dropAreaCtrl.handleDrop}
              isActive={dropAreaCtrl.over}
              onDragOver={dropAreaCtrl.handleDragOver}
              onDragEnter={dropAreaCtrl.handleDragEnter}
              onDragLeave={dropAreaCtrl.handleDragLeave}
            >
              {renderFilesBlock()}
            </DropArea>
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
