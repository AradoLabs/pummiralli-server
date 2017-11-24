// @flow
import type Position from "./position";

export const MessageType = {
  join: "join",
  move: "move",
  gameStart: "gameStart",
  gameEnd: "gameEnd",
  playerPositions: "playerPositions",
  stamp: "stamp",
};

export type JoinMessageData = {
  name: string,
};

export type JoinMessage = {
  messageType: "join",
  data: JoinMessageData,
};

export type MoveMessageData = {
  angle: number,
};

export type MoveMessage = {
  messageType: "move",
  data: MoveMessageData,
};

export type GameStartMessageData = {
  field: any,
};

export type GameStartMessage = {
  messageType: "gameStart",
  data: GameStartMessageData,
};

export type GameEndMessageData = {
  winner: any,
};

export type GameEndMessage = {
  messageType: "gameEnd",
  data: GameEndMessageData,
};

export type PlayerPositionMessageData = {
  name: string,
  position: Position,
};

export type PlayerPositionsMessage = {
  messageType: "playerPositions",
  data: Array<PlayerPositionMessageData>,
};

export type StampMessageData = {
  position: Position,
};

export type StampMessage = {
  messageType: "stamp",
  data: StampMessageData,
};

export type Message =
  | JoinMessage
  | MoveMessage
  | GameStartMessage
  | GameEndMessage
  | PlayerPositionsMessage
  | StampMessage;

export type ClientMessage = {
  tick: number,
  message: Message,
  socket: any,
};
