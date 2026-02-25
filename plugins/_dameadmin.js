// plugins/_admin-request.js
// 👑 Auto-admin por frase — SOLO OWNERS reales del bot

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return

    // 🔐 Verificación REAL de owners (a prueba de bugs)
    const owners = (global.owner || []).map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string' && typeof v !== 'number') return null
      return String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }).filter(Boolean)

    const sender = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    if (!owners.includes(sender)) return

    const text = (m.text || '').toLowerCase().trim()
    if (!/^(dame admin|quiero admin)$/.test(text)) return

    await conn.groupParticipantsUpdate(m.chat, [sender], 'promote')

    await conn.sendMessage(m.chat, {
      text: `Listo @${sender.split('@')[0]} 😌`,
      mentions: [sender]
    })

  } catch (err) {
    console.error('Error en _admin-request.js:', err)
  }
}

// Sin prefijo, solo frases exactas
handler.customPrefix = /^(dame admin|quiero admin)$/i
handler.command = new RegExp()
handler.group = true

export default handler
