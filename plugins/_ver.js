// 📂 plugins/_ver.js — FelixCat-Bot 🐾
// Recupera fotos, videos o stickers en su formato original
// Solo los owners pueden usarlo 👑

import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn }) => {
  // --- NORMALIZA NÚMEROS ---
  const owners = global.owner.map(o => o[0].replace(/[^0-9]/g, '')) // Solo números
  const senderNumber = m.sender.replace(/[^0-9]/g, '') // Número del que envía

  // --- SOLO OWNERS ---
  if (!owners.includes(senderNumber)) {
    await m.react('✖️')
    return conn.reply(m.chat, '❌ Solo los *owners* pueden usar este comando.', m)
  }

  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/webp|image|video/g.test(mime))
      return conn.reply(m.chat, '⚠️ Responde a una *imagen, sticker o video* para verlo.', m)

    await m.react('📥')
    let buffer = await q.download()

    // 🖼️ Si es sticker, lo convierte a imagen PNG
    if (/webp/.test(mime)) {
      let result = await webp2png(buffer)
      if (result && result.url) {
        await conn.sendFile(m.chat, result.url, 'sticker.png', '🖼️ Sticker convertido a imagen.', m)
        await m.react('✅')
        return
      }
    }

    // 🎥 Si es imagen o video normal, lo reenvía tal cual
    await conn.sendFile(m.chat, buffer, 'recuperado.' + mime.split('/')[1], '📸 Archivo recuperado.', m)
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '⚠️ Error al recuperar el archivo.', m)
    await m.react('✖️')
  }
}

handler.help = ['ver']
handler.tags = ['tools', 'owner']
handler.command = ['ver', 'r']
handler.owner = false // controlado manualmente

export default handler
