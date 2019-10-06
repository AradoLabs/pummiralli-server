// @flow

import { Socket, AddressInfo, connect } from 'net'
import {
  MessageType,
  Message,
  StampMessage,
  MoveMessage,
} from '../domain/messages'
import { PlayerPositionMessageData } from '../domain/messages'
import Position from '../domain/position'
import { tryParseObject } from '../util/parser'

const PORT = 8099
let myName = 'test kikkula'
let current
let target

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
    (target.x - current.x) / Math.sqrt((target.y - current.y) ** 2 + 1e-12),
  )
  return {
    messageType: 'move',
    data: { angle: target.y - current.y < 0 ? Math.PI - atan : atan },
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
  console.log('I send: a stamp. ')
  // TODO: Send correct position
  return {
    messageType: 'stamp',
    data: {
      position: new Position(0, 0),
    },
  }
}

const myPosition = (playerPositions: Array<PlayerPositionMessageData>) => {
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
      console.log(`I send: ${JSON.stringify(joinMessage)}`)
      socket.write(JSON.stringify(joinMessage))
    },
  )

  socket.on('data', (data: string | Buffer) => {
    const message = tryParseObject(data) as Message
    console.log(`server says: ${JSON.stringify(message)}`)
    if (message.messageType === MessageType.GameStart) {
      current = message.data.start
      target = message.data.goal
      const moveMessageJson = JSON.stringify(moveMessage())
      console.log(`I send: ${moveMessageJson}`)
      socket.write(moveMessageJson)
    }
    if (message.messageType === MessageType.PlayerPositions) {
      current = myPosition(message.data)
      if (target !== undefined) {
        if (Math.random() < pummiRate) {
          socket.write(JSON.stringify(pummiMessage()))
        } else {
          socket.write(JSON.stringify(moveMessage()))
          if (
            Math.sqrt(
              (current.x - target.x) * (current.x - target.x) +
                (current.y - target.y) * (current.y - target.y),
            ) < 5.0
          ) {
            socket.write(JSON.stringify(stampMessage()))
          }
        }
      }
    }
  })
}

createConnection()
