import axios from 'axios'
import { env } from '@/infrastructure/lib/env'
const { retryPost } = require('@/infrastructure/lib/support')
const qs = require('qs')

export default class ApiService {
  sse(logger, payload) {
    const url = `${env.upstream.sse}/internal/send`
    return retryPost(
      url,
      payload,
      {
        times: 5,
        interval: (retryCount) => {
          const inter = 50 * Math.pow(2, retryCount)
          const m = `Reintento a ${url} count: ${retryCount}, int:${inter}`
          logger.info(m, payload)
          return inter
        }
      },
      axios
    ).then((r) => logger.info('Envio a sse service OK', payload))
  }

  callPost(logger, url, data, times = 5) {
    return retryPost(
      url,
      data,
      {
        times: times,
        interval: (retryCount) => {
          const inter = 50 * Math.pow(2, retryCount)
          const m = `Reintento a ${url} count: ${retryCount}, int:${inter}`
          logger.info(m)
          return inter
        }
      },
      axios
    ).then((r) => logger.info('Call HTTP OK', url, data))
  }
}

export function params(options) {
  return {
    params: options,
    paramsSerializer: (params) => {
      return qs.stringify(params)
    }
  }
}
