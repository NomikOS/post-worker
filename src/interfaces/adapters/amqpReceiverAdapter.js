import { configureContainer } from '@/infrastructure/lib/container'
const { loggerMiddleware } = require('@/infrastructure/lib/support')
// const asValue = require('awilix').asValue
const container = configureContainer()

export default function amqpReceiverAdapter(ch, queueName, cola) {
  // Tomar aqui configuraciones especiales de la cola
  // que necesite este adapter del receiver amqp
  const workerName = cola.workerName
  const method = cola.method
  const loggerRoot = container.resolve('loggerRoot')

  // Ciclo para ejecucion de cada encolamiento
  const onMessage = (queuePayload) => {
    try {
      // dataEnCola contiene { payload: { data: [Object], channel: 'admin' } }
      const dataEnCola = JSON.parse(queuePayload.content.toString())
      // console.warn({ dataEnCola })

      const payload = dataEnCola.payload
      const tracers = dataEnCola.headers // pq viene en headers?

      // Container para la cola
      const containerScoped = container.createScope()

      // Hacer disponible para el container scoped
      // containerScoped.register({ tracers: asValue(tracers) }) // duplicated en loggerMiddleware?

      // Creo un logger para cada ciclo para pasar a loggerMiddleware
      const logger = containerScoped.resolve('logger')

      // Encamiso ejecucion de consumer para poder loguear
      loggerMiddleware(
        null,
        async () => {
          try {
            // Instanciar worker scoped
            const worker = containerScoped.resolve(workerName)
            // Colas siempre hacen POST
            await worker
              .post(method, payload)
              .then(() => {
                console.warn(`Desencolado OK. ${queueName}`)
                return ch.ack(queuePayload)
              })
              .catch((error) => {
                logger.errorHandler(
                  `Desencolado fallido de ${queueName}`,
                  error
                )
                return ch.nack(queuePayload, false, false)
              })
          } catch (error) {
            logger.errorHandler(
              `Desencolado fallido de ${queueName} en loggerMiddleware`,
              error
            )
            return ch.nack(queuePayload, false, false)
          }
        },
        { tracers, logger, payload, logType: 'queue', containerScoped }
      ) // fin loggerMiddleware
    } catch (error) {
      loggerRoot.fatal(
        `Desencolado fallido de ${queueName} en onMessage`,
        error
      )
      return ch.nack(queuePayload, false, false)
    }
  }

  return ch.consume(queueName, onMessage, {
    noAck: false
  })
}
