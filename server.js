import jot from "json-over-tcp";
import testHandler from "./handlers/test";
import joinHandler from "./handlers/join";
import MessageType from "./data/messageType";
import Pummiralli from "./domain/pummiralli";

const PORT = 8099;
const ralli = new Pummiralli();

const connectionHandler = socket => {
  // Whenever a connection sends us an object...
  socket.on("data", async message => {
    if (!message.messageType) {
      socket.write("Invalid or empty messageType");
    }
    console.log(`received data.messageType: ${message.messageType}`);
    let bot;
    switch (message.messageType) {
      case MessageType.join: {
        bot = {
          name: message.data.name,
          connection: socket,
        };
        ralli.join(bot);
        socket.write(message);
        break;
      }
      case MessageType.move:
        bot.handleMove(message.data);
        socket.write(`moving ${bot.name} to ${message.data.angle}`);
        break;
    }
  });
};

// Let's go
const server = jot.createServer({});
server.on("connection", connectionHandler);
server.listen(PORT);
