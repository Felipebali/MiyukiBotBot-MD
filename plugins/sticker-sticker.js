import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args }) => {
  // --- NORMALIZA NÚMEROS ---
  const owners = global.owner.map(o => o[0].replace(/[^0-9]/g, '')) // Solo números
  const senderNumber = m.sender.replace(/[^0-9]/g, '') // Número del que envía

  // --- SOLO OWNERS ---
  if (!owners.includes(senderNumber)) {
    await m.react('✖️') // Reacción de error
    return conn.reply(m.chat, '❌ Solo los *owners* pueden usar este comando.', m)
  }

  let stiker = false
  let userId = m.sender
  let packstickers = global.db.data.users[userId] || {}
  let texto1 = packstickers.text1 || global.packsticker
  let texto2 = packstickers.text2 || global.packsticker2

  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    let txt = args.join(' ')

    if (/webp|image|video/g.test(mime) && q.download) {
      if (/video/.test(mime) && (q.msg || q).seconds > 16)
        return conn.reply(m.chat, '❌ El video no puede durar más de *15 segundos*', m)

      let buffer = await q.download()
      await m.react('🧃')

      let marca = txt ? txt.split(/[\u2022|]/).map(part => part.trim()) : [texto1, texto2]
      stiker = await sticker(buffer, false, marca[0], marca[1])

    } else if (args[0] && isUrl(args[0])) {
      let buffer = await sticker(false, args[0], texto1, texto2)
      stiker = buffer

    } else {
      return conn.reply(m.chat, '❌ Responde a una *imagen/video/gif* o etiqueta uno para convertirlo en sticker.', m)
    }

  } catch (e) {
    await conn.reply(m.chat, '⚠️ Error: ' + e.message, m)
    await m.react('✖️')
  } finally {
    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
      await m.react('🧃')
    }
  }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker']
handler.owner = false // Ya lo controlamos arriba

export default handler

// --- DETECTOR DE URL ---
function isUrl(text) {
  return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png)/gi.test(text)
}
