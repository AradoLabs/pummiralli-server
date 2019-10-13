import { PositionObject } from '../domain/position'
import fs from 'fs'
import Log from './log'

type PositionWithTerrain = PositionObject & { terrain?: string }

// TODO: Clean up, enum name to value conversions are a pain
const TerrainType = ['Field', 'LightForest', 'DenseForest', 'Swamp']
// enum TerrainType {
//   Field = 'Field',
//   LightForest = 'LightForest',
//   DenseForest = 'DenseForest',
//   Swamp = 'Swamp',
// }

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Fisher_and_Yates >> Original method
const shuffle = (array: Array<number>): Array<number> => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i)
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

const getSurroundingPositions = (
  coodX: number,
  coordY: number,
  mapHeight: number,
  mapWidth: number,
): Array<PositionObject> => {
  const surroundingPositions = [
    {
      x: coodX - 1,
      y: coordY + 1,
    },
    {
      x: coodX,
      y: coordY + 1,
    },
    {
      x: coodX + 1,
      y: coordY + 1,
    },
    {
      x: coodX + 1,
      y: coordY,
    },
    {
      x: coodX + 1,
      y: coordY - 1,
    },
    {
      x: coodX,
      y: coordY - 1,
    },
    {
      x: coodX - 1,
      y: coordY - 1,
    },
    {
      x: coodX - 1,
      y: coordY,
    },
  ]
  return surroundingPositions.filter(
    pos => 0 <= pos.x && 0 <= pos.y && pos.x <= mapWidth && pos.y <= mapHeight,
  )
}

const deduceTerrain = (
  x: number,
  y: number,
  mapPositions: Array<Array<string>>,
  mapHeight: number,
  mapWidth: number,
): string => {
  const surroundingPositions = getSurroundingPositions(
    x,
    y,
    mapHeight,
    mapWidth,
  )
  let surroundingTerrains = surroundingPositions.map(({ x, y }) => {
    if (typeof mapPositions[x][y] === undefined) {
      return undefined
    }
    return mapPositions[x][y]
  })

  surroundingTerrains = surroundingTerrains.filter(terrain => !!terrain)

  if (surroundingTerrains.length === 0) {
    return undefined
  }

  // 'Weighed' random terrain: allow multiples
  const randomTerrainIndex =
    Math.floor(Math.random() * surroundingTerrains.length) + 1
  surroundingTerrains.unshift('')
  return surroundingTerrains[randomTerrainIndex]
}

const find2dIndex = (index: number, mapWidth: number): [number, number] => [
  index % mapWidth,
  Math.floor(index / mapWidth),
]

const notFilled = (
  oneDimensionIndex: number,
  mapPositions: Array<Array<string>>,
  mapWidth: number,
): boolean => {
  const [x, y] = find2dIndex(oneDimensionIndex, mapWidth)
  return !mapPositions[x][y]
}

// Fills map with random terrain from `TerrainType` (TODO: Change to use from parameter)
//
// Initially places seed terrain and then loops to expand those to empty coordinates
export const generate = (
  mapWidth: number,
  mapHeight: number,
): Array<PositionWithTerrain> => {
  const mapPositions = [[]]
  for (let i = mapWidth; i >= 0; i -= 1) {
    mapPositions[i] = new Array(mapHeight)
  }
  const oneDimensionIndexes = Array.from(Array(mapWidth * mapHeight).keys())
  shuffle(oneDimensionIndexes)

  // Populate initial terrain "seeds"
  for (let index = 0; index < Object.values(TerrainType).length; index += 1) {
    const [x, y] = find2dIndex(oneDimensionIndexes[index], mapWidth)
    console.log(`x: ${x}, y: ${y}`)
    mapPositions[x][y] = TerrainType[index]
  }

  let empties = oneDimensionIndexes.filter(oneDimensionIndex =>
    notFilled(oneDimensionIndex, mapPositions, mapWidth),
  )

  while (empties.length > 0) {
    for (let index = 0; index < empties.length; index += 1) {
      const oneDimensionalIndex = empties[index]
      const [x, y] = find2dIndex(oneDimensionalIndex, mapWidth)

      const terrainType = deduceTerrain(x, y, mapPositions, mapHeight, mapWidth)

      if (terrainType) {
        mapPositions[x][y] = terrainType
      }
    }
    empties = oneDimensionIndexes.filter(oneDimensionIndex =>
      notFilled(oneDimensionIndex, mapPositions, mapWidth),
    )
  }

  const map = oneDimensionIndexes.map(oneDimensionalIndex => {
    const [x, y] = find2dIndex(oneDimensionalIndex, mapWidth)
    return {
      x,
      y,
      terrain: mapPositions[x][y],
    }
  })

  map.sort((a, b) => {
    //sort by x, secondary by y
    return a.x == b.x ? a.y - b.y : a.x - b.x
  })

  // TODO: Duplicate from `server.ts` - extract util maybe?
  const resultsDir = './.maps'
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir)
  }
  const filePath = `${resultsDir}/${new Date().toISOString()}`
  Log.debug(`Writing map to file ${filePath}`)
  fs.writeFile(`${filePath}.json`, JSON.stringify(map), 'utf8', err => {
    if (err) {
      Log.error('Error writing results to JSON:')
      Log.error(err.toString())
    }
  })

  return map
}
