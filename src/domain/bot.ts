import { Socket } from 'net'
import { v4 as uuid } from 'uuid'
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
  id: string
  socket: Socket
  position: Position
  angle: number
  status: Status

  constructor(name: string, socket: Socket) {
    this.name = name
    this.id = uuid()
    this.socket = socket
    this.position = new Position(40, 40) // Tää pitäs olla kartan alkupiste a.k.a K-piste
    this.angle = 0
    this.status = Status.Preparing
  }

  getCurrentPosition(): PlayerPositionMessageData {
    return {
      id: this.id,
      name: this.name,
      position: {
        x: this.position.x,
        y: this.position.y,
      },
    }
  }

  sendMessage(message: Message): void {
    this.socket.write(JSON.stringify(message))
  }

  sendError(message: string): void {
    this.socket.write(message)
  }

  handleMove(angle: number, map: Map): void {
    this.angle = this.pummiFactor(angle)
    console.log(this.position.x)
    this.position.updatePosition(
      this.angle,
      map.getSpeedAtPosition(this.position),
    )
    Log.moveMessage(this.name, this.position)
  }

  pummiFactor(angle: number): number {
    // Standard normal distribution with box-muller transform https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
    let u1 = Math.random()
    let u2 = Math.random()
    let z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return angle + z0 * (Math.PI / 3)
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
