// 📂 plugins/propietario-setpp.js
// Cambiar la foto de perfil del BOT citando una imagen — Solo Owners

import { downloadContentFromMessage } from "@whiskeysockets/baileys";

// 🧠 Función universal de owners (compatible con todos los formatos)
function getOwnersJid() {
  return (global.owner || [])
    .map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string') return null
      return v.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    })
    .filter(Boolean)
}

let handler = async (m, { conn }) => {
  try {
    const ownersJid = getOwnersJid()
    const sender = conn.decodeJid(m.sender)

    // 🔐 SOLO OWNERS
    if (!ownersJid.includes(sender)) {
      return m.reply("❌ Solo los *owners* pueden cambiar la foto del bot.")
    }

    // 📸 DEBE ser una imagen citada
    if (!m.quoted) {
      return m.reply("📸 *Debes responder a una imagen* con:\n\n.setpp")
    }

    const q = m.quoted
    const mime = (q.msg || q).mimetype || ""

    if (!mime.startsWith("image/")) {
      return m.reply("📸 *Debes citar una imagen válida*.")
    }

    // 📥 Descargar imagen citada
    const stream = await downloadContentFromMessage(q.msg || q, "image")
    let buffer = Buffer.from([])

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    // 🖼️ Establecer foto de perfil del bot
    await conn.updateProfilePicture(conn.user.jid, buffer)

    await m.reply("✅ *Foto de perfil del bot actualizada correctamente!*")

  } catch (e) {
    console.error('Error en propietario-setpp:', e)
    m.reply("⚠️ Error al intentar cambiar la foto del bot.")
  }
}

// Datos del comando
handler.help = ["setpp"]
handler.tags = ["owner"]
handler.command = ['setpp', 'cambiarpp', 'botpp']
handler.owner = true

export default handler
