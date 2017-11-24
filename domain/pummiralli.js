// @flow
import type {
  Message,
  GameStartMessage,
  GameEndMessage,
  PlayerPositionsMessage,
  ClientMessage,
} from "../domain/messages";
import { MessageType } from "../domain/messages";
import Bot from "../domain/bot";
import Position from "./position";

const GAME_START_DELAY = 10000;
const TICK_INTERVAL = 1000;

export default class Pummiralli {
  eventsReceived: Array<ClientMessage>;
  eventHistory: Array<ClientMessage>;
  bots: Array<Bot>;
  tickInterval: any;
  currentGameTick: number;

  constructor() {
    this.eventsReceived = [];
    this.eventHistory = [];
    this.bots = [];
    this.currentGameTick = 0;
  }

  collectMessage(socket: any, message: Message) {
    const client = socket.address();
    console.log(
      `received '${message.messageType}' from ${client.address}:${client.port}`
    );
    this.eventsReceived.push({
      tick: this.currentGameTick,
      socket,
      message,
    });
  }

  join(bot: Bot) {
    this.bots.push(bot);
  }

  drop(socket: any) {
    const botToBeDropped = this.bots.find(b => b.socket === socket);
    if (!botToBeDropped) {
      console.log("could not find bot to be dropped!");
      return;
    }
    this.bots.splice(this.bots.indexOf(botToBeDropped), 1);
    console.log(`removed bot`);
    return;
  }

  generateStartMessage(): GameStartMessage {
    return {
      messageType: MessageType.gameStart,
      data: {
        start: new Position(0, 0),
        goal: new Position(-4900, 4900),
      },
    };
  }

  generateEndMessage(): GameEndMessage {
    return {
      messageType: MessageType.gameEnd,
      data: {
        winner: {},
      },
    };
  }

  generatePlayerPositionsMessage(): PlayerPositionsMessage {
    return {
      messageType: MessageType.playerPositions,
      data: this.bots.map(bot => bot.getCurrentPosition()),
    };
  }

  start() {
    this.tickInterval = setInterval(() => {
      this.tick();
      console.log(
        `tick ${this.currentGameTick} - waiting for ${TICK_INTERVAL}ms`
      );
    }, TICK_INTERVAL);
    console.log(
      `Pummiralli starting in ${GAME_START_DELAY}ms - waiting for bots..`
    );
    setTimeout(() => {
      if (this.bots.length === 0) {
        console.log("no bots connected!");
        clearInterval(this.tickInterval);
        return;
      }
      console.log("generating start message");
      const gameStartMessage = this.generateStartMessage();
      console.log(`sending start message to ${this.bots.length} bots`);
      this.bots.map(bot => bot.sendMessage(gameStartMessage));
    }, GAME_START_DELAY);
  }

  end() {
    clearInterval(this.tickInterval);
    const gameEndMessage = this.generateEndMessage();
    this.bots.map(bot => bot.sendMessage(gameEndMessage));
  }

  processEventsReceivedDuringTick() {
    this.eventsReceived.forEach(event => {
      this.process(event);
      this.eventHistory.push(event);
    });
    if (this.eventsReceived.length > 0) {
      console.log(`${this.eventHistory.length} events in history`);
    }
    this.eventsReceived.length = 0;
  }

  process(event: ClientMessage) {
    const message = event.message;
    console.log(
      `processing event received during tick (type: ${message.messageType})`
    );
    switch (message.messageType) {
      case MessageType.join: {
        const bot = new Bot(message.data.name, event.socket);
        if (this.bots.map(b => b.name).includes(message.data.name)) {
          bot.sendMessage(`The name '${message.data.name}' is already in use`);
        } else {
          this.join(bot);
          // for now just send the same join message back
          bot.sendMessage(message);
        }
        break;
      }
      case MessageType.move: {
        const bot = this.bots.find(b => b.socket === event.socket);
        if (!bot) {
          event.socket.write("could not find joined bot!");
          break;
        }
        bot.handleMove({
          angle: message.data.angle,
        });
        break;
      }
    }
  }

  tick() {
    this.processEventsReceivedDuringTick();
    this.currentGameTick++;
    const playerPositionsMessage = this.generatePlayerPositionsMessage();
    this.bots.map(bot => bot.sendMessage(playerPositionsMessage));
  }
}
