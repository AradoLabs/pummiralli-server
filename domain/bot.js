// @flow
import type { Message, MoveMessageData } from "../domain/messages";
import Position from "./position";

export default class Bot {
  name: string;
  socket: any;
  moves: ?Array<MoveMessageData>;
  position: Position;

  constructor(name: string, socket: any) {
    this.name = name;
    this.socket = socket;
    this.position = new Position(0, 0); // Tää pitäs olla kartan alkupiste a.k.a K-piste
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

  move(distance: number) {
    if (this.moves.length > 0) {
      this.position.updatePosition(this.moves[0].angle, distance);
      this.moves = []; // Tartteeks botin tietää vanhoja moveja?
      console.log(`Bot '${this.name}' moved to (${this.position.x}, ${this.position.y})s`);
      // Pitäs lähettää clientille uus sijainti
    }
  }
}
