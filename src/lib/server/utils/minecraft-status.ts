import net from "node:net"

const PROTOCOL_VERSION = 47

const writeVarInt = (value: number): Buffer => {
  const bytes: number[] = []
  let val = value >>> 0
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
    if (offset + numRead >= buf.length) throw new Error("Incomplete VarInt")
    read = buf[offset + numRead]!
    result |= (read & 0x7f) << (7 * numRead)
    numRead += 1
    if (numRead > 5) throw new Error("VarInt too big")
  } while ((read & 0x80) !== 0)

  return { value: result, nextOffset: offset + numRead }
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

    const done = (error?: Error, value?: { online: number; max: number }) => {
      if (finished) return
      finished = true
      socket.destroy()
      if (error) reject(error)
      else resolve(value ?? { online: 0, max: 0 })
    }

    socket.setTimeout(timeoutMs)
    socket.once("timeout", () => done(new Error("Status query timed out")))
    socket.once("error", (err) => done(err))
    socket.on("data", (chunk) => chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk))
    socket.once("end", () => {
      try {
        const raw = Buffer.concat(chunks)
        const withLen = readVarInt(raw, 0)
        const payloadEnd = withLen.nextOffset + withLen.value
        const packet = raw.subarray(withLen.nextOffset, payloadEnd)
        const withPacketId = readVarInt(packet, 0)
        const withStringLen = readVarInt(packet, withPacketId.nextOffset)
        const jsonStart = withStringLen.nextOffset
        const jsonEnd = jsonStart + withStringLen.value
        const jsonText = packet.subarray(jsonStart, jsonEnd).toString("utf8")
        const status = JSON.parse(jsonText) as { players?: { online?: number; max?: number } }
        done(undefined, { online: status.players?.online ?? 0, max: status.players?.max ?? 0 })
      } catch (error) {
        done(error instanceof Error ? error : new Error("Invalid status payload"))
      }
    })

    socket.connect(port, host, () => {
      const handshakePayload = Buffer.concat([
        writeVarInt(PROTOCOL_VERSION),
        writeString(host),
        Buffer.from([(port >> 8) & 0xff, port & 0xff]),
        writeVarInt(1)
      ])
      socket.write(buildPacket(0x00, handshakePayload))
      socket.write(buildPacket(0x00, Buffer.alloc(0)))
    })
  })
}
