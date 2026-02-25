// AUTO-ADMIN SILENCIOSO
// Activador: "aa" → promote, "ad" → demote
// SOLO ROOT OWNERS reales

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return

    // 🔐 Verificación REAL de owners desde config.js
    const owners = (global.owner || []).map(v => String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net')

    const sender = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    if (!owners.includes(sender)) return

    const texto = (m.text || '').trim().toLowerCase()

    if (texto === 'aa') {
      await conn.groupParticipantsUpdate(
        m.chat,
        [sender],
        'promote'
      )
    }

    if (texto === 'ad') {
      await conn.groupParticipantsUpdate(
        m.chat,
        [sender],
        'demote'
      )
    }

  } catch (e) {
    console.error('AUTOADMIN ERROR:', e)
  }
}

// Detecta "aa" o "ad" sin prefijo
handler.customPrefix = /^\s*(aa|ad)\s*$/i
handler.command = new RegExp()
handler.group = true

export default handler
