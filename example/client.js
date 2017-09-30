import jot from "json-over-tcp";
import MessageType from "../data/messageType";

const PORT = 8099;

const moveMessage = {
  messageType: MessageType.move,
  data: { angle: Math.PI / 4 },
};

const joinMessage = {
  messageType: MessageType.join,
  data: { name: "test kikkula" },
};

const createConnection = function () {
  const socket = jot.connect(PORT, () => {
    // Send the initial message once connected
    console.log(`Sending ${JSON.stringify(joinMessage)}`);
    socket.write(joinMessage);
  });

  socket.on("data", data => {
    if (data.messageType === MessageType.gameStart) {
      socket.write(moveMessage);
    }
    console.log(`Server's answer: ${JSON.stringify(data)}`);

    // Wait one second, then write a question to the socket
    setTimeout(() => {
      // Notice that we "write" a JSON object to the socket
      socket.write(moveMessage);
    }, 1000);
  });
};

createConnection();
