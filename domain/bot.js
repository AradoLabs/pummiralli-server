// @flow
import type { Message, PlayerPositionMessageData } from "../domain/messages";
import Position from "./position";
import Map from "./map";

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

  handleMove(angle: number, map: Map) {
    const { x, y } = this.position;
    this.position.updatePosition(angle, map.getSpeedAtPosition(this.position));
    console.log(`${this.name} moved to (${x}, ${y})`);
  }

  handleStamp(map: Map) {
    const { x, y } = this.position;
    const closeEnoughToCheckpoint = map.closeEnoughToCheckpoint(this.position);
    console.log(
      `STAMP: '${this.name}' at (${x}, ${y}) -- ${closeEnoughToCheckpoint
        ? "CHECK!"
        : "PUMMI"}`,
    );
  }
}
