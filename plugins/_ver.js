// 📂 plugins/_ver.js — FelixCat-Bot 🐾
// ver / r → recupera en el grupo
// m → guarda y envía al privado, NO se muestra en el grupo, SIN PREFIJO

import fs from 'fs'
import path from 'path'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, command }) => {

const isM = m.text?.toLowerCase() === 'm'

// SI NO ES ver/r NI m → ignorar
if (!['ver', 'r'].includes(command) && !isM) return

// VALIDAR OWNER (solo owners pueden usar ver/r y m)
const owners = global.owner.map(o => o[0].replace(/[^0-9]/g, ''))
const senderNumber = m.sender.replace(/[^0-9]/g, '')
if (!owners.includes(senderNumber)) return  // ❗ Silencio total si NO es owner

try {
const q = m.quoted
if (!q) return m.reply('⚠️ Respondé a una imagen, video o sticker.')

const mime = q.mimetype || q.mediaType || ''  
if (!/webp|image|video/g.test(mime))  
  return m.reply('⚠️ El mensaje citado no contiene multimedia.')  

if (!isM) await m.react('📥')  

let buffer = await q.download()  
let type = null  
let filenameSent = null  
let sentMessage = null  

// ============================  
// STICKER WEBP → PNG  
// ============================  
if (/webp/.test(mime)) {  
  let result = await webp2png(buffer)  

  if (result?.url) {  
    type = 'image'  
    buffer = Buffer.from(await (await fetch(result.url)).arrayBuffer())  
    filenameSent = 'sticker.png'  

    if (!isM) {  
      sentMessage = await conn.sendMessage(  
        m.chat,  
        { image: { url: result.url }, caption: '🖼️ Sticker convertido.' },  
        { quoted: null }  
      )  
    }  
  }  
}  

// ============================  
// FOTO o VIDEO normal  
// ============================  
else {  
  const ext = mime.split('/')[1]  
  type = mime.startsWith('video') ? 'video' : 'image'  
  filenameSent = 'recuperado.' + ext  

  if (!isM) {  
    sentMessage = await conn.sendMessage(  
      m.chat,  
      { [type]: buffer, fileName: filenameSent, caption: '📸 Archivo recuperado.' },  
      { quoted: null }  
    )  
  }  
}  

// ============================  
// REACCIÓN SOLO ver / r  
// ============================  
if (!isM && sentMessage) {  
  await conn.sendMessage(m.chat, {  
    react: { text: '✅', key: sentMessage.key }  
  })  
}  

// ============================  
// GUARDAR MEDIA  
// ============================  
const mediaFolder = './media'  
if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder)  

global.db.data.mediaList = global.db.data.mediaList || []  

const filename = `${Date.now()}_${Math.floor(Math.random() * 9999)}`  
const extFile = filenameSent.split('.').pop()  
const finalName = `${filename}.${extFile}`  
const filepath = path.join(mediaFolder, finalName)  

fs.writeFileSync(filepath, buffer)  

let chatInfo = null  
if (m.isGroup) {  
  try { chatInfo = await conn.groupMetadata(m.chat) } catch {}  
}  

global.db.data.mediaList.push({  
  id: global.db.data.mediaList.length + 1,  
  filename: finalName,  
  path: filepath,  
  type,  
  from: m.sender,  
  groupId: m.isGroup ? m.chat : null,  
  groupName: m.isGroup ? (chatInfo?.subject || '') : null,  
  date: new Date().toLocaleString(),  
  savedByVer: true  
})  

// ============================  
// 📤 MODO M → SOLO PRIVADO  
// ============================  
if (isM) {  
  await conn.sendMessage(  
    m.sender,  
    { [type]: buffer, fileName: filenameSent, caption: '🌟 Archivo recuperado.' },  
    { quoted: null }  
  )  
}

} catch (e) {
console.error(e)
if (!isM) await m.react('✖️')
m.reply('⚠️ Error al recuperar el archivo.')
}
}

// comandos normales
handler.help = ['ver', 'r']
handler.tags = ['tools', 'owner']
handler.command = ['ver', 'r']

// 🔥 "m" SIN PREFIJO
handler.customPrefix = /^m$/i
// ❗ Necesario para activar customPrefix
handler.command = new RegExp()

export default handler
