// @flow

import jot from "json-over-tcp";
import { MessageType } from "../domain/message";

const PORT = 8099;

const moveMessage = {
  messageType: "move",
  data: { angle: Math.PI / 4 },
};

const joinMessage = {
  messageType: MessageType.join,
  data: { name: "test kikkula" },
};

const createConnection = () => {
  const socket = jot.connect(PORT, () => {
    // Send the initial message once connected
    console.log(`Sending ${JSON.stringify(joinMessage)}`);
    socket.write(joinMessage);
  });

  socket.on("data", data => {
    console.log(`Server's answer: ${JSON.stringify(data)}`);
    if (data.messageType === MessageType.gameStart) {
      console.log(`Sending ${JSON.stringify(moveMessage)}`);
      socket.write(moveMessage);
    }
  });
};

createConnection();
