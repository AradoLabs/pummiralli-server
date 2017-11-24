// @flow
import jot from "json-over-tcp";
import Ajv from "ajv";
import schema from "./messages/schema.json";
import Pummiralli from "./domain/pummiralli";
require("babel-regenerator-runtime");

const validateMessage = new Ajv().compile(schema);
const PORT = 8099;
const ralli = new Pummiralli();

const clientConnectionHandler = socket => {
  socket.on("data", async message => {
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
server.on("connection", clientConnectionHandler);
server.listen(PORT);
ralli.start();
