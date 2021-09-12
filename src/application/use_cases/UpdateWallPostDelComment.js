import Operation from '@/application/Operation'
const { Assertion } = require('@/infrastructure/lib/support')

class UpdateWallPostDelComment extends Operation {
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
    const entryId = Assertion.isPositive(body.entryId, 'Falta entryId')
    const userId = Assertion.isPositive(body.userId, 'Falta userId')

    const { SUCCESS, ERROR } = this.outputs

    try {
      let wallRecord = {}

      // Get post
      const post = await this.coreRepo.getPost(postId)
      Assertion.isObject(post, `No existe post dado postId ${postId}`)

      wallRecord = this.procedures.buildWallRecord(post, true)
      Assertion.isPositive(
        wallRecord.users.length,
        `No existen users dado postId ${postId}`
      )

      wallRecord = await this.procedures.completeWallData(wallRecord, postId)
      Assertion.isPositive(
        wallRecord.categories.length,
        `No existen categories dado id ${postId}`
      )

      const qcomments = await this.coreRepo.updateWallPostDelComment(
        postId,
        wallRecord
      )
      this.logger.info(
        `Comentarios removidos en index dado postId ${postId} y entryId ${entryId}`,
        { qcomments }
      )

      // Segundario (catch errors)
      await this.historyService
        .saveHistory({
          type: 'comment',
          event: 'removed',
          postId,
          userId
        })
        .catch((e) => this.loggerRoot.e(e, this.logger))

      // Segundario (catch errors)
      await this.updaterService
        .sender('event.wall-entry-removed.q', {
          type: 'comment',
          event: 'removed',
          postId,
          entryId,
          userId,
          metaData: { qcomments }
        })
        .catch((e) => this.loggerRoot.e(e, this.logger))

      return this.emit(SUCCESS)
    } catch (error) {
      return this.emit(ERROR, error)
    }
  }
}

UpdateWallPostDelComment.setOutputs()
export default UpdateWallPostDelComment
