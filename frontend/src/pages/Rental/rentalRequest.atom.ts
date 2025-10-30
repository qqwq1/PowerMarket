import { atom } from 'recoil'
import { IRental } from './rental.types'

interface IRentalRequestState {
  items: IRental[]
}

const rentalRequestAtom = atom<IRentalRequestState>({
  key: 'rentalRequestAtom',
  default: {
    items: [],
  },
})
export default rentalRequestAtom
