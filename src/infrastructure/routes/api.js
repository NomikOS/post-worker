import { createController } from 'awilix-koa'
const { authMiddleware } = require('@/infrastructure/lib/support')

export const apiController = createController(({ apiController }) => ({
  get: async (ctx) =>
    ctx.ok(await apiController.get(ctx.params.case, ctx.query)),
  post: async (ctx) =>
    ctx.ok(await apiController.post(ctx.params.case, ctx.request.body)),
  delete: async (ctx) =>
    ctx.ok(await apiController.delete(ctx.params.case, ctx.query))
}))
  .get('/:case', 'get', { before: [authMiddleware] })
  .post('/:case', 'post', { before: [authMiddleware] })
  .delete('/:case', 'delete', { before: [authMiddleware] })

/**
 * Prefijos mock ayudan a probar mediante llamadas rest
 * metodos que en produccion solo estan disponibles para
 * colas o sockets. En el gw filtro endpoints mock/
 */
export const postWorker = createController(({ postWorker }) => ({
  post: async (ctx) =>
    ctx.ok(await postWorker.post(ctx.params.case, ctx.request.body))
})).post('/mock/:case', 'post', { before: [authMiddleware] })
