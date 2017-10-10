// @flow

import jot from "json-over-tcp";
import { MessageType } from "../domain/messages";

const PORT = 8099;
const myName = "test kikkula";
let current;
let target;

const moveMessage = () => {
  const atan = Math.atan((target.x - current.x) / Math.sqrt((target.y - current.y) ** 2 + 1e-12));
  return {
    messageType: "move",
    data: { angle: (target.y - current.y) < 0 ? Math.PI - atan : atan },
  };
};

const myPosition = (playerPositions) => {
  let my;
  playerPositions.forEach(data => {
    if (myName === data.name) {
      my = data.position;
      return;
    }
  });
  return my;
};

const joinMessage = {
  messageType: MessageType.join,
  data: { name: myName },
};

const createConnection = () => {
  const socket = jot.connect(PORT, () => {
    // Send the initial message once connected
    console.log(`I send: ${JSON.stringify(joinMessage)}`);
    socket.write(joinMessage);
  });

  socket.on("data", message => {
    console.log(`server says: ${JSON.stringify(message)}`);
    if (message.messageType === MessageType.gameStart) {
      current = message.data.start;
      target = message.data.goal;
      console.log(`I sends: ${JSON.stringify(moveMessage())}`);
      socket.write(moveMessage());
    }
    if (message.messageType === MessageType.playerPositions) {
      current = myPosition(message.data);
      if (target !== undefined) {
        socket.write(moveMessage());
      }
    }
  });
};

createConnection();
