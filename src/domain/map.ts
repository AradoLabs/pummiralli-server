import Position from './position';

export default class Map {
  width: number;
  height: number;
  checkpoints: Array<Position>;

  constructor() {
    this.width = 5000;
    this.height = 5000;
    this.checkpoints = [new Position(100, 100), new Position(4200, 2500)];
  }

  getSpeedAtPosition(position: Position): number {
    return 1;
  }

  closeEnoughToCheckpoint(position: Position): boolean {
    return true;
  }
}
