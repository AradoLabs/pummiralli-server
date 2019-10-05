import Pummiralli from './pummiralli'
jest.mock('../util/log') // No unnecessary logging for tests

describe('Pummiralli', () => {
  const createMockSocket = (): Record<string, Function> => ({
    address: jest.fn().mockImplementation(() => '::ffff:127.0.0.1:8099'),
    write: jest.fn(),
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('collects message correctly', () => {
    const ralli = new Pummiralli()
    ralli.collectMessage(createMockSocket(), {
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
