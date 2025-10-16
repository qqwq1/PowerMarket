import config from '../../config.ts'
import axios, { type AxiosResponse, AxiosError } from 'axios'
import type { IHTTPSuccessResponse, IHTTPErrorResponse } from './http.types.ts'

const client = axios.create({
  baseURL: config.API_URL,
})

export const handleHttpResponse = <T extends any>(
  response: Pick<AxiosResponse<T>, 'data'>
): IHTTPSuccessResponse<T> => {
  return { status: 'success', body: response.data }
}

export const handleHttpError = (error: AxiosError): IHTTPErrorResponse => {
  if (error?.response?.status === 400) {
    const validationError = error?.response?.data as Record<string, string[] | string>
    if (validationError) {
      for (const key in validationError) {
        if (Array.isArray(validationError[key])) validationError[key] = validationError[key][0]
      }
    }
    return {
      status: 'error',
      message: 'Отправленны некорректные данные',
      body: error?.response?.data as Record<string, string>,
    }
  }

  if (error?.response?.status >= 500) {
    console.log({ type: 'error', title: `Непредвиденная ошибка`, description: `${error?.message}` })
  }

  const message = error?.message || 'Ошибка при запросе на\n' + error.config.url
  return { status: 'error', message: message }
}

const http = client
export default http
