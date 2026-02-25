/* plugins/_deletebotmsg.js
SILENT DELETE — SOLO OWNERS
H : elimina el mensaje citado (exactamente el citado)
*/

let handler = async (m, { conn }) => {

  // Debe citar un mensaje
  if (!m.quoted) return

  try {
    const quoted = m.quoted

    // Construir key exacto del mensaje citado
    const key = {
      remoteJid: m.chat,
      id: quoted.id,
      participant: quoted.participant || quoted.sender
    }

    // 🗑️ Borrar mensaje citado
    await conn.sendMessage(m.chat, { delete: key })

    // 🗑️ Borrar tu mensaje ("H")
    await conn.sendMessage(m.chat, { delete: m.key })

  } catch {}
}

// Detecta SOLO la letra H sin prefijo
handler.customPrefix = /^h$/i
handler.command = new RegExp()

// 🔒 Permiso exclusivo de dueño (toma los números desde config.js)
handler.rowner = true

export default handler
