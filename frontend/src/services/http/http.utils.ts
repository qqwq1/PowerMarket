import type { ISignalable, IAbortableRequest } from './http.types'

const createAbortableRequest = <T extends ISignalable>(request: T): IAbortableRequest<T> => {
  let abortCtrl = new AbortController()

  const abortableRequest = (...params: any[]) => {
    abortCtrl = new AbortController()

    return request(abortCtrl.signal, ...params)
  }

  const abort = () => abortCtrl.abort()

  abortableRequest.abort = abort

  return abortableRequest
}

const httpUtils = { createAbortableRequest }

export default httpUtils
