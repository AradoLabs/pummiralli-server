import chalk from 'chalk';
import Position from '../domain/position';

class Log {
  alert(message: string) {
    console.log(chalk.magenta(message));
  }
  error(message: string) {
    console.log(chalk.bold.red(message));
  }
  info(message: string) {
    console.log(chalk.cyan(message));
  }
  moveMessage(name: string, position: Position) {
    console.log(`Bot '${chalk.green(name)}' moved to (${position.x}, ${position.y})s`);
  }
  news(message: string) {
    console.log(chalk.yellow(message));
  }
  success(message: string) {
    console.log(chalk.bold.green(message));
  }
  vapor(message: string) {
    console.log(chalk.bgMagenta.bold.cyan(message));
  }
}
export default new Log();
