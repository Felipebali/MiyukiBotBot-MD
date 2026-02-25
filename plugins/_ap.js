// 📂 plugins/aprobar.js — Aprueba todas las solicitudes de una sola vez

// 🧠 Sistema universal de owners (anti v.replace error)
function getOwnersJid() {
  return (global.owner || [])
    .map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string') return null
      return v.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    })
    .filter(Boolean)
}

let handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return

  const ownersJid = getOwnersJid()
  const sender = conn.decodeJid(m.sender)

  // 🔐 Solo admins del grupo o ROOT OWNERS
  if (!isAdmin && !ownersJid.includes(sender)) return

  try {
    const pendingList = await conn.groupRequestParticipantsList(m.chat)

    if (!pendingList?.length) {
      return conn.sendMessage(m.chat, {
        text: '✅ No hay solicitudes pendientes de aprobación.'
      })
    }

    // 🔥 Obtener todos los JID
    const users = pendingList.map(u => u.jid)

    // ⚡ Aprobar todos juntos
    await conn.groupRequestParticipantsUpdate(m.chat, users, 'approve')

    await conn.sendMessage(m.chat, {
      text: `🎉 ${users.length} usuarios aprobados correctamente.`
    })

  } catch (err) {
    console.error('❌ Error al aprobar:', err)
    await conn.sendMessage(m.chat, {
      text: '⚠️ Error al aprobar solicitudes. Asegúrate de que el bot sea admin.'
    })
  }
}

handler.help = ['ap', 'aprobar']
handler.tags = ['group']
handler.command = ['ap', 'aprobar']
handler.group = true
handler.botAdmin = true

export default handler
