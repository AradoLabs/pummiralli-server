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
  Finish = 'finish',
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
  kPoint: Position
  goal: Position
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
  id: string
  position: Position
}

export type PlayerPositionsMessage = {
  messageType: 'playerPositions'
  data: Array<PlayerPositionMessageData>
}

export type PositionData = {
  position: Position
}

export type StampMessage = {
  messageType: 'stamp'
  data: PositionData
}

export type FinishMessage = {
  messageType: 'finish'
  data: PositionData
}

export type MessageByServer =
  | ErrorMessage
  | MapMessage
  | GameStartMessage
  | GameEndMessage
  | PlayerPositionsMessage
  | JoinMessage

export type MessageByClient =
  | JoinMessage
  | MoveMessage
  | StampMessage
  | FinishMessage

export type InvalidMessage = {
  messageType: 'invalid'
}

export type Message = MessageByServer | MessageByClient | InvalidMessage

export type ClientMessage = {
  tick: number
  message: Message
  socket: Socket
}

export type HistoryEvent = {
  tick: number
  message: Message
}
