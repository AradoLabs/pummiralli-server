import Position from './position'
import { MapMessageData } from './messages'

export default class Map {
  width: number
  height: number
  kPoint: Position
  goal: Position
  checkpoints: Array<Position>
  targets: Array<Position>

  constructor(mapData: MapMessageData) {
    const { width, height, kPoint, goal, checkpoints } = mapData
    this.height = height
    this.width = width
    this.kPoint = kPoint
    this.goal = goal
    this.checkpoints = checkpoints
    this.targets = [kPoint, ...checkpoints, goal]
  }

  getNextTarget() {
    if (this.targets.length > 1) {
      this.targets.shift()
    }
    return this.targets[0]
  }

  getSpeedAtPosition(position: Position): number {
    return 10
  }

  closeEnoughToCheckpoint(position: Position): boolean {
    return true
  }
}
