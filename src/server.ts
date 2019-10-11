import Pummiralli from './domain/pummiralli'
import { createServer, Socket, AddressInfo } from 'net'
import Log from './util/log'
import { tryParseObject } from './util/parser'

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

// Let's go
server.listen(PORT)
server.on('connection', clientConnectionHandler)
ralli.start()
