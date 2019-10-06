import Ajv from 'ajv'
import Pummiralli from './domain/pummiralli'
import { createServer, Socket, AddressInfo } from 'net'
import log from './util/log'
import schema from './messages/schema.json'
import { Message } from './domain/messages'
import { tryParseObject } from './util/parser'

const validateMessage = new Ajv().compile(schema)
const PORT = 8099
const ralli = new Pummiralli()
const server = createServer()

const timeoutHandler = (socket: Socket): void => {
  const remoteInfo = socket.address() as AddressInfo
  log.info(`Client ${remoteInfo.address} timed out`)
  ralli.drop(socket)
  socket.end()
}

const connectionClosedHandler = (socket: Socket): void => {
  // log.info(`SOCKET CLOSED: ${JSON.stringify(socketAddress)}`);
  ralli.drop(socket)
}

const errorHandler = (error: Error): void => {
  log.info(`SOCKET ERROR: ${JSON.stringify(error)}`)
}

const clientConnectionHandler = (socket: Socket): void => {
  socket.on('timeout', timeoutHandler)
  socket.on('close', () => connectionClosedHandler(socket))
  socket.on('error', errorHandler)
  socket.on('data', (data: string | Buffer) => {
    // if (!validateMessage(message)) {
    //   socket.write(
    //     `Invalid message: ${JSON.stringify(validateMessage.errors)}`,
    //   );
    //   return;
    // }
    const message = tryParseObject(data) as Message
    ralli.collectMessage(socket, message)
  })
}

// Let's go
server.listen(PORT)
server.on('connection', clientConnectionHandler)
ralli.start()
