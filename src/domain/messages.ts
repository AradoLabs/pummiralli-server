import Position from './position'
import { Socket } from 'net'

export enum MessageType {
  Error = 'error',
  Join = 'join',
  Move = 'move',
  Map = 'map',
  GameStart = 'gameStart',
  GameEnd = 'gameEnd',
  PlayerPositions = 'playerPositions',
  Stamp = 'stamp',
}

export type ErrorMessage = {
  messageType: 'error'
  message: string
}

export type JoinMessageData = {
  name: string
}

export type JoinMessage = {
  messageType: 'join'
  data: JoinMessageData
}

export type MoveMessageData = {
  angle: number
}

export type MoveMessage = {
  messageType: 'move'
  data: MoveMessageData
}

export type MapMessageData = {
  width: number
  height: number
  checkpoints: Array<Position>
}

export type MapMessage = {
  messageType: 'map'
  data: MapMessageData
}

export type GameStartMessageData = {
  start: Position
  goal: Position
}

export type GameStartMessage = {
  messageType: 'gameStart'
  data: GameStartMessageData
}

export type GameEndMessageData = {
  winner: any
}

export type GameEndMessage = {
  messageType: 'gameEnd'
  data: GameEndMessageData
}

export type PlayerPositionMessageData = {
  name: string
  position: Position
}

export type PlayerPositionsMessage = {
  messageType: 'playerPositions'
  data: Array<PlayerPositionMessageData>
}

export type StampMessageData = {
  position: Position
}

export type StampMessage = {
  messageType: 'stamp'
  data: StampMessageData
}

export type Message =
  | ErrorMessage
  | JoinMessage
  | MoveMessage
  | MapMessage
  | GameStartMessage
  | GameEndMessage
  | PlayerPositionsMessage
  | StampMessage
  | MapMessage

export type ClientMessage = {
  tick: number
  message: Message
  socket: Socket
}
