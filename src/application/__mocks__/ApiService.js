const qs = require('qs')

export default class ApiService {
  sse(logger, payload) {
    return new Promise((resolve, reject) => {
      logger.info('(mock) Envio a sse service OK', payload)
      return resolve()
    })
  }

  callPost(logger, url, data) {
    return new Promise((resolve, reject) => {
      logger.info('(mock) Call HTTP OK', url, data)
      return resolve()
    })
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
