// @flow

import { Socket, connect } from 'net'
import {
  MessageType,
  StampMessage,
  FinishMessage,
  MoveMessage,
  GameStartMessage,
  PlayerPositionsMessage,
  PlayerPositionMessageData,
  MapMessage,
} from '../domain/messages'
import Map from '../domain/map'
import Position from '../domain/position'
import Log from '../util/log'
import { tryParseObject as tryParseMessage } from '../util/parser'

const PORT = 8099
let myName = 'test kikkula'
let currentPosition
let map: Map
let target: Position

declare let process: {
  argv: Array<string>
}

if (process.argv.length > 2) {
  myName = process.argv[2]
  console.log(`My name: ${myName}`)
}

let pummiRate = 0
if (process.argv.length > 3) {
  pummiRate = parseFloat(process.argv[3])
  console.log(`My pummirate: ${pummiRate}`)
  if (pummiRate < 0 || pummiRate > 1 || isNaN(pummiRate)) {
    throw Error('ooppa ny rehelline!')
  }
}

const moveMessage = (): MoveMessage => {
  const atan = Math.atan(
    (target.x - currentPosition.x) /
      Math.sqrt((target.y - currentPosition.y) ** 2 + 1e-12),
  )
  return {
    messageType: 'move',
    data: { angle: target.y - currentPosition.y < 0 ? Math.PI - atan : atan },
  }
}

const pummiMessage = (): MoveMessage => {
  console.log('PUMMI! Where the fuck am I?')
  return {
    messageType: 'move',
    data: { angle: Math.random() * 2 * Math.PI },
  }
}

const stampMessage = (): StampMessage => {
  return {
    messageType: 'stamp',
    data: {
      position: currentPosition,
    },
  }
}

const finishMessage = (): FinishMessage => {
  return {
    messageType: 'finish',
    data: {
      position: currentPosition,
    },
  }
}

const myPosition = (
  playerPositions: Array<PlayerPositionMessageData>,
): Position => {
  const playerInfo = playerPositions.find(player => myName === player.name)
  if (playerInfo && playerInfo.position) {
    return playerInfo.position
  }
  return new Position(0, 0)
}

const joinMessage = {
  messageType: MessageType.Join,
  data: { name: myName },
}

const createConnection = (): void => {
  const socket = connect(
    PORT,
    'localhost',
    () => {
      // Send the initial message once connected
      console.log(`Joining: ${JSON.stringify(joinMessage)}`)
      socket.write(JSON.stringify(joinMessage))
    },
  )

  const handleMapMessage = (socket: Socket, message: MapMessage): void => {
    Log.info(`Received map: ${JSON.stringify(message.data)}`)
    map = new Map(message.data)
    target = message.data.kPoint
  }

  const handleStartMessage = (
    socket: Socket,
    message: GameStartMessage,
  ): void => {
    Log.info('Starting the ralli!')
    currentPosition = message.data.start
    const moveMessageJson = JSON.stringify(moveMessage())
    Log.info(`First move: ${moveMessageJson}`)
    socket.write(moveMessageJson)
  }

  const stamp = (socket: Socket): void => {
    const stampMessageJson = JSON.stringify(stampMessage())
    Log.info(`Stamping: ${stampMessageJson}`)
    socket.write(stampMessageJson)
    target = map.getNextTarget()
  }

  const finish = (socket: Socket): void => {
    const finishMessageJson = JSON.stringify(finishMessage())
    Log.info(`Finishing: ${finishMessageJson}`)
    socket.write(finishMessageJson)
  }

  const handlePlayerPositionsMessage = (
    socket: Socket,
    message: PlayerPositionsMessage,
  ): void => {
    currentPosition = myPosition(message.data)

    if (!target) {
      Log.debug('Client: No target set')
      return
    }

    if (Math.random() < pummiRate) {
      socket.write(JSON.stringify(pummiMessage()))
      return
    }
    if (
      // Have a discussion with Jarno - or someone who knows goddamn math
      Math.sqrt(
        (currentPosition.x - target.x) * (currentPosition.x - target.x) +
          (currentPosition.y - target.y) * (currentPosition.y - target.y),
      ) < 5.0
    ) {
      if (target === map.goal) {
        finish(socket)
        return
      }
      stamp(socket)
      return
    }
    // Keep moving if nothing else
    socket.write(JSON.stringify(moveMessage()))
  }

  socket.on('data', (data: string | Buffer) => {
    const message = tryParseMessage(data)
    if (message.messageType === MessageType.Map) {
      handleMapMessage(socket, message)
    }
    if (message.messageType === MessageType.GameStart) {
      handleStartMessage(socket, message)
    }
    if (message.messageType === MessageType.PlayerPositions) {
      handlePlayerPositionsMessage(socket, message)
    }
  })
}

createConnection()
