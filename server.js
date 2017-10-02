// @flow
import jot from "json-over-tcp";
import Ajv from "ajv";
import schema from "./messages/schema.json";

import { MessageType } from "./domain/messages";
import Pummiralli from "./domain/pummiralli";
import Bot from "./domain/bot";

const validateMessage = new Ajv().compile(schema);
const PORT = 8099;
const ralli = new Pummiralli();

const connectionHandler = socket => {
  // Whenever a connection sends us an object...
  let bot;
  socket.on("data", async message => {
    if (!validateMessage(message)) {
      socket.write(
        `Invalid message: ${JSON.stringify(validateMessage.errors)}`,
      );
      return;
    }
    ralli.collectMessage(message);

    // TODO: How do we identify bots - address? pass around some id?
    const address = socket.address().address;
    switch (message.messageType) {
      case MessageType.join: {
        bot = new Bot(message.data.name, socket);
        ralli.join(bot);
        socket.write(message);
        break;
      }
      case MessageType.move:
        if (!bot) {
          socket.write("Cannot move before joining!");
          return;
        }
        bot.handleMove({
          angle: message.data.angle,
        });
        socket.write(`moving bot from '${address}' to ${message.data.angle}`);
        break;
    }
  });
};

// Let's go
const server = jot.createServer({});
server.on("connection", connectionHandler);
server.listen(PORT);

setTimeout(() => {
  console.log("starting pummiralli!");
  ralli.start();
}, 5000);
