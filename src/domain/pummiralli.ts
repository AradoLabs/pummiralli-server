import {
  Message,
  MapMessage,
  GameStartMessage,
  GameEndMessage,
  PlayerPositionsMessage,
  ClientMessage,
  HistoryEvent,
} from './messages'
import { MessageType } from './messages'
import Bot, { Status } from './bot'
import Position from './position'
import Map from './map'
import Log from '../util/log'
import { Socket, AddressInfo } from 'net'

const MAP_DELAY = 10000
const GAME_START_DELAY = 20000
const TICK_INTERVAL = 30

enum RalliStatus {
  Stopped,
  Running,
}

export default class Pummiralli {
  shutdownCallback: Function
  eventsReceived: Array<ClientMessage>
  eventHistory: Array<HistoryEvent>
  bots: Array<Bot>
  tickInterval: NodeJS.Timeout
  currentGameTick: number
  map: Map
  ralliStatus: RalliStatus

  constructor() {
    this.eventsReceived = []
    this.eventHistory = []
    this.bots = []
    this.currentGameTick = 0
    this.map = new Map({
      width: 1024,
      height: 576,
      kPoint: new Position(50, 50),
      goal: new Position(700, 470),
      checkpoints: [
        new Position(100, 100),
        new Position(500, 120),
        new Position(300, 300),
      ],
    })
    this.ralliStatus = RalliStatus.Stopped
  }

  collectMessage(socket: Socket, message: Message): void {
    // const clientAddress = socket._socket.address() as AddressInfo
    const clientInfo = socket.address() as AddressInfo
    Log.news(
      `received '${message.messageType}' from ${clientInfo.address}:${clientInfo.port}`,
    )
    this.eventsReceived.push({
      tick: this.currentGameTick,
      socket,
      message,
    })
  }

  join(bot: Bot): void {
    this.bots.push(bot)
    Log.debug(`BOT JOINED:`)
    Log.debugBot(bot)
  }

  drop(socket: Socket): void {
    const botToBeDropped = this.bots.find(b => b.socket === socket)
    if (!botToBeDropped) {
      Log.error('could not find bot to be dropped!')
      return
    }
    this.bots.splice(this.bots.indexOf(botToBeDropped), 1)
    Log.vapor(`removed bot`)
    return
  }

  generateStartMessage(): GameStartMessage {
    return {
      messageType: MessageType.GameStart,
      data: { start: new Position(40, 40), goal: new Position(400, 400) },
    }
  }

  generateMapMessage(): MapMessage {
    return {
      messageType: MessageType.Map,
      data: {
        width: this.map.width,
        height: this.map.height,
        kPoint: this.map.kPoint,
        goal: this.map.goal,
        checkpoints: this.map.checkpoints,
      },
    }
  }

  generateEndMessage(): GameEndMessage {
    return {
      messageType: MessageType.GameEnd,
      data: {
        winner: {},
      },
    }
  }

  generatePlayerPositionsMessage(): PlayerPositionsMessage {
    return {
      messageType: MessageType.PlayerPositions,
      data: this.bots.map(bot => bot.getCurrentPosition()),
    }
  }

  start(shutdownCallback: Function): void {
    this.shutdownCallback = shutdownCallback
    this.tickInterval = setInterval(() => {
      this.tick()
      Log.info(`tick ${this.currentGameTick} - waiting for ${TICK_INTERVAL}ms`)
    }, TICK_INTERVAL)
    Log.success(
      `Pummiralli starting in ${GAME_START_DELAY}ms - waiting for bots..`,
    )

    Log.debug(`this.bots - start(): ${this.bots}`)
    setTimeout(() => this.dispatchMap(), MAP_DELAY)
    setTimeout(() => this.dispatchGameStart(), GAME_START_DELAY)
  }

  dispatchMap(): void {
    if (this.bots.length === 0) {
      console.log("no bots connected - won't send the map!")
      clearInterval(this.tickInterval)
      return
    }
    console.log('generating map message')
    const mapMessage = this.generateMapMessage()
    console.log(`sending map message to ${this.bots.length} bots`)
    this.bots.map(bot => bot.sendMessage(mapMessage))
    this.eventHistory.push(
      this.asHistoryEvent(this.currentGameTick, mapMessage),
    )
  }

  dispatchGameStart(): void {
    if (this.bots.length === 0) {
      console.log("no bots connected - won't start the game!")
      clearInterval(this.tickInterval)
      return
    }
    console.log('generating start message')
    const gameStartMessage = this.generateStartMessage()
    console.log(`sending start message to ${this.bots.length} bots`)
    this.bots.map(bot => bot.sendMessage(gameStartMessage))
    this.ralliStatus = RalliStatus.Running
  }

  end(): void {
    clearInterval(this.tickInterval)
    const gameEndMessage = this.generateEndMessage()
    this.bots.map(bot => bot.sendMessage(gameEndMessage))
  }

  asHistoryEvent = (tick: number, message: Message): HistoryEvent => ({
    tick,
    message,
  })

  processEventsReceivedDuringTick(): void {
    this.eventsReceived.forEach(event => {
      this.process(event)
      this.eventHistory.push(this.asHistoryEvent(event.tick, event.message))
    })
    if (this.eventsReceived.length > 0) {
      console.log(`${this.eventHistory.length} events in history`)
    }
    this.eventsReceived.length = 0
  }

  endRace(): void {
    for (const bot of this.bots) {
      this.drop(bot.socket)
    }
    this.shutdownCallback(this.eventHistory)
  }

  process(event: ClientMessage): void {
    const message = event.message
    Log.info(
      `processing event received during tick (type: ${message.messageType})`,
    )

    const allBotsFinished = (): boolean =>
      this.bots.every(bot => bot.status === Status.Finished)

    switch (message.messageType) {
      case MessageType.Join: {
        const bot = new Bot(message.data.name, event.socket)
        if (this.bots.map(b => b.name).includes(message.data.name)) {
          bot.sendError(`The name '${message.data.name}' is already in use`)
        } else {
          this.join(bot)
          // for now just send the same join message back
          bot.sendMessage(message)
        }
        break
      }
      case MessageType.Move: {
        if (this.ralliStatus !== RalliStatus.Running) {
          break
        }
        const bot = this.bots.find(b => b.socket === event.socket)
        if (!bot) {
          event.socket.write('could not find joined bot!')
          break
        }
        bot.handleMove(message.data.angle, this.map)
        break
      }
      case MessageType.Stamp: {
        if (this.ralliStatus !== RalliStatus.Running) {
          break
        }
        const bot = this.bots.find(b => b.socket === event.socket)
        if (!bot) {
          event.socket.write('could not find joined bot!')
          break
        }
        bot.handleStamp(this.map)
        break
      }
      case MessageType.Finish: {
        const bot = this.bots.find(b => b.socket === event.socket)
        if (!bot) {
          event.socket.write('could not find joined bot!')
          break
        }
        bot.handleFinish(this.map)
        this.ralliStatus !== RalliStatus.Stopped
        break
      }
    }
    if (allBotsFinished()) {
      this.endRace()
    }
  }

  tick(): void {
    this.processEventsReceivedDuringTick()
    this.currentGameTick++
    const playerPositionsMessage = this.generatePlayerPositionsMessage()
    this.bots.map(bot => bot.sendMessage(playerPositionsMessage))
    this.eventHistory.push(
      this.asHistoryEvent(this.currentGameTick, playerPositionsMessage),
    )
  }
}
