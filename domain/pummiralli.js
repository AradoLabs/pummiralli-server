// @flow
import type {
  Message,
  GameStartMessage,
  TickMessage,
} from "../domain/messages";
import Bot from "../domain/bot";

export default class Pummiralli {
  allEvents: Array<TickMessage>;
  eventsReceivedDuringTick: Array<TickMessage>;
  bots: Array<Bot>;
  tickInterval: any;
  currentGameTick: number;

  constructor() {
    this.allEvents = [];
    this.eventsReceivedDuringTick = [];
    this.bots = [];
  }

  collectMessage(message: Message) {
    this.eventsReceivedDuringTick.push({
      tick: this.currentGameTick,
      message,
    });
  }

  join(bot: Bot) {
    this.bots.push(bot);
  }

  generateStartMessage(): GameStartMessage {
    return {
      messageType: "gameStart",
      data: {
        field: {},
      },
    };
  }

  start() {
    const gameStartMessage = this.generateStartMessage();
    this.bots.map(bot => bot.sendMessage(gameStartMessage));
    this.tickInterval = setInterval(() => {
      console.log("wait for clients!");
      this.tick();
    }, 500);
  }

  end() {
    clearInterval(this.tickInterval);
    const gameEndMessage = this.generateEndMessage();
    this.bots.map(bot => bot.sendMessage(gameEndMessage));
  }

  tick() {
    // Oletus: v = 5 min/km, tick = 5s
    //  => yhdellä tickillä etenee 16.65m
    this.bots.map(bot => bot.move(16.65));
  }
}
