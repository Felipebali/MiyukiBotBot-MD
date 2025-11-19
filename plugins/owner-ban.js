// 📂 plugins/propietario-listanegra.js

function normalizeJid(jid = '') {
  if (!jid) return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net')
}

async function getDisplayName(conn, jid) {
  try {
    const name = await conn.getName(jid)
    return name || jid.split("@")[0]
  } catch {
    return jid.split("@")[0]
  }
}

const handler = async (m, { conn, command, text }) => {
  const emoji = '🚫'
  const done = '✅'
  const db = global.db.data.users || (global.db.data.users = {})

  const reactions = { addn: '✅', remn: '☢️', clrn: '🧹', listn: '📜', seen: '👀' }
  if (reactions[command]) await conn.sendMessage(m.chat, { react: { text: reactions[command], key: m.key } })

  // --- DETECTAR USUARIO ---
  let userJid = null

  if (m.quoted) userJid = normalizeJid(m.quoted.sender)
  else if (m.mentionedJid?.length) userJid = normalizeJid(m.mentionedJid[0])
  else if (text) {
    const match = text.match(/(\d{5,})/)
    if (match) userJid = `${match[1]}@s.whatsapp.net`
    else if (text.includes('@')) {
      const mention = text.replace(/[^0-9]/g, '')
      if (mention.length > 5) userJid = `${mention}@s.whatsapp.net`
    }
  }

  // --- MOTIVO ---
  let reason = text
    ? text.replace(/@/g, '').replace(/\d{5,}/g, '').trim()
    : 'No especificado'
  if (!reason) reason = 'No especificado'

  // --- VALIDAR USUARIO ---
  if (!userJid && !['listn', 'clrn', 'seen'].includes(command))
    return conn.reply(m.chat, `${emoji} Debes responder, mencionar o escribir el número del usuario.`, m)

  if (userJid && !db[userJid]) db[userJid] = {}

  const displayName = userJid ? await getDisplayName(conn, userJid) : null

  // --- AGREGAR A LISTA NEGRA ---
  if (command === 'addn') {
    db[userJid].banned = true
    db[userJid].banReason = reason
    db[userJid].bannedBy = m.sender

    await conn.sendMessage(m.chat, {
      text: `${done} @${displayName} fue agregado a la lista negra.\n📝 Motivo: ${reason}`,
      mentions: [userJid]
    })
  }

  // --- QUITAR DE LISTA NEGRA ---
  else if (command === 'remn') {
    if (!db[userJid]?.banned)
      return conn.sendMessage(m.chat, { text: `${emoji} @${displayName} no está en la lista negra.`, mentions: [userJid] })

    db[userJid].banned = false
    db[userJid].banReason = ''
    db[userJid].bannedBy = null

    await conn.sendMessage(m.chat, { text: `${done} @${displayName} fue eliminado de la lista negra.`, mentions: [userJid] })
  }

  // --- CONSULTAR USUARIO ---
  else if (command === 'seen') {
    if (!userJid || !db[userJid]?.banned)
      return conn.sendMessage(m.chat, { text: `✅ @${displayName || 'Usuario'} no está en la lista negra.`, mentions: userJid ? [userJid] : [] })

    await conn.sendMessage(m.chat, {
      text: `${emoji} @${displayName} está en la lista negra.\n📝 Motivo: ${db[userJid].banReason || 'No especificado'}`,
      mentions: [userJid]
    })
  }

  // --- VER LISTA COMPLETA ---
  else if (command === 'listn') {
    const bannedUsers = Object.entries(db).filter(([_, data]) => data?.banned)
    if (bannedUsers.length === 0)
      return conn.sendMessage(m.chat, { text: `${done} No hay usuarios en la lista negra.` })

    let list = '🚫 *Lista negra actual:*\n\n'
    const mentions = []

    for (const [jid, data] of bannedUsers) {
      const name = await getDisplayName(conn, jid)
      list += `• @${name}\n  Motivo: ${data.banReason || 'No especificado'}\n\n`
      mentions.push(jid)
    }

    await conn.sendMessage(m.chat, { text: list.trim(), mentions })
  }

  // --- VACIAR LISTA ---
  else if (command === 'clrn') {
    for (const jid in db) {
      if (db[jid]?.banned) {
        db[jid].banned = false
        db[jid].banReason = ''
        db[jid].bannedBy = null
      }
    }
    await conn.sendMessage(m.chat, { text: `${done} La lista negra ha sido vaciada.` })
  }

  if (global.db.write) await global.db.write()
}

handler.help = ['addn', 'remn', 'clrn', 'listn', 'seen']
handler.tags = ['owner']
handler.command = ['addn', 'remn', 'clrn', 'listn', 'seen']
handler.rowner = true

export default handler
