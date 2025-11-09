import { atom } from 'recoil'
import { IRentalRequest } from './rental.types'

interface IRentalRequestState {
  items: IRentalRequest[]
}

const rentalRequestAtom = atom<IRentalRequestState>({
  key: 'rentalRequestAtom',
  default: {
    items: [],
  },
})
export default rentalRequestAtom
