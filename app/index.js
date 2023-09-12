const app = require('./configs/app')
const config = require('./configs/config')
const { dbInitialize } = require('./configs/database/database')

const server = app.listen(config.port, async () => {
  console.log('Application run on port ' + config.port)
  await dbInitialize(1)
})

const shutdown = () => {
  console.info('closing http server')

  server.close(() => {
    console.info('http server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
