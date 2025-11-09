import http, { handleHttpError, handleHttpResponse } from '@/services/http'
import { HTTPResponse, IPaginationRequestQuery, IPaginationResponse } from '@/services/http/http.types'
import { IEquipmentLot, TEquipmentLotCategory, TEquipmentLotDto } from './equipmentLot.types'

const getEquipmentLot = (id: IEquipmentLot['id']): Promise<HTTPResponse<IEquipmentLot[]>> => {
  return http.get(`/api/v1/services/${id}`).then(handleHttpResponse).catch(handleHttpError)
}

const createEquipmentLot = (dto: TEquipmentLotDto): Promise<HTTPResponse<IEquipmentLot>> => {
  return http.post('/api/v1/services', dto).then(handleHttpResponse).catch(handleHttpError)
}

const updateEquipmentLot = (
  id: IEquipmentLot['id'],
  dto: Partial<TEquipmentLotDto>
): Promise<HTTPResponse<IEquipmentLot>> => {
  return http.put(`/api/v1/services/${id}`, dto).then(handleHttpResponse).catch(handleHttpError)
}

const deleteEquipmentLot = (id: IEquipmentLot['id']): Promise<HTTPResponse<IEquipmentLot>> => {
  return http.delete(`/api/v1/services/${id}`).then(handleHttpResponse).catch(handleHttpError)
}

const searchEquipmentLots = (
  params: {
    startDate?: string
    endDate?: string
    category?: TEquipmentLotCategory
    keyword?: string
  } & IPaginationRequestQuery = {}
): Promise<HTTPResponse<IPaginationResponse<IEquipmentLot>>> => {
  return http.get(`/api/v1/services/search`, { params }).then(handleHttpResponse).catch(handleHttpError)
}

const equipmentLotApi = {
  createEquipmentLot,
  updateEquipmentLot,
  deleteEquipmentLot,
  getEquipmentLot,
  searchEquipmentLots,
}

export default equipmentLotApi
