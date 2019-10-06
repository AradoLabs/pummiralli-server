import Pummiralli from './pummiralli'
import { Socket } from 'net'
jest.mock('net')
jest.mock('../util/log') // No unnecessary logging for tests

describe('Pummiralli', () => {
  const createMockSocket = (): Socket => {
    const socket = new Socket()
    socket.address = jest
      .fn()
      .mockImplementation(() => ({ address: 'address', port: 'port' }))
    return socket
  }
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('collects message correctly', () => {
    const ralli = new Pummiralli()
    const mockSocket = createMockSocket()
    ralli.collectMessage(mockSocket, {
      messageType: 'join',
      data: {
        name: 'test',
      },
    })
    expect(ralli.eventsReceived.length).toBe(1)
  })

  it('requires an unique name', () => {
    const ralli = new Pummiralli()
    const mockSocket1 = createMockSocket()
    const mockSocket2 = createMockSocket()
    ralli.collectMessage(mockSocket1, {
      messageType: 'join',
      data: {
        name: 'test',
      },
    })
    ralli.collectMessage(mockSocket2, {
      messageType: 'join',
      data: {
        name: 'test',
      },
    })
    ralli.processEventsReceivedDuringTick()
    expect(mockSocket2.write).toHaveBeenCalledWith(
      "The name 'test' is already in use",
    )
    expect(ralli.bots.length).toBe(1)
  })
})
