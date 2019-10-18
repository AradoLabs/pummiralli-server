export type PositionObject = {
  x: number
  y: number
}

export default class Position {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  updatePosition(angle: number, speed: number) {
    this.x = this.x + Math.sin(angle) * speed
    this.y = this.y + Math.cos(angle) * speed
  }
}
