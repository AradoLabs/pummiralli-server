import jot from 'json-over-tcp';
import { TEST_TYPE, JOIN } from '../messageTypes';

const PORT = 8099;

const testMessage = {
  messageType: TEST_TYPE,
  name: 'test kikkula',
};

const joinMessage = {
  messageType: JOIN,
  name: 'test kikkula',
};

// Creates one connection to the server when the server starts listening
function createConnection() {
  // Start a connection to the server
  var socket = jot.connect(PORT, function() {
    // Send the initial message once connected
    socket.write(joinMessage);
  });

  // Whenever the server sends us an object...
  socket.on('data', function(data) {
    // Output the answer property of the server's message to the console
    console.log("Server's answer: " + JSON.stringify(data));

    // Wait one second, then write a question to the socket
    setTimeout(function() {
      // Notice that we "write" a JSON object to the socket
      socket.write(testMessage);
    }, 1000);
  });
}

createConnection();
