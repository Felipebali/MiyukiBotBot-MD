// 📂 plugins/_ver.js — FelixCat-Bot 🐾

import fs from 'fs'
import path from 'path'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, command }) => {

const isM = m.text?.toLowerCase() === 'm'

if (!['ver', 'r'].includes(command) && !isM) return

// owners
const owners = global.owner.map(o => o[0].replace(/[^0-9]/g, ''))
const senderNumber = m.sender.replace(/[^0-9]/g, '')
if (!owners.includes(senderNumber)) return

try {

const q = m.quoted
if (!q) return m.reply('⚠️ Respondé a una imagen, video o sticker.')

const mime = q.mimetype || ''
const isSticker = /webp/.test(mime)
const isImage = /image/.test(mime)
const isVideo = /video/.test(mime)

if (!isSticker && !isImage && !isVideo)
return m.reply('⚠️ El mensaje citado no contiene multimedia.')

if (!isM) await m.react('📥')

// 🔥 descarga segura (sirve para videos)
let buffer = await downloadMediaMessage(
q,
'buffer',
{},
{ logger: console, reuploadRequest: conn.updateMediaMessage }
)

let type
let filenameSent

// ======================
// STICKER
// ======================

if (isSticker) {

let result = await webp2png(buffer)

buffer = Buffer.from(await (await fetch(result.url)).arrayBuffer())

type = 'image'
filenameSent = 'sticker.png'

if (!isM) {
await conn.sendMessage(
m.chat,
{ image: buffer, caption: '🖼️ Sticker convertido.' },
{ quoted: null }
)
}

}

// ======================
// IMAGEN
// ======================

if (isImage) {

type = 'image'
filenameSent = 'imagen_recuperada.jpg'

if (!isM) {
await conn.sendMessage(
m.chat,
{ image: buffer, caption: '📸 Imagen recuperada.' },
{ quoted: null }
)
}

}

// ======================
// VIDEO
// ======================

if (isVideo) {

type = 'video'
filenameSent = 'video_recuperado.mp4'

if (!isM) {
await conn.sendMessage(
m.chat,
{ video: buffer, caption: '🎥 Video recuperado.' },
{ quoted: null }
)
}

}

// ======================
// GUARDAR MEDIA
// ======================

const mediaFolder = './media'
if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder)

const filename = `${Date.now()}_${Math.floor(Math.random()*9999)}.${filenameSent.split('.').pop()}`
const filepath = path.join(mediaFolder, filename)

fs.writeFileSync(filepath, buffer)

// ======================
// MODO M → PRIVADO
// ======================

if (isM) {

await conn.sendMessage(
m.sender,
{ [type]: buffer, caption: '🌟 Archivo recuperado.' },
{ quoted: null }
)

}

} catch (e) {

console.error(e)

if (!isM) await m.react('✖️')

m.reply('⚠️ Error al recuperar el archivo.')

}

}

handler.help = ['ver','r']
handler.tags = ['tools']
handler.command = ['ver','r']

handler.customPrefix = /^m$/i
handler.command = new RegExp()

export default handler
