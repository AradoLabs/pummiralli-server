// @flow

import jot from "json-over-tcp";
import { MessageType } from "../domain/messages";
import type { PlayerPositionMessageData } from "../domain/messages";
import Position from "../domain/position";

const PORT = 8099;
let myName = "test kikkula";
let current;
let target;

if (process.argv.length > 2) {
  myName = process.argv[2];
  console.log(`My name: ${myName}`);
}

let pummiRate = 0;
if (process.argv.length > 3) {
  pummiRate = parseFloat(process.argv[3]);
  console.log(`My pummirate: ${pummiRate}`);
  if (pummiRate < 0 || pummiRate > 1 || isNaN(pummiRate)) {
    throw Error("ooppa ny rehelline!");
  }
}

const moveMessage = () => {
  const atan = Math.atan(
    (target.x - current.x) / Math.sqrt((target.y - current.y) ** 2 + 1e-12)
  );
  return {
    messageType: "move",
    data: { angle: target.y - current.y < 0 ? Math.PI - atan : atan },
  };
};

const pummiMessage = () => {
  console.log("PUMMI! Where the fuck am I?");
  return {
    messageType: "move",
    data: { angle: Math.random() * 2 * Math.PI },
  };
};

const stampMessage = () => {
  console.log("I send: a stamp. ");
  return {
    messageType: "stamp",
  };
};

const myPosition = (playerPositions: Array<PlayerPositionMessageData>) => {
  const playerInfo = playerPositions.find(player => myName === player.name);
  if (playerInfo && playerInfo.position) {
    return playerInfo.position;
  }
  return new Position(0, 0);
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
      console.log(`I send: ${JSON.stringify(moveMessage())}`);
      socket.write(moveMessage());
    }
    if (message.messageType === MessageType.playerPositions) {
      current = myPosition(message.data);
      if (target !== undefined) {
        if (Math.random() < pummiRate) {
          socket.write(pummiMessage());
        } else {
          socket.write(moveMessage());
          if (
            Math.sqrt(
              (current.x - target.x) * (current.x - target.x) +
                (current.y - target.y) * (current.y - target.y)
            ) < 5.0
          ) {
            socket.write(stampMessage());
          }
        }
      }
    }
  });
};

createConnection();
