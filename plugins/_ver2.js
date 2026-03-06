// 📂 plugins/_ver.js — FelixCat-Bot 🐾
// ver / r → recupera multimedia en el grupo + copia al owner

import fs from 'fs'
import path from 'path'
import { webp2png } from '../lib/webp2mp4.js'

const OWNER_JID = '59898719147@s.whatsapp.net'

// 👤 Usuario con permiso SOLO para r / ver
const RECOVER_ONLY = '59894305091'

let handler = async (m, { conn, command }) => {

  // ================= VALIDAR PERMISOS =================
  const owners = global.owner.map(o => o[0].replace(/[^0-9]/g, ''))
  const senderNumber = m.sender.replace(/[^0-9]/g, '')

  if (!owners.includes(senderNumber) && senderNumber !== RECOVER_ONLY) {
    await m.react('✖️')
    return conn.reply(m.chat, '❌ No tenés permiso para usar este comando.', m)
  }

  global.db.data.recoveredMedia = global.db.data.recoveredMedia || []

  try {

    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/webp|image|video/.test(mime))
      return conn.reply(m.chat, '⚠️ Responde a una imagen, video o sticker.', m)

    await m.react('📥')

    let buffer = await q.download()

    let type = 'image'
    let ext = 'jpg'

    // ---------- STICKER ----------
    if (/webp/.test(mime)) {
      const result = await webp2png(buffer)
      buffer = Buffer.from(await (await fetch(result.url)).arrayBuffer())
      type = 'image'
      ext = 'png'
    }

    // ---------- VIDEO ----------
    if (/video/.test(mime)) {
      type = 'video'
      ext = 'mp4'
    }

    // ---------- IMAGEN ----------
    if (/image/.test(mime)) {
      type = 'image'
      ext = 'jpg'
    }

    // ---------- ENVIAR AL GRUPO ----------
    await conn.sendMessage(
      m.chat,
      { [type]: buffer, caption: '📦 Archivo recuperado.' },
      { quoted: m }
    )

    // ================= GUARDAR =================
    const mediaFolder = './media'
    if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder)

    const finalName = `${Date.now()}_${Math.floor(Math.random() * 9999)}.${ext}`
    const filepath = path.join(mediaFolder, finalName)

    fs.writeFileSync(filepath, buffer)

    let chatInfo = null
    if (m.isGroup) {
      try { chatInfo = await conn.groupMetadata(m.chat) } catch {}
    }

    const record = {
      id: global.db.data.recoveredMedia.length + 1,
      filename: finalName,
      path: filepath,
      type,
      from: m.sender,
      groupName: m.isGroup ? (chatInfo?.subject || '') : null,
      date: new Date().toLocaleString()
    }

    global.db.data.recoveredMedia.push(record)
    if (global.db.write) await global.db.write()

    // ================= COPIA AL OWNER =================
    await conn.sendMessage(
      OWNER_JID,
      {
        [type]: buffer,
        caption:
`📥 MEDIA RECUPERADA
🆔 ID: ${record.id}
👤 ${senderNumber}
🏷️ ${record.groupName || 'Privado'}
📅 ${record.date}`
      }
    )

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    conn.reply(m.chat, '⚠️ Error al recuperar el archivo.', m)
  }
}

handler.help = ['ver', 'r']
handler.tags = ['tools']
handler.command = ['ver', 'r']

export default handler
