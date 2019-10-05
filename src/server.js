// @flow
import jot from 'json-over-tcp';
import Ajv from 'ajv';
import schema from './messages/schema.json';
import Pummiralli from './domain/pummiralli';
import log from './util/log';

const validateMessage = new Ajv().compile(schema);
const PORT = 8099;
const ralli = new Pummiralli();

const timeoutHandler = socket => {
  log.info(`Client ${socket.id} timed out`);
  ralli.drop(socket);
  socket.disconnect();
};

const connectionClosedHandler = socket => {
  // log.info(`SOCKET CLOSED: ${JSON.stringify(socketAddress)}`);
  ralli.drop(socket);
};

const errorHandler = error => {
  log.info(`SOCKET ERROR: ${JSON.stringify(error)}`);
};

const clientConnectionHandler = socket => {
  let socketAddress;
  socket.on('timeout', timeoutHandler);
  socket.on('close', () => connectionClosedHandler(socket));
  socket.on('error', errorHandler);
  socket.on('data', async message => {
    // if (!validateMessage(message)) {
    //   socket.write(
    //     `Invalid message: ${JSON.stringify(validateMessage.errors)}`,
    //   );
    //   return;
    // }
    ralli.collectMessage(socket, message);
  });
};

// Let's go
const server = jot.createServer({});
server.on('connection', clientConnectionHandler);
server.listen(PORT);
ralli.start();
