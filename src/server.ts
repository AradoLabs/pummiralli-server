import Pummiralli from './domain/pummiralli'
import { HistoryEvent } from './domain/messages'
import { createServer, Socket, AddressInfo } from 'net'
import Log from './util/log'
import { tryParseObject } from './util/parser'
import fs from 'fs'

// import Ajv from 'ajv'
// import schema from './messages/schema.json'
// const validateMessage = new Ajv().compile(schema)

const PORT = 8099
const ralli = new Pummiralli()
const server = createServer()

const timeoutHandler = (socket: Socket): void => {
  const addressInfo = socket.address() as AddressInfo
  Log.info(`Client ${addressInfo.address} timed out`)
  ralli.drop(socket)
  socket.end()
}

const connectionClosedHandler = (socket: Socket): void => {
  const addressInfo = socket.address() as AddressInfo
  Log.info(`SOCKET CLOSED: ${JSON.stringify(addressInfo.address)}`)
  ralli.drop(socket)
}

const errorHandler = (error: Error): void => {
  Log.info(`SOCKET ERROR: ${JSON.stringify(error)}`)
}

const clientConnectionHandler = (socket: Socket): void => {
  socket.on('timeout', timeoutHandler)
  socket.on('close', () => connectionClosedHandler(socket))
  socket.on('error', errorHandler)
  socket.on('data', (data: string | Buffer) => {
    const message = tryParseObject(data)
    // TODO: Add validation when types somewhat locked
    // if (!validateMessage(message)) {
    //   socket.write(`Invalid message: ${JSON.stringify(validateMessage.errors)}`)
    //   return
    // }
    ralli.collectMessage(socket, message)
  })
}

const shutDown = (eventHistory: Array<HistoryEvent>): void => {
  const resultsDir = './.results'

  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir)
  }
  const filePath = `${resultsDir}/${new Date().toISOString()}`
  Log.debug(`Writing race events to file ${filePath}`)
  fs.writeFile(
    `${filePath}.json`,
    JSON.stringify(eventHistory),
    'utf8',
    err => {
      if (err) {
        Log.error('Error writing results to JSON:')
        Log.error(err.toString())
      }
    },
  )

  server.close()
}

// Let's go
server.listen(PORT)
server.on('connection', clientConnectionHandler)
ralli.start(shutDown)
