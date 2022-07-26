import Operation from '@/application/Operation'
const { Assertion } = require('@/infrastructure/lib/support')

class BuildLocationMap extends Operation {
  constructor(proxy) {
    super()
    this.logger = proxy.logger
    this.apiService = proxy.apiService
  }

  async execute(body) {
    const mapName = Assertion.isString(body.mapName, 'Falta mapName')
    const coords = Assertion.isString(body.coords, 'Falta coords')

    const { SUCCESS, ERROR } = this.outputs

    try {
      // Publish task para build map de location
      const url =
        'https://us-east1-service-account.json.cloudfunctions.net/buildLocationMapByHttp'

      const dir = ['local', 'testing', 'production', 'test'].includes(
        process.env.NODE_ENV
      )
        ? process.env.NODE_ENV
        : 'production'

      const data = {
        mapName: `${dir}/${mapName}`,
        coords: coords
      }

      await this.apiService.callPost(this.logger, url, data)

      return this.emit(SUCCESS)
    } catch (error) {
      return this.emit(ERROR, error)
    }
  }
}

BuildLocationMap.setOutputs()
export default BuildLocationMap
