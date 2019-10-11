import { Message, PlayerPositionMessageData } from './messages'
import Position from './position'
import Map from './map'
import Log from '../util/log'

export default class Bot {
  name: string
  socket: any
  position: Position

  constructor(name: string, socket: any) {
    this.name = name
    this.socket = socket
    this.position = new Position(40, 40) // Tää pitäs olla kartan alkupiste a.k.a K-piste
  }

  getCurrentPosition(): PlayerPositionMessageData {
    return {
      name: this.name,
      position: this.position,
    }
  }

  sendMessage(message: Message): void {
    this.socket.write(JSON.stringify(message))
  }

  sendError(message: string): void {
    this.socket.write(message)
  }

  handleMove(angle: number, map: Map): void {
    this.position.updatePosition(angle, map.getSpeedAtPosition(this.position))
    Log.moveMessage(this.name, this.position)
  }

  handleStamp(map: Map): void {
    const { x, y } = this.position
    const closeEnoughToCheckpoint = map.closeEnoughToCheckpoint(this.position)
    console.log(
      `STAMP: '${this.name}' at (${x}, ${y}) -- ${
        closeEnoughToCheckpoint ? 'CHECK!' : 'PUMMI'
      }`,
    )
  }
}
