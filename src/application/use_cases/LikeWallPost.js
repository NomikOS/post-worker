import Operation from '@/application/Operation'
const { Assertion } = require('@/infrastructure/lib/support')

class LikeWallPost extends Operation {
  constructor(proxy) {
    super()
    this.coreRepo = proxy.coreRepo
    this.logger = proxy.logger
    this.loggerRoot = proxy.loggerRoot
    this.updaterService = proxy.updaterService
    this.historyService = proxy.historyService
  }

  async execute(body) {
    // Invariantes
    const postId = Assertion.isPositive(body.postId, 'Falta postId')
    const userId = Assertion.isPositive(body.userId, 'Falta userId')
    const metaData = Assertion.isObject(body.metaData, 'Falta metadata')
    const recipientIds = Assertion.isArray(
      body.recipientIds,
      'Falta recipientIds'
    )

    const { SUCCESS, ERROR } = this.outputs

    try {
      // Principal
      await this.coreRepo.likeWallPost(postId, metaData.qlikes)
      this.logger.info(`Post ${postId} gustado en walls`)

      // Segundario (catch errors)
      await this.historyService
        .saveHistory({
          type: 'post',
          event: 'liked',
          postId,
          userId: userId
        })
        .catch((e) => this.loggerRoot.e(e, this.logger))

      // Segundario (catch errors)
      await this.updaterService
        .sender('event.wall-post-liked.q', {
          type: 'post',
          event: 'liked',
          postId,
          userId,
          recipientIds,
          metaData
        })
        .catch((e) => this.loggerRoot.e(e, this.logger))

      return this.emit(SUCCESS)
    } catch (error) {
      return this.emit(ERROR, error)
    }
  }
}

LikeWallPost.setOutputs()
export default LikeWallPost
