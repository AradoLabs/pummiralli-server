import { Message, MoveMessageData, PlayerPositionMessageData } from './messages';
import Position from './position';
import Log from '../util/log';

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

  sendError(message: string) {
    this.socket.write(message);
  }

  handleMove(message: MoveMessageData) {
    this.position.updatePosition(message.angle, 1);
    Log.moveMessage(this.name, this.position);
  }

  handleStamp() {
    const { x, y } = this.position;
    console.log(`STAMP: '${this.name}' at (${x}, ${y})`);
  }
}
