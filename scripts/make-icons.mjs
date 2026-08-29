// Generates the PWA icons without pulling in an image library.
// Draws a Swedish flag on a rounded square and encodes it as PNG by hand.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

const BLUE = [0, 82, 147, 255]
const GOLD = [254, 204, 2, 255]
const CLEAR = [0, 0, 0, 0]

/** CRC32, as required by the PNG chunk format. */
const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // truecolour with alpha
  ihdr[10] = 0 // deflate
  ihdr[11] = 0 // adaptive filtering
  ihdr[12] = 0 // no interlace

  // Each scanline is prefixed with its filter type; 0 means "none".
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/**
 * `inset` leaves transparent margin so the same artwork also works as a
 * maskable icon, where launchers crop to a circle.
 */
function drawIcon(size, inset = 0) {
  const buf = Buffer.alloc(size * size * 4)
  const pad = Math.round(size * inset)
  const box = size - pad * 2
  const radius = box * 0.22

  // Flag geometry, following the real proportions closely enough to read.
  const barW = box * 0.17
  const crossX = pad + box * 0.36
  const crossY = pad + box * 0.5

  const put = (x, y, [r, g, b, a]) => {
    const i = (y * size + x) * 4
    buf[i] = r
    buf[i + 1] = g
    buf[i + 2] = b
    buf[i + 3] = a
  }

  const insideRounded = (x, y) => {
    const lx = x - pad
    const ly = y - pad
    if (lx < 0 || ly < 0 || lx >= box || ly >= box) return false
    // Only the four corner quadrants need the radius test.
    const cx = lx < radius ? radius : lx > box - radius ? box - radius : lx
    const cy = ly < radius ? radius : ly > box - radius ? box - radius : ly
    const dx = lx - cx
    const dy = ly - cy
    return dx * dx + dy * dy <= radius * radius
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!insideRounded(x, y)) {
        put(x, y, CLEAR)
        continue
      }
      const onVertical = Math.abs(x - crossX) <= barW / 2
      const onHorizontal = Math.abs(y - crossY) <= barW / 2
      put(x, y, onVertical || onHorizontal ? GOLD : BLUE)
    }
  }

  return encodePng(size, size, buf)
}

mkdirSync(OUT, { recursive: true })

writeFileSync(join(OUT, 'icon-192.png'), drawIcon(192, 0.02))
writeFileSync(join(OUT, 'icon-512.png'), drawIcon(512, 0.02))

// A vector favicon for desktop browsers, matching the PNG artwork.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#005293"/>
  <rect x="29" y="0" width="17" height="100" fill="#FECC02"/>
  <rect x="0" y="41.5" width="100" height="17" fill="#FECC02"/>
</svg>
`
writeFileSync(join(OUT, 'icon.svg'), svg)

console.log('Wrote icon-192.png, icon-512.png and icon.svg to public/')
