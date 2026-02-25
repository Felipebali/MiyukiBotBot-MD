// 🔪 Kick con sistema universal de owners

// 🧠 Sistema universal de owners (igual que aprobar.js)
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

  const normalize = v => String(v || '').replace(/\D/g, '')

  const ownersJid = getOwnersJid()
  const sender = conn.decodeJid(m.sender)

  // 📌 INFO GRUPO
  let metadata
  try {
    metadata = await conn.groupMetadata(m.chat)
  } catch {
    return conn.reply(m.chat, '❌ Error obteniendo datos del grupo.', m)
  }

  const ownerGroup = metadata.owner
    ? conn.decodeJid(metadata.owner)
    : null

  const botJid = conn.decodeJid(conn.user.id)

  const protectedList = [
    ...ownersJid,
    ownerGroup,
    botJid
  ].filter(Boolean)

  // 🔐 PERMISOS
  if (!isAdmin && !ownersJid.includes(sender) && sender !== ownerGroup) {
    return conn.reply(
      m.chat,
      '❌ Solo admins, dueño del grupo o owners del bot.',
      m
    )
  }

  // 🔍 DETECTAR USUARIO (MENCIÓN O RESPUESTA)
  let user =
    m.mentionedJid?.[0] ||
    m?.message?.extendedTextMessage?.contextInfo?.participant ||
    m.quoted?.sender

  if (!user) {
    return conn.reply(
      m.chat,
      '📌 Menciona o responde al usuario.',
      m
    )
  }

  user = conn.decodeJid(user)

  // 🛡️ PROTEGIDOS
  if (protectedList.includes(user)) {
    return conn.reply(
      m.chat,
      '😎 No puedes eliminar a un usuario protegido.',
      m
    )
  }

  // 🚀 EXPULSAR
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    try { await m.react('🔪') } catch {}
  } catch (err) {
    console.log(err)
    return conn.reply(
      m.chat,
      '❌ No pude expulsarlo. Verifica que el bot sea admin.',
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
