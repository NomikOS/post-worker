import Operation from '@/application/Operation'
const { Assertion } = require('@/infrastructure/lib/support')

class RemoveWallPost extends Operation {
  constructor(proxy) {
    super()
    this.coreRepo = proxy.coreRepo
    this.procedures = proxy.procedures
    this.logger = proxy.logger
    this.loggerRoot = proxy.loggerRoot
    this.updaterService = proxy.updaterService
    this.historyService = proxy.historyService
  }

  async execute(body) {
    // Invariantes
    const postId = Assertion.isPositive(body.postId, 'Falta postId')
    const userId = Assertion.isPositive(body.userId, 'Falta userId')

    const { SUCCESS, ERROR } = this.outputs

    try {
      await this.coreRepo.removeWallPost(postId)
      this.logger.info(`Post ${postId} removido en index y posts`)

      // Segundario (catch errors)
      await this.historyService
        .saveHistoryRemoved({
          type: 'post',
          event: 'removed',
          postId,
          userId
        })
        .catch((e) => this.loggerRoot.e(e, this.logger))

      // Segundario (catch errors)
      await this.updaterService
        .sender('event.wall-post-removed.q', {
          type: 'post',
          event: 'removed',
          postId,
          userId
        })
        .catch((e) => this.loggerRoot.e(e, this.logger))

      return this.emit(SUCCESS)
    } catch (error) {
      return this.emit(ERROR, error)
    }
  }
}

RemoveWallPost.setOutputs()
export default RemoveWallPost
