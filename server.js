import jot from 'json-over-tcp';
import testHandler from './handlers/test';
import { TEST_TYPE } from './messageTypes';

const PORT = 8099;

var server = jot.createServer({}, 5000);
server.on('connection', connectionHandler);

// Triggered whenever something connects to the server
function connectionHandler(socket) {
  // Whenever a connection sends us an object...
  socket.on('data', async data => {
    if (!data.messageType) {
      socket.write('Invalid or empty messageType');
    }
    console.log('data.messageType: ' + data.messageType);
    switch (data.messageType) {
      case TEST_TYPE:
        const response = await testHandler(data);
        socket.write(response);
        return;
      case JOIN:
        const response = await joinHandler(data);
        socket.write(response);
        return;
    }
  });
}

// Start listening
server.listen(PORT);
