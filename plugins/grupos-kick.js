const handler = async (m, { conn, isAdmin }) => {
  const emoji = '🔪'

  // Normalizar números
  const normalize = jid => String(jid || '').replace(/\D/g, '')

  const sender = normalize(conn.decodeJid(m.sender))

  const ownersBot = ['59898719147', '59896026646', '59892363485']

  // INFO GRUPO
  let groupInfo
  try {
    groupInfo = await conn.groupMetadata(m.chat)
  } catch {
    return conn.reply(m.chat, '❌ No se pudo obtener información del grupo.', m)
  }

  const ownerGroup = groupInfo.owner
    ? normalize(conn.decodeJid(groupInfo.owner))
    : null

  const botJid = normalize(conn.decodeJid(conn.user?.id || conn.user?.jid))

  const protectedList = [...ownersBot, botJid, ownerGroup].filter(Boolean)

  // PERMISOS
  if (!isAdmin && !ownersBot.includes(sender) && sender !== ownerGroup) {
    return conn.reply(
      m.chat,
      '❌ Solo admins, dueño del grupo o dueños del bot pueden usar este comando.',
      m
    )
  }

  // DETECTAR USUARIO (MENCIÓN O RESPUESTA)
  let user =
    m.mentionedJid?.[0] ||
    m.quoted?.sender ||
    (m.quoted ? m.quoted.participant : null)

  if (!user) {
    return conn.reply(
      m.chat,
      '📌 Debes mencionar o citar un mensaje para expulsar.',
      m
    )
  }

  user = conn.decodeJid(user)
  const userNorm = normalize(user)

  // INTENTO DE EXPULSAR AL OWNER DEL GRUPO
  if (userNorm === ownerGroup && sender !== ownerGroup && !ownersBot.includes(sender)) {
    return conn.sendMessage(m.chat, {
      text: `😏 Tranquilo campeón... @${user.split('@')[0]} es el dueño del grupo.`,
      mentions: [user]
    })
  }

  // USUARIO PROTEGIDO
  if (protectedList.includes(userNorm)) {
    return conn.reply(m.chat, '😎 Es imposible eliminar a alguien protegido.', m)
  }

  // EXPULSAR
  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

    try { await m.react(emoji) } catch {}

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
handler.tags = ['grupo']
handler.command = ['k', 'kick', 'echar', 'hechar', 'sacar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
