import { Buffer } from 'buffer'
import { Message } from '../domain/messages'

export const tryParseObject = (data: string | Buffer): Message => {
  try {
    if (Buffer.isBuffer(data)) {
      return JSON.parse(data.toString())
    }
    // TODO: How can this be done efficiently but robustly
    const dataString = data.toString()
    const startIndex = dataString.indexOf('{')
    const endIndex = dataString.lastIndexOf('}') + 2
    const messageString = dataString.substr(startIndex, endIndex - startIndex)
    return JSON.parse(messageString)
  } catch (e) {
    console.log('Error parsing data!')
    console.log('data: ')
    console.log(data)
    console.log('data.toString(): ')
    console.log(data.toString())
    console.log('error:')
    console.log(e)
    return { messageType: 'invalid' }
  }
}
