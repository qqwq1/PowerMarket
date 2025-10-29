import FormField from '@/shared/Forms/FormField'
import TextInput from '@/shared/Inputs/TextInput'

interface IProps {
  state: {
    email: string
    fullName: string
    companyName?: string
    inn?: string
    phone?: string
    address?: string
  }
  handleChange: (val: string, name: string) => void
}

const AuthEmailForm = ({ state, handleChange }: IProps) => {
  return (
    <form className="flex-lines gap24 width100">
      <div className="flex-lines gap12">
        <FormField label="E-mail" style={{ width: '100%' }} required>
          <TextInput value={state.email} name="email" type="email" onChange={handleChange} placeHolder="E-mail" />
        </FormField>

        <FormField label="ФИО" style={{ width: '100%' }} required>
          <TextInput value={state.fullName} name="fullName" onChange={handleChange} placeHolder="ФИО" />
        </FormField>
      </div>

      <div className="flex-lines gap12">
        <FormField label="Компания" style={{ width: '100%' }}>
          <TextInput
            value={state.companyName ?? ''}
            name="companyName"
            onChange={handleChange}
            placeHolder="Название компании"
          />
        </FormField>

        <FormField label="ИНН" style={{ width: '100%' }}>
          <TextInput value={state.inn ?? ''} name="inn" onChange={handleChange} placeHolder="ИНН" />
        </FormField>

        <FormField label="Телефон" style={{ width: '100%' }}>
          <TextInput value={state.phone ?? ''} name="phone" onChange={handleChange} placeHolder="Телефон" />
        </FormField>

        <FormField label="Адрес" style={{ width: '100%' }}>
          <TextInput value={state.address ?? ''} name="address" onChange={handleChange} placeHolder="Адрес" />
        </FormField>
      </div>
    </form>
  )
}

export default AuthEmailForm
