// @flow
import type { Message, GameStartMessage } from "../domain/messages";
import Bot from "../domain/bot";

export default class Pummiralli {
  messages: Array<Message>;
  bots: Array<Bot>;
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
  }

  end() {
    const gameEndMessage = this.generateEndMessage();
    this.bots.map(bot => bot.sendMessage(gameEndMessage));
  }
}
