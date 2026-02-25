// plugins/ruletabanF.js
// Activador: letra "F" o "f" (sin prefijo)
// Solo ROOT OWNERS pueden usarlo
// Expulsa un usuario aleatorio (no admin, bot ni owner)

function getOwnersJid() {
  return (global.owner || [])
    .map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string') return null
      return v.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    })
    .filter(Boolean)
}

let handler = async (m, { conn, groupMetadata }) => {
  try {
    if (!m.isGroup) return

    const text = (m.text || '').trim().toLowerCase()
    if (text !== 'f') return

    const ownersJid = getOwnersJid()
    const sender = conn.decodeJid(m.sender)

    // 🔐 Solo ROOT OWNERS
    if (!ownersJid.includes(sender)) return

    const participants = groupMetadata?.participants || []

    const elegibles = participants.filter(p => {
      const jid = conn.decodeJid(p.id)
      const isAdmin = p.admin === 'admin' || p.admin === 'superadmin'
      const isBot = jid === conn.user.jid
      const isGroupOwner = groupMetadata.owner && jid === groupMetadata.owner
      const isOwner = ownersJid.includes(jid)
      return !isAdmin && !isBot && !isGroupOwner && !isOwner
    }).map(p => p.id)

    if (!elegibles.length)
      return conn.sendMessage(m.chat, { text: '❌ No hay usuarios elegibles para expulsar.' })

    const elegido = elegibles[Math.floor(Math.random() * elegibles.length)]

    await conn.groupParticipantsUpdate(m.chat, [elegido], 'remove')

    await conn.sendMessage(m.chat, {
      text: `💀 El destino decidió... @${elegido.split('@')[0]} fue eliminado del grupo.`,
      mentions: [elegido]
    })

  } catch (err) {
    console.error('ruletabanF:', err)
    conn.sendMessage(m.chat, { text: '❌ Error al ejecutar la ruleta.' })
  }
}

handler.customPrefix = /^\s*f\s*$/i
handler.command = new RegExp()
handler.group = true

export default handler
