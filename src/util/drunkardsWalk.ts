import Position from '../domain/position'

enum Direction {
  Up = 1,
  Right,
  Down,
  Left,
}

const isOutside = (
  position: Position,
  mapHeight: number,
  mapWidth: number,
): boolean => {
  return (
    position.x < 0 &&
    mapWidth < position.x &&
    position.y < 0 &&
    mapHeight < position.y
  )
}

const isForbidden = (
  position: Position,
  forbiddenPositions: Array<Position>,
): boolean => {
  return forbiddenPositions.some(
    forbiddenPosition =>
      forbiddenPosition.x === position.x && forbiddenPosition.y === position.y,
  )
}

const generateInitialPosition = (
  mapHeight: number,
  mapWidth: number,
  forbiddenPositions: Array<Position>,
): Position => {
  const initialPosition = new Position(
    Math.floor(Math.random() * mapWidth) + 1,
    Math.floor(Math.random() * mapHeight) + 1,
  )

  if (isForbidden(initialPosition, forbiddenPositions)) {
    return generateInitialPosition(mapHeight, mapWidth, forbiddenPositions)
  }
  return initialPosition
}

const getRandomDirection = (): string => {
  const numberValue = Math.floor(Math.random() * 4) + 1
  return Direction[numberValue]
}

const step = (
  currentPosition: Position,
  mapHeight: number,
  mapWidth: number,
  forbiddenPositions: Array<Position>,
): Position => {
  let nextPosition
  const direction = getRandomDirection()
  switch (direction.toString()) {
    case Direction[Direction.Up]: {
      nextPosition = new Position(currentPosition.x, currentPosition.y + 1)
      break
    }
    case Direction[Direction.Right]: {
      nextPosition = new Position(currentPosition.x + 1, currentPosition.y)
      break
    }
    case Direction[Direction.Down]: {
      nextPosition = new Position(currentPosition.x, currentPosition.y - 1)
      break
    }
    case Direction[Direction.Left]: {
      nextPosition = new Position(currentPosition.x - 1, currentPosition.y)
      break
    }
  }

  if (
    isOutside(nextPosition, mapHeight, mapWidth) ||
    isForbidden(nextPosition, forbiddenPositions)
  ) {
    return step(currentPosition, mapHeight, mapWidth, forbiddenPositions)
  }
  return nextPosition
}

// Generates a random path on map
// Start from random position and take `length` steps, always
// randomising the next direction.
// `forbiddenPositions` are disallowed but theoretically the path
// can currently be going back and forth between two positions
export const walk = (
  length: number,
  mapHeight: number,
  mapWidth: number,
  forbiddenPositions: Array<Position>,
): Array<Position> => {
  const initialPosition = generateInitialPosition(
    mapHeight,
    mapWidth,
    forbiddenPositions,
  )
  const path = [initialPosition]
  for (let i = 1; i <= length; i += 1) {
    path.push(
      step(path[path.length - 1], mapHeight, mapWidth, forbiddenPositions),
    )
  }
  return path
}
