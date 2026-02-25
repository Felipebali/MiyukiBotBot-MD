// 🔪 Kick con sistema universal de owners

// 🧠 Sistema universal de owners (anti errores)
function getOwnersJid() {
  return (global.owner || [])
    .map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string') return null
      return v.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    })
    .filter(Boolean)
}

const handler = async (m, { conn, isAdmin }) => {

  if (!m.isGroup) return

  const ownersJid = getOwnersJid()
  const sender = conn.decodeJid(m.sender)

  // ---------- INFO GRUPO ----------
  let groupInfo
  try {
    groupInfo = await conn.groupMetadata(m.chat)
  } catch {
    return conn.reply(m.chat, '❌ No se pudo obtener información del grupo.', m)
  }

  const ownerGroup = conn.decodeJid(groupInfo.owner || '')
  const botJid = conn.decodeJid(conn.user.id)

  const protectedList = [...ownersJid, ownerGroup, botJid].filter(Boolean)

  // ---------- PERMISOS ----------
  if (!isAdmin && !ownersJid.includes(sender) && sender !== ownerGroup) {
    return conn.reply(
      m.chat,
      '❌ Solo admins, dueño del grupo o dueños del bot pueden usar este comando.',
      m
    )
  }

  // ---------- DETECTAR USUARIO ----------
  let user = m.mentionedJid?.[0] || m.quoted?.sender
  if (!user) {
    return conn.reply(
      m.chat,
      '📌 Debes mencionar o citar un mensaje para expulsar.',
      m
    )
  }

  user = conn.decodeJid(user)

  // ---------- PROTEGIDOS ----------
  if (protectedList.includes(user)) {
    return conn.reply(
      m.chat,
      '😎 No puedes eliminar a un usuario protegido.',
      m
    )
  }

  // ---------- EXPULSAR ----------
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

    try { await m.react('🔪') } catch {}

  } catch (err) {
    console.log('Error expulsando:', err)
    return conn.reply(
      m.chat,
      '❌ No se pudo expulsar al usuario. Verifica que el bot sea admin.',
      m
    )
  }
}

handler.help = ['k @usuario']
handler.tags = ['group']
handler.command = ['k', 'kick', 'echar', 'sacar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
