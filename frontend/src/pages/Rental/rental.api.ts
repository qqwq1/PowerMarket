import { IEquipmentLot } from '@/pages/EquipmentLot/equipmentLot.types'
import http, { handleHttpResponse, handleHttpError } from '@/services/http'
import { HTTPResponse } from '@/services/http/http.types'
import { IRentalRequest, IRentalRequestCreateDto } from './rental.types'

interface IRespondRentalRequest {
  approved: true
  rejectionReason: string
}

const respondRentalRequest = (
  rentalId: IEquipmentLot['id'],
  respondRentalRequest: IRespondRentalRequest
): Promise<HTTPResponse<IEquipmentLot[]>> => {
  return http
    .post(`/api/rental-requests/${rentalId}/approve`, respondRentalRequest)
    .then(handleHttpResponse)
    .catch(handleHttpError)
}

const createRentalRequest = (dto: IRentalRequestCreateDto): Promise<HTTPResponse<IRentalRequest>> => {
  return http.post('/api/rental-requests', dto).then(handleHttpResponse).catch(handleHttpError)
}

const getSelfEquipmentLots = (): Promise<HTTPResponse<IEquipmentLot[]>> => {
  return http.get(`/api/v1/services`).then(handleHttpResponse).catch(handleHttpError)
}

const rentalApi = { respondRentalRequest, createRentalRequest, getSelfEquipmentLots }

export default rentalApi
