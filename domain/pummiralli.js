import db from "./db";

export default class Pummiralli {
  constructor(props) {
    super(props);
    this.bots = [];
  }

  join(bot) {
    this.bots.push(bot);
  }

  generateStartMessage() {}

  start() {
    const gameStartMessage = this.generateStartMessage();
    this.bots.map(bot => bot.sendMessage(gameStartMessage));
  }

  end() {
    const gameEndMessage = this.generateEndMessage();
    this.bots.map(bot => bot.sendMessage(gameEndMessage));
  }
}
