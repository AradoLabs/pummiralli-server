// @flow
import type Position from "./position";

export const MessageType = {
  join: "join",
  move: "move",
  gameStart: "gameStart",
  gameEnd: "gameEnd",
  playerPositions: "playerPositions",
  stamp: "stamp",
  error: "error",
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
  start: Position,
  goal: Position,
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

export type ErrorMessageData = {
  message: string,
};

export type ErrorMessage = {
  messageType: "error",
  data: ErrorMessageData,
};

export type Message =
  | JoinMessage
  | MoveMessage
  | GameStartMessage
  | GameEndMessage
  | PlayerPositionsMessage
  | StampMessage
  | ErrorMessage;

export type ClientMessage = {
  tick: number,
  message: Message,
  socket: any,
};
