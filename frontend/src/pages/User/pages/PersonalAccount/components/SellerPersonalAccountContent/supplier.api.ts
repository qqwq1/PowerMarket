import { IEquipmentLot, TEquipmentLotDto } from '@/pages/EquipmentLot/equipmentLot.types'
import http, { handleHttpResponse, handleHttpError } from '@/services/http'
import { HTTPResponse } from '@/services/http/http.types'

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

const createEquipmentLot = (dto: TEquipmentLotDto): Promise<HTTPResponse<IEquipmentLot>> => {
  return http.post('/api/v1/services', dto).then(handleHttpResponse).catch(handleHttpError)
}

const getSelfEquipmentLots = (): Promise<HTTPResponse<IEquipmentLot[]>> => {
  return http.get(`/api/v1/services`).then(handleHttpResponse).catch(handleHttpError)
}

const supplierApi = { respondRentalRequest, createEquipmentLot, getSelfEquipmentLots }

export default supplierApi
