import { colas } from '@/infrastructure/lib/colas'
import { configureContainer } from '@/infrastructure/lib/container'
import { env } from '@/infrastructure/lib/env'
import amqpReceiverAdapter from '@/interfaces/adapters/amqpReceiverAdapter'
const {
  unhandledRejectionHandler,
  coreDb
} = require('@/infrastructure/lib/support')
const container = configureContainer()
const loggerRoot = container.resolve('loggerRoot')
const amqpReceiver = container.resolve('amqpReceiver')

unhandledRejectionHandler(container)

// Init
;(async () => {
  try {
    await coreDb.raw('SELECT 1').catch((err) => {
      loggerRoot.debug('Error first check of database')
      throw err
    })

    await amqpReceiver.init(colas.receiver, amqpReceiverAdapter, loggerRoot)
    loggerRoot.debug(
      `Amqp service receiving on ${env['amqp-host']} in ${env.NODE_ENV} mode`
    )
  } catch (err) {
    loggerRoot.debug('Error while starting up microservice', err)
    process.exit(1)
  }
})()
