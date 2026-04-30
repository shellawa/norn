import net from "node:net"

const writeVarInt = (value: number): Buffer => {
  const bytes: number[] = []
  let val = value | 0

  while (true) {
    if ((val & ~0x7f) === 0) {
      bytes.push(val)
      break
    }

    bytes.push((val & 0x7f) | 0x80)
    val >>>= 7
  }

  return Buffer.from(bytes)
}

const readVarInt = (buf: Buffer, offset: number): { value: number; nextOffset: number } => {
  let numRead = 0
  let result = 0
  let read: number

  do {
    if (offset + numRead >= buf.length) {
      throw new Error("Incomplete VarInt")
    }

    read = buf[offset + numRead]!
    result |= (read & 0x7f) << (7 * numRead)
    numRead++

    if (numRead > 5) throw new Error("VarInt too big")
  } while (read & 0x80)

  return {
    value: result,
    nextOffset: offset + numRead
  }
}

const writeString = (value: string): Buffer => {
  const body = Buffer.from(value, "utf8")
  return Buffer.concat([writeVarInt(body.length), body])
}

const buildPacket = (packetId: number, payload: Buffer): Buffer => {
  const body = Buffer.concat([writeVarInt(packetId), payload])
  return Buffer.concat([writeVarInt(body.length), body])
}

export const queryMinecraftStatus = async (
  host: string,
  port: number,
  timeoutMs = 1500
): Promise<{ online: number; max: number }> => {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket()
    const chunks: Buffer[] = []
    let finished = false

    const done = (err?: Error, value?: { online: number; max: number }) => {
      if (finished) return
      finished = true
      socket.destroy()

      if (err) reject(err)
      else resolve(value ?? { online: 0, max: 0 })
    }

    socket.setTimeout(timeoutMs)
    socket.once("timeout", () => done(new Error("Timeout")))
    socket.once("error", done)

    socket.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk))

      try {
        const raw = Buffer.concat(chunks)

        const packetLen = readVarInt(raw, 0)
        if (raw.length < packetLen.nextOffset + packetLen.value) return

        const packet = raw.subarray(packetLen.nextOffset, packetLen.nextOffset + packetLen.value)

        const packetId = readVarInt(packet, 0)
        if (packetId.value !== 0x00) return

        const stringLen = readVarInt(packet, packetId.nextOffset)

        const json = packet.subarray(stringLen.nextOffset, stringLen.nextOffset + stringLen.value).toString("utf8")

        const status = JSON.parse(json) as {
          players?: { online?: number; max?: number }
        }

        done(undefined, {
          online: status.players?.online ?? 0,
          max: status.players?.max ?? 0
        })
      } catch {
        // wait for more packets
      }
    })

    socket.connect(port, host, () => {
      const handshakePayload = Buffer.concat([
        writeVarInt(-1), // protocol version
        writeString(host),
        Buffer.from([(port >> 8) & 0xff, port & 0xff]),
        writeVarInt(1)
      ])

      socket.write(buildPacket(0x00, handshakePayload))
      socket.write(buildPacket(0x00, Buffer.alloc(0)))

      const pingPayload = Buffer.alloc(8)
      pingPayload.writeBigInt64BE(BigInt(Date.now()))
      socket.write(buildPacket(0x01, pingPayload))
    })
  })
}
