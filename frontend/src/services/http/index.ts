import config from '../../config.ts'
import axios, { type AxiosResponse, AxiosError, AxiosInstance } from 'axios'
import type { IHTTPSuccessResponse, IHTTPErrorResponse } from './http.types.ts'
import authApi from '@/pages/Auth/auth.api.ts'
import { IAuthState } from '@/pages/Auth/auth.atom.ts'
import { Dispatch, SetStateAction } from 'react'

const client = axios.create({
  baseURL: config.API_URL,
})

const interceptorsApplied: Record<string, boolean> = {}

export const applyInterceptors = (
  authState: IAuthState,
  setAuthState: Dispatch<SetStateAction<IAuthState>>,
  refreshToken: string,
  http: AxiosInstance = client,
  clientKey: string = 'default'
) => {
  if (interceptorsApplied[clientKey]) return

  interceptorsApplied[clientKey] = true
  let isRefreshing = false

  let refreshRequest = Promise.resolve({
    accessToken: authState.accessToken,
    expires: authState.expires,
  })

  const ensureAuthorization = (): Promise<Pick<IAuthState, 'accessToken' | 'expires'>> => {
    const shouldRefresh = !authState.accessToken || Date.now() + 600000 > authState.expires
    return shouldRefresh ? refreshAccessToken() : Promise.resolve(authState)
  }

  const refreshAccessToken = async (): Promise<Pick<IAuthState, 'accessToken' | 'expires'>> => {
    if (isRefreshing) return refreshRequest
    isRefreshing = true

    refreshRequest = authApi
      .refreshToken(refreshToken)
      .then((r) => {
        if (r.status === 'success') {
          const newAuth = { accessToken: r.body.token, expires: Date.now() + 3600000 }
          setAuthState((prev) => ({
            ...prev,
            accessToken: newAuth.accessToken,
            expires: newAuth.expires,
          }))
          return newAuth
        }
        return { accessToken: '', expires: 0 }
      })
      .finally(() => (isRefreshing = false))

    return refreshRequest
  }

  http.interceptors.request.use(async (config) => {
    const { accessToken } = await ensureAuthorization()

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  })

  http.interceptors.response.use(
    (response) => response,
    async (err) => {
      const originalRequest = err.config
      const shouldRetry = err.response && err.response.status === 401 && !originalRequest._retry

      if (shouldRetry) {
        originalRequest._retry = true

        try {
          const { accessToken } = await refreshAccessToken()

          if (accessToken) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return http(originalRequest)
          }
        } catch (refreshError) {
          // Если обновление токена не удалось, разлогиниваем
          setAuthState({
            expires: 0,
            accessToken: '',
            authState: 'not-authorized',
          })
          throw refreshError
        }
      }

      // Если это повторная ошибка 401 или другая ошибка
      if (err.response && err.response.status === 401) {
        setAuthState({
          expires: 0,
          accessToken: '',
          authState: 'not-authorized',
        })
      }

      throw err
    }
  )
}

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
