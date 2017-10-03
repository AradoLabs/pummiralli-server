// @flow

export const MessageType = {
  join: "join",
  move: "move",
  gameStart: "gameStart",
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

export type Message = JoinMessage | MoveMessage | GameStartMessage;

export type TickMessage = {
  tick: number,
  message: Message,
};
