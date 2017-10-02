// @flow
import type { Message, MoveMessageData } from "../domain/messages";

export default class Bot {
  name: string;
  socket: any;
  moves: ?Array<MoveMessageData>;

  constructor(name: string, socket: any) {
    this.name = name;
    this.socket = socket;
  }

  handleMove(messageData: MoveMessageData) {
    if (!this.moves) {
      this.moves = [];
    }
    this.moves.push(messageData);
  }

  sendMessage(message: Message) {
    this.socket.write(message);
  }
}
