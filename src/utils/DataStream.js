import stream from 'stream'

export default class DataStream extends stream.Writable {
  constructor() {
    super()
    this.chunks = []
  }

  _write(chunk, enc, next) {
    this.chunks.push(chunk.toString())
    next()
  }
}
