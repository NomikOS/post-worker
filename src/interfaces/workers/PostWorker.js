const { ValidationError } = require('@/infrastructure/lib/support')
const { NotFoundError } = require('@/infrastructure/lib/support')
const { UnauthorizedError } = require('@/infrastructure/lib/support')
const { VerboseError } = require('@/infrastructure/lib/support')
const cases = [
  'saveWallPost',
  'likeWallPost',
  'unlikeWallPost',
  'removeWallPost',
  'updateWallPostAddComment',
  'updateWallPostDelComment',
  'buildLocationMap'
]

export default class PostWorker {
  constructor(proxy) {
    // Inyectar cases
    cases.forEach((v) => {
      this[v] = proxy[v]
    })
  }

  post(useCase, body) {
    return this.default(useCase, body)
  }

  default(aUseCase, input) {
    return new Promise((resolve, reject) => {
      const useCase = this[aUseCase]

      const {
        SUCCESS,
        ERROR,
        VALIDATION_ERROR,
        NOT_FOUND,
        UNAUTHORIZED,
        ERROR_VERBOSE
      } = useCase.outputs

      useCase
        .on(SUCCESS, (data) => {
          return resolve(data)
        })
        .on(UNAUTHORIZED, () => {
          reject(new UnauthorizedError())
        })
        .on(NOT_FOUND, () => {
          reject(new NotFoundError())
        })
        .on(VALIDATION_ERROR, (messages) => {
          reject(new ValidationError(messages))
        })
        .on(ERROR_VERBOSE, (error) => {
          reject(new VerboseError(error))
        })
        .on(ERROR, (e) => reject(e))

      useCase.execute(input).catch((e) => reject(e)) // catch todo lo no emitted
    })
  }
}
