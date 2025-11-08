import http, { handleHttpError, handleHttpResponse } from '@/services/http'
import { HTTPResponse } from '@/services/http/http.types'
import { IEquipmentLot, TEquipmentLotDto } from './equipmentLot.types'

const getEquipmentLots = (): Promise<HTTPResponse<IEquipmentLot[]>> => {
  return http.get(`/api/v1/services/`).then(handleHttpResponse).catch(handleHttpError)
}

const createEquipmentLot = (dto: TEquipmentLotDto): Promise<HTTPResponse<IEquipmentLot>> => {
  return http.post('/api/v1/services/', dto).then(handleHttpResponse).catch(handleHttpError)
}

const equipmentLotApi = { createEquipmentLot, getEquipmentLots }

export default equipmentLotApi
