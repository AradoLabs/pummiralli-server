import jot from "json-over-tcp";
import testHandler from "./handlers/test";
import joinHandler from "./handlers/join";
import { TEST_TYPE, JOIN } from "./messageTypes";

const PORT = 8099;

var server = jot.createServer({});
server.on("connection", connectionHandler);

// Triggered whenever something connects to the server
function connectionHandler(socket) {
  // Whenever a connection sends us an object...
  socket.on("data", async data => {
    if (!data.messageType) {
      socket.write("Invalid or empty messageType");
    }
    let whoBeTheBot = null;
    console.log("data.messageType: " + data.messageType);
    switch (data.messageType) {
      case TEST_TYPE:
        const response = await testHandler(data);
        socket.write(response);
        return;
      case JOIN:
        whoBeTheBot = data.bot;
        socket.write(await joinHandler(data));
        return;
      case MOVE:
        socket.write(await moveHandler(whoBeTheBot, data));
        return;
    }
  });
}

// Start listening
server.listen(PORT);
