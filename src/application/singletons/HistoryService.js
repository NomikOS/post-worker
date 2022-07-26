export default class HistoryService {
  constructor(proxy) {
    this.coreRepo = proxy.coreRepo
    this.logger = proxy.logger
  }

  async getData(postId, entryId = null) {
    let authorId
    let comment = null

    const post = await this.coreRepo.getPostForHistory(postId)

    if (entryId) {
      comment = await this.coreRepo.getCommentForHistory(entryId)
      authorId = comment.author_id
    } else {
      authorId = post.author_id
    }

    const author = await this.coreRepo.getUser(authorId)

    return {
      authorForHistory: author,
      postForHistory: post,
      commentForHistory: comment
    }
  }

  async saveHistory({ postId, userId, type, event, entryId = null }) {
    const {
      authorForHistory,
      postForHistory,
      commentForHistory
    } = await this.getData(postId, entryId)

    // this.logger.log({ authorForHistory })

    let title = postForHistory.body

    // Crear el title
    if (title) {
      // Lo resume o lo deja como esta dependiendo del length
      if (title.length > 128) {
        title = `${title.substring(0, 128)}...`
      }
    } else {
      const postLocation = postForHistory.location
      if (postLocation.address && postLocation.address.length > 128) {
        title = postLocation.address.substring(0, 128) + '...'
      } else {
        title = `Incidente en ${postLocation.address}`
      }
    }

    const record = {
      type,
      event,
      user_id: userId,
      data: {
        title: title,
        authorData: authorForHistory,
        postData: postForHistory,
        commentData: commentForHistory || null
      }
    }

    const x = await this.coreRepo.saveHistory(record)

    if (!x || !x[0]) {
      throw new Error(`No se puede guardar history para ${type} ${event}`)
    }

    return x[0]
  }

  async getDataRemoved(postId, entryId = null) {
    let authorId
    let comment = null

    const post = await this.coreRepo.getPostRemoved(postId)

    if (entryId) {
      comment = await this.coreRepo.getCommentForHistory(entryId)
      authorId = comment.author_id
    } else {
      authorId = post.author_id
    }

    const author = await this.coreRepo.getUser(authorId)

    return {
      authorForHistory: author,
      postForHistory: post,
      commentForHistory: comment
    }
  }

  async saveHistoryRemoved({ postId, userId, type, event, entryId = null }) {
    const {
      authorForHistory,
      postForHistory,
      commentForHistory
    } = await this.getDataRemoved(postId, entryId)

    let title = postForHistory.body

    // Crear el title
    if (title) {
      // Lo resume o lo deja como esta dependiendo del length
      if (title.length > 128) {
        title = `${title.substring(0, 128)}...`
      }
    } else {
      const postLocation = postForHistory.location
      if (postLocation.address && postLocation.address.length > 128) {
        title = postLocation.address.substring(0, 128) + '...'
      } else {
        title = `Incidente en ${postLocation.address}`
      }
    }

    const record = {
      type,
      event,
      user_id: userId,
      data: {
        title: title,
        authorData: authorForHistory,
        postData: postForHistory,
        commentData: commentForHistory || null
      }
    }

    const x = await this.coreRepo.saveHistory(record)

    if (!x || !x[0]) {
      throw new Error(`No se puede guardar history para ${type} ${event}`)
    }

    return x[0]
  }
}
