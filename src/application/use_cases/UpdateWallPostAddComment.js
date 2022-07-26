import Operation from '@/application/Operation'
const { Assertion } = require('@/infrastructure/lib/support')

class UpdateWallPostAddComment extends Operation {
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
    const entryId = Assertion.isPositive(body.entryId, 'Falta entryId')
    const userId = Assertion.isPositive(body.userId, 'Falta userId')
    const recipientIds = Assertion.isArray(
      body.recipientIds,
      'Falta recipientIds'
    )

    const { SUCCESS, ERROR } = this.outputs

    try {
      let wallRecord = {}

      const post = await this.coreRepo.getPostByEntry(entryId)
      Assertion.isObject(post, `No existe post dado entryId ${entryId}`)

      const postId = post.id

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

      // Agregar comentario al post correspondiente en tabla posts
      // Y update qcomments en tabla index
      const qcomments = await this.coreRepo.updateWallPostAddComment(
        postId,
        wallRecord
      )
      this.logger.info(`Nuevo comentario ${entryId} en tablas posts`, {
        qcomments
      })

      // Obtener el comentario y su author's data para actualizar
      // lista de comentarios en pwa
      const commentRecord = wallRecord.entries.find((v) => v.id === entryId)
      const commentUsers = [
        wallRecord.users.find((v) => v.id === commentRecord.author_id)
      ]

      // Segundario (catch errors)
      await this.historyService
        .saveHistory({
          type: 'comment',
          event: 'created',
          postId,
          userId,
          entryId
        })
        .catch((e) => this.loggerRoot.e(e, this.logger))

      // Segundario (catch errors)
      await this.updaterService
        .sender('event.wall-entry-created.q', {
          event: 'created',
          type: 'comment',
          postId,
          entryId,
          userId,
          recipientIds,
          commentRecord,
          commentUsers,
          metaData: { qcomments }
        })
        .catch((e) => this.loggerRoot.e(e, this.logger))

      return this.emit(SUCCESS)
    } catch (error) {
      return this.emit(ERROR, error)
    }
  }
}

UpdateWallPostAddComment.setOutputs()
export default UpdateWallPostAddComment
