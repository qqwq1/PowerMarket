import useDebounce from '@/pages/User/hooks/useDebounce'
import TextInput, { ITextInputProps } from '../TextInput'
import { useState } from 'react'
import useSkipFirstRenderEffect from '@/pages/User/hooks/useSkipFirstRenderEffect'
import SearchIcon from './searchInputIcon.svg?react'

const SearchInput = ({
  onChange,
  debounceTimeoutMs = 300,
  ...props
}: ITextInputProps & { debounceTimeoutMs?: number }) => {
  const [search, setSearch] = useState(props.value || '')
  const debounced = useDebounce(search, debounceTimeoutMs)

  useSkipFirstRenderEffect(() => {
    onChange(search, props.name)
  }, [debounced])

  return <TextInput {...props} value={search} onChange={setSearch} icon={<SearchIcon />} />
}

export default SearchInput
