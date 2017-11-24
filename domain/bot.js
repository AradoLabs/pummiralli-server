// @flow
import type {
  Message,
  MoveMessageData,
  PlayerPositionMessageData,
  StampMessageData,
} from "../domain/messages";
import Position from "./position";

export default class Bot {
  name: string;
  socket: any;
  position: Position;

  constructor(name: string, socket: any) {
    this.name = name;
    this.socket = socket;
    this.position = new Position(0, 0); // Tää pitäs olla kartan alkupiste a.k.a K-piste
  }

  getCurrentPosition(): PlayerPositionMessageData {
    return {
      name: this.name,
      position: this.position,
    };
  }

  sendMessage(message: Message) {
    this.socket.write(message);
  }

  handleMove(message: MoveMessageData) {
    this.position.updatePosition(message.angle, 1);
    console.log(
      `Bot '${this.name}' moved to (${this.position.x}, ${this.position.y})s`,
    );
  }

  handleStamp(message: StampMessageData) {
    console.log(`Stamp received: x: '${message}' y: '${message}'`);
  }
}
