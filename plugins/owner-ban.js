// 📂 plugins/propietario-listanegra.js

function normalizeJid(jid = '') {
  if (!jid) return null
  jid = jid.replace(/[^0-9]/g, '')
  if (!jid.endsWith('@s.whatsapp.net')) jid += '@s.whatsapp.net'
  return jid
}

async function getDisplayName(conn, jid) {
  if (!jid) return 'Desconocido'
  try {
    return await conn.getName(jid) || jid.split('@')[0]
  } catch {
    return jid.split('@')[0]
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
    if (match) userJid = normalizeJid(match[1])
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

  const displayName = userJid ? await getDisplayName(conn, userJid) : ''

  // --- AGREGAR A LISTA NEGRA ---
  if (command === 'addn') {
    db[userJid].banned = true
    db[userJid].banReason = reason
    db[userJid].bannedBy = m.sender

    await conn.sendMessage(m.chat, {
      text: `${done} @${displayName} fue agregado a la lista negra.\n📝 Motivo: ${reason}`,
      mentions: [userJid]
    })

    // Expulsión automática de grupos
    const groups = Object.keys(await conn.groupFetchAllParticipating()).slice(0, 15)
    for (const jid of groups) {
      await new Promise(r => setTimeout(r, 3000))
      try {
        const group = await conn.groupMetadata(jid)
        const member = group.participants.find(p => normalizeJid(p.id) === userJid)
        if (member) {
          await conn.groupParticipantsUpdate(jid, [member.id], 'remove')
          await new Promise(r => setTimeout(r, 1500))
          const name = await getDisplayName(conn, userJid)
          await conn.sendMessage(jid, {
            text: `🚫 @${name} fue eliminado automáticamente por estar en la lista negra.\n📝 Motivo: ${reason}`,
            mentions: [userJid]
          })
          console.log(`[AUTO-KICK] Expulsado ${userJid} de ${group.subject}`)
        }
      } catch (e) {
        console.log(`⚠️ No se pudo expulsar de ${jid}: ${e.message}`)
      }
    }
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
      return conn.sendMessage(m.chat, { text: `✅ @${displayName || 'Usuario'} no está en la lista negra.`, mentions: [userJid] })

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

// --- AUTO-KICK SI HABLA ---
handler.all = async function (m) {
  if (!m.isGroup || !m.sender) return
  const conn = this
  const db = global.db.data.users || {}
  const sender = normalizeJid(m.sender)
  if (db[sender]?.banned) {
    const reason = db[sender].banReason || 'No especificado'
    const displayName = await getDisplayName(conn, sender)
    try {
      await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
      await new Promise(r => setTimeout(r, 1000))
      await conn.sendMessage(m.chat, {
        text: `🚫 @${displayName} fue eliminado por estar en la lista negra.\n📝 Motivo: ${reason}`,
        mentions: [sender]
      })
      console.log(`[AUTO-KICK] Eliminado ${sender}`)
    } catch (e) {
      console.log(`⚠️ No se pudo eliminar a ${sender}: ${e.message}`)
    }
  }
}

// --- AUTO-KICK AL UNIRSE ---
handler.participantsUpdate = async function (event) {
  const conn = this
  const { id, participants, action } = event
  if (action !== 'add' && action !== 'invite') return
  const db = global.db.data.users || {}
  for (const user of participants) {
    const u = normalizeJid(user)
    if (db[u]?.banned) {
      const reason = db[u].banReason || 'No especificado'
      const displayName = await getDisplayName(conn, u)
      try {
        await conn.groupParticipantsUpdate(id, [u], 'remove')
        await new Promise(r => setTimeout(r, 1000))
        await conn.sendMessage(id, {
          text: `🚫 @${displayName} fue eliminado automáticamente por estar en la lista negra.\n📝 Motivo: ${reason}`,
          mentions: [u]
        })
        console.log(`[AUTO-KICK JOIN] ${u} eliminado`)
      } catch (e) {
        console.log(`⚠️ No se pudo eliminar a ${u} al unirse: ${e.message}`)
      }
    }
  }
}

handler.help = ['addn', 'remn', 'clrn', 'listn', 'seen']
handler.tags = ['owner']
handler.command = ['addn', 'remn', 'clrn', 'listn', 'seen']
handler.rowner = true

export default handler
