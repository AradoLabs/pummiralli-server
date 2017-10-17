// @flow

import jot from "json-over-tcp";
import { MessageType } from "../domain/messages";

const PORT = 8099;
const myName = "test kikkula";
let current;
let target;

let pummiRate = 0;
if (process.argv.length > 2) {
  pummiRate = parseFloat(process.argv[2]);
  console.log(`My pummirate: ${pummiRate}`);
  if (pummiRate < 0 || pummiRate > 1 || isNaN(pummiRate)) {
    throw Error("ooppa ny rehelline!");
  }
}

const moveMessage = () => {
  const atan = Math.atan((target.x - current.x) / Math.sqrt((target.y - current.y) ** 2 + 1e-12));
  return {
    messageType: "move",
    data: { angle: (target.y - current.y) < 0 ? Math.PI - atan : atan },
  };
};

const pummiMessage = () => {
  console.log("PUMMI! Where the fuck am I?");
  return {
    messageType: "move",
    data: { angle: Math.random() * 2 * Math.PI },
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
        if (Math.random() < pummiRate) {
          socket.write(pummiMessage());
        } else {
          socket.write(moveMessage());
        }
      }
    }
  });
};

createConnection();
