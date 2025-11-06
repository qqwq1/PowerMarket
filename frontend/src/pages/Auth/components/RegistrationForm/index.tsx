import FormField from '@/shared/Forms/FormField'
import TextInput from '@/shared/Inputs/TextInput'

interface IProps {
  state: {
    email: string
    fullName: string
    password: string
    companyName: string
    inn: string
    phone: string
    address: string
  }

  handleChange: (val: string, name: string) => void
}

const RegistrationForm = ({ state, handleChange }: IProps) => {
  return (
    <form className="flex-lines gap24 width100">
      <div className="flex-lines gap12">
        <div className="inline-flex-gap gap12">
          <FormField label="E-mail" style={{ width: '100%' }} required>
            <TextInput value={state.email} name="email" type="email" onChange={handleChange} placeHolder="E-mail" />
          </FormField>
          <FormField label="Пароль" style={{ width: '100%' }} required>
            <TextInput
              value={state.password}
              name="password"
              type="password"
              onChange={handleChange}
              placeHolder="Пароль"
            />
          </FormField>
        </div>
        <FormField label="ФИО" style={{ width: '100%' }} required>
          <TextInput value={state.fullName} name="fullName" onChange={handleChange} placeHolder="ФИО" />
        </FormField>

        <FormField label="Компания" style={{ width: '100%' }} required>
          <TextInput
            value={state.companyName}
            name="companyName"
            onChange={handleChange}
            placeHolder="Название компании"
          />
        </FormField>

        <FormField label="ИНН" style={{ width: '100%' }} required>
          <TextInput value={state.inn} name="inn" onChange={handleChange} placeHolder="ИНН" />
        </FormField>
      </div>

      <div className="flex-lines gap12">
        <FormField label="Телефон" style={{ width: '100%' }}>
          <TextInput value={state.phone} name="phone" onChange={handleChange} placeHolder="Телефон" />
        </FormField>

        <FormField label="Адрес" style={{ width: '100%' }}>
          <TextInput value={state.address} name="address" onChange={handleChange} placeHolder="Адрес" />
        </FormField>
      </div>
    </form>
  )
}

export default RegistrationForm
