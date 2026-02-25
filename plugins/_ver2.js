// 📂 plugins/_ver.js — FelixCat-Bot 🐾
// ver / r → recupera en grupo + copia al owner
// rr → privado del owner
// mlist → lista
// re → recuperar por ID (AL PRIVADO DEL OWNER)
// mclear → limpiar historial

import fs from 'fs'
import path from 'path'
import { webp2png } from '../lib/webp2mp4.js'

const OWNER_JID = '59898719147@s.whatsapp.net'

// 👤 Usuario con permiso SOLO para r / ver
const RECOVER_ONLY = '59894305091'

let handler = async (m, { conn, command, text }) => {

  // ================= VALIDAR PERMISOS =================
  const owners = global.owner.map(o => o[0].replace(/[^0-9]/g, ''))
  const senderNumber = m.sender.replace(/[^0-9]/g, '')

  // ❌ No autorizado
  if (!owners.includes(senderNumber) && senderNumber !== RECOVER_ONLY) {
    await m.react('✖️')
    return conn.reply(m.chat, '❌ No tenés permiso para usar este comando.', m)
  }

  // 👤 Recover-only: SOLO r / ver
  if (
    senderNumber === RECOVER_ONLY &&
    !['r', 'ver'].includes(command)
  ) {
    await m.react('✖️')
    return conn.reply(
      m.chat,
      '⚠️ Solo podés usar el comando *r* para recuperar imágenes.',
      m
    )
  }

  // ================= BASE DE DATOS =================
  global.db.data.recoveredMedia = global.db.data.recoveredMedia || []

  // =================================================
  // 📜 LISTAR MULTIMEDIA
  // =================================================
  if (command === 'mlist') {
    if (!global.db.data.recoveredMedia.length)
      return conn.reply(m.chat, '📂 No hay multimedia recuperada.', m)

    if (text) {
      const id = parseInt(text)
      if (!id) return conn.reply(m.chat, '⚠️ Usa: `.mlist <id>`', m)

      const d = global.db.data.recoveredMedia.find(x => x.id === id)
      if (!d) return conn.reply(m.chat, '❌ ID no encontrado.', m)

      return conn.reply(
        m.chat,
`📄 *DETALLE DE MULTIMEDIA*
━━━━━━━━━━━━━━━━━━━━
🆔 ID: ${d.id}
🎞️ Tipo: ${d.type}
🏷️ Grupo: ${d.groupName || 'Privado'}
📅 Fecha: ${d.date}
📁 Archivo: ${d.filename}
━━━━━━━━━━━━━━━━━━━━`,
        m
      )
    }

    let txt =
`📂 *MULTIMEDIA RECUPERADA (${global.db.data.recoveredMedia.length})*
━━━━━━━━━━━━━━━━━━━━\n`

    global.db.data.recoveredMedia.slice(-15).forEach(d => {
      const icon = d.type === 'video' ? '🎞️' : '🖼️'
      const fecha = d.date.split(',')[0]
      txt += `🆔 ${d.id} | ${icon} ${d.type} | ${fecha}\n`
    })

    return conn.reply(m.chat, txt, m)
  }

  // =================================================
  // 📤 RE — RECUPERAR POR ID (PRIVADO DEL OWNER)
  // =================================================
  if (command === 're') {
    if (!text) return conn.reply(m.chat, '⚠️ Usa: `.re <id>`', m)

    const id = parseInt(text)
    if (!id) return conn.reply(m.chat, '⚠️ ID inválido.', m)

    const d = global.db.data.recoveredMedia.find(x => x.id === id)
    if (!d) return conn.reply(m.chat, '❌ ID no encontrado.', m)

    if (!fs.existsSync(d.path))
      return conn.reply(m.chat, '⚠️ El archivo ya no existe.', m)

    const buffer = fs.readFileSync(d.path)

    // 👉 SIEMPRE AL PRIVADO DEL OWNER
    await conn.sendMessage(
      OWNER_JID,
      {
        image: buffer,
        caption:
`📤 MULTIMEDIA RECUPERADA
🆔 ID: ${d.id}
👤 Solicitado por: ${senderNumber}
📅 ${d.date}`
      }
    )

    await m.react('✅')
    return
  }

  // =================================================
  // 🧹 MCLEAR — LIMPIAR HISTORIAL
  // =================================================
  if (command === 'miclear') {
    if (!owners.includes(senderNumber)) {
      await m.react('✖️')
      return conn.reply(m.chat, '❌ Solo los owners pueden limpiar el historial.', m)
    }

    // Vaciar historial en memoria
    global.db.data.recoveredMedia = []

    // Eliminar archivos de ./media
    const mediaFolder = './media'
    if (fs.existsSync(mediaFolder)) {
      const files = fs.readdirSync(mediaFolder)
      for (const file of files) {
        try {
          fs.unlinkSync(path.join(mediaFolder, file))
        } catch (err) {
          console.error('Error al borrar archivo:', file, err)
        }
      }
    }

    // Guardar DB
    if (global.db.write) await global.db.write()

    await m.react('✅')
    return conn.reply(m.chat, '🗑️ Historial de multimedia limpiado correctamente.', m)
  }

  // =================================================
  // 📥 RECUPERACIÓN NORMAL
  // =================================================
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    // 🔒 Recover-only: SOLO imágenes
    if (senderNumber === RECOVER_ONLY && !/image|webp/.test(mime))
      return conn.reply(m.chat, '⚠️ Solo podés recuperar imágenes.', m)

    if (!/webp|image|video/.test(mime))
      return conn.reply(m.chat, '⚠️ Responde a una imagen o sticker.', m)

    await m.react('📥')

    let buffer = await q.download()

    // ---------- STICKER ----------
    if (/webp/.test(mime)) {
      const result = await webp2png(buffer)
      buffer = Buffer.from(await (await fetch(result.url)).arrayBuffer())
    }

    // ---------- ENVIAR AL GRUPO ----------
    await conn.sendMessage(
      m.chat,
      { image: buffer, caption: '📸 Imagen recuperada.' },
      { quoted: m }
    )

    // =================================================
    // 📂 GUARDAR EN HISTORIAL
    // =================================================
    const mediaFolder = './media'
    if (!fs.existsSync(mediaFolder)) fs.mkdirSync(mediaFolder)

    const finalName = `${Date.now()}_${Math.floor(Math.random() * 9999)}.png`
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
      type: 'image',
      from: m.sender,
      groupName: m.isGroup ? (chatInfo?.subject || '') : null,
      date: new Date().toLocaleString()
    }

    global.db.data.recoveredMedia.push(record)
    if (global.db.write) await global.db.write()

    // =================================================
    // 📤 COPIA AL OWNER (SIEMPRE)
    // =================================================
    await conn.sendMessage(
      OWNER_JID,
      {
        image: buffer,
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
handler.command = ['ver', 'r', 'rr', 'mlist', 're', 'miclear']

export default handler
