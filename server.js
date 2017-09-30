import jot from "json-over-tcp";
import Ajv from "ajv";
import schema from "./messages/schema.json";
import MessageType from "./data/messageType";
import Pummiralli from "./domain/pummiralli";

const validateMessage = new Ajv().compile(schema);

const PORT = 8099;
const ralli = new Pummiralli();

const connectionHandler = socket => {
  // Whenever a connection sends us an object...
  socket.on("data", async message => {
    if (!validateMessage(message)) {
      socket.write(
        `Invalid message: ${JSON.stringify(validateMessage.errors)}`
      );
    }

    // TODO: How do we identify bots - address? pass around some id?
    const address = socket.address().address;
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
        // TODO: Movement: bot moves I guess but data needs to go to ralli.
        // How should this work?
        ralli.collectEvent({
          type: "move",
          bot: address,
          angle: message.data.angle,
        });
        //bot.handleMove(message.data);
        socket.write(`moving bot from '${address}' to ${message.data.angle}`);

        break;
    }
  });
};

// Let's go
const server = jot.createServer({});
server.on("connection", connectionHandler);
server.listen(PORT);
