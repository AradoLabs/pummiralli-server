// @flow

export default class Position {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  updatePosition(angle: number, distance: number) {
    this.x = this.x + Math.sin(angle) * distance;
    this.y = this.y + Math.cos(angle) * distance;
  }
}
