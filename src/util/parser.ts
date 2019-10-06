export const tryParseObject = (data: string | Buffer): Record<string, any> => {
  try {
    if (Buffer.isBuffer(data)) {
      return JSON.parse(data.toString())
    }
    const dataString = data.toString()
    const startIndex = dataString.indexOf('{')
    const endIndex = dataString.lastIndexOf('}') + 2
    const messageString = dataString.substr(startIndex, endIndex - startIndex)
    return JSON.parse(messageString)
  } catch (e) {
    console.log('Error parsing data!')
    console.log('data: ')
    console.log(data)
    console.log('error:')
    console.log(e)
    return {}
  }
}
