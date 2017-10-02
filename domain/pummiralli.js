// @flow
import type { Message, GameStartMessage } from "../domain/messages";
import Bot from "../domain/bot";

export default class Pummiralli {
  messages: Array<Message>;
  bots: Array<Bot>;
  tickIntervalId: number;

  constructor() {
    this.messages = [];
    this.bots = [];
  }

  // for debug purposes
  collectMessage(message: Message) {
    this.messages.push(message);
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
    this.tickIntervalId = setInterval(() => {
      console.log("wait for clients!");
      this.tick();
    }, 500);
  }

  end() {
    clearInterval(this.tickIntervalId);
    const gameEndMessage = this.generateEndMessage();
    this.bots.map(bot => bot.sendMessage(gameEndMessage));
  }

  tick() {
    // Oletus: v = 5 min/km, tick = 5s
    //  => yhdellä tickillä etenee 16.65m 
    this.bots.map(bot => bot.move(16.65));
  }
}
