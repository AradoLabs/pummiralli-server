export default class Pummiralli {
  constructor() {
    this.events = [];
    this.bots = [];
  }

  collectEvent(event) {
    this.events.push(event);
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
