import Operation from '@/application/Operation'
const { Assertion } = require('@/infrastructure/lib/support')

class SaveWallPost extends Operation {
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
      let wallRecord = {}

      const post = await this.coreRepo.getPost(postId)
      Assertion.isObject(post, `No existe post dado postId ${postId}`)

      wallRecord = this.procedures.buildWallRecord(post)
      Assertion.isPositive(
        wallRecord.users.length,
        `No existen users dado postId ${postId}`
      )

      wallRecord = await this.procedures.completeWallData(wallRecord, postId)
      Assertion.isPositive(
        wallRecord.categories.length,
        `No existen categories dado id ${postId}`
      )

      await this.coreRepo.saveWallRecord(postId, wallRecord)
      this.logger.info(`Nuevo post ${postId} en walls`)

      // Segundario (catch errors)
      await this.historyService
        .saveHistory({
          type: 'post',
          event: 'created',
          postId,
          userId
        })
        .catch((e) => this.loggerRoot.e(e, this.logger))

      // Segundario (catch errors)
      await this.updaterService
        .sender('event.wall-post-created.q', {
          type: 'post',
          event: 'created',
          postId,
          userId,
          metaData: { authorId: post.author_id }
        })
        .catch((e) => this.loggerRoot.e(e, this.logger))

      return this.emit(SUCCESS)
    } catch (error) {
      return this.emit(ERROR, error)
    }
  }
}

SaveWallPost.setOutputs()
export default SaveWallPost
