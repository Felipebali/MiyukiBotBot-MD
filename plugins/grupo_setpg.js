// 📂 plugins/grupos-setpg.js
// Cambiar la foto del GRUPO citando una imagen — Solo Owners

import { downloadContentFromMessage } from "@whiskeysockets/baileys";

// 🧠 Sistema universal de owners (evita errores v.replace)
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
    if (!m.isGroup)
      return m.reply("❌ Este comando solo funciona en grupos.")

    const ownersJid = getOwnersJid()
    const sender = conn.decodeJid(m.sender)

    // 🔐 SOLO OWNERS
    if (!ownersJid.includes(sender))
      return m.reply("❌ Solo los *owners* pueden cambiar la foto del grupo.")

    // 📸 DEBE ser una imagen citada
    if (!m.quoted)
      return m.reply("📸 *Debes responder a una imagen* con:\n\n.setpg")

    const q = m.quoted
    const mime = (q.msg || q).mimetype || ""

    if (!mime.startsWith("image/"))
      return m.reply("📸 *Debes citar una imagen válida*.")

    // 📥 Descargar imagen citada
    const stream = await downloadContentFromMessage(q.msg || q, "image")
    let buffer = Buffer.from([])

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    // 🖼️ Establecer foto del grupo
    await conn.updateProfilePicture(m.chat, buffer)

    await m.reply("✅ *Foto del grupo actualizada correctamente!*")

  } catch (e) {
    console.error("Error en grupos-setpg:", e)
    m.reply("⚠️ Error al intentar cambiar la foto del grupo.")
  }
}

handler.help = ["setpg"]
handler.tags = ["owner"]
handler.command = ["setpg", "cambiarpg", "grouppic"]
handler.owner = true

export default handler
