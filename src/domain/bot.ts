import { Socket } from 'net'
import { Message, PlayerPositionMessageData } from './messages'
import Position from './position'
import Map from './map'
import Log from '../util/log'

export enum Status {
  Preparing,
  Racing,
  Finished,
}

export default class Bot {
  name: string
  socket: Socket
  position: Position
  status: Status

  constructor(name: string, socket: Socket) {
    this.name = name
    this.socket = socket
    this.position = new Position(40, 40) // Tää pitäs olla kartan alkupiste a.k.a K-piste
    this.status = Status.Preparing
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
    Log.info(
      `STAMP: '${this.name}' at (${x}, ${y}) -- ${
        closeEnoughToCheckpoint ? 'CHECK!' : 'PUMMI'
      }`,
    )
  }
  handleFinish(map: Map): void {
    const { x, y } = this.position
    const closeEnoughToCheckpoint = map.closeEnoughToCheckpoint(this.position)
    Log.success(
      `FINISH: '${this.name}' at (${x}, ${y}) -- ${
        closeEnoughToCheckpoint ? 'CHECK!' : 'PUMMI'
      }`,
    )
    this.status = Status.Finished
  }
}
