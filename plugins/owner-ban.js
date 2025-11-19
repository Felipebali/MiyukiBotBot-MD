// 📂 plugins/propietario-listanegra.js

function normalizeJid(jid = '') {
  if (!jid) return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net')
}

const handler = async (m, { conn, command, text }) => {
  const emoji = '🚫'
  const done = '✅'
  const db = global.db.data.users || (global.db.data.users = {})

  const reactions = { addn: '✅', remn: '☢️', clrn: '🧹', listn: '📜', seen: '👀' }
  if (reactions[command]) await conn.sendMessage(m.chat, { react: { text: reactions[command], key: m.key } })

  // --- DETECTAR USUARIO ---
  let userJid = null

  if (m.quoted) {
    userJid = normalizeJid(m.quoted.sender)
  } else if (m.mentionedJid?.length) {
    userJid = normalizeJid(m.mentionedJid[0])
  } else if (text) {
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

  // Limpiar JID para menciones
  const mentionJid = userJid ? userJid.replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null

  // --- AGREGAR A LISTA NEGRA ---
  if (command === 'addn') {
    db[userJid].banned = true
    db[userJid].banReason = reason
    db[userJid].bannedBy = m.sender

    await conn.sendMessage(m.chat, {
      text: `${done} @${mentionJid.split('@')[0]} fue agregado a la lista negra.\n📝 Motivo: ${reason}`,
      mentions: mentionJid ? [mentionJid] : []
    })

    // Expulsión automática de grupos
    const groups = Object.keys(await conn.groupFetchAllParticipating()).slice(0, 15)
    for (const jid of groups) {
      await new Promise(r => setTimeout(r, 3000))
      try {
        const group = await conn.groupMetadata(jid)
        const member = group.participants.find(p => normalizeJid(p.id) === normalizeJid(userJid))
        if (member) {
          await conn.groupParticipantsUpdate(jid, [member.id], 'remove')
          await new Promise(r => setTimeout(r, 1500))
          await conn.sendMessage(jid, {
            text: `🚫 @${member.id.split('@')[0]} fue eliminado automáticamente por estar en la lista negra.\n📝 Motivo: ${reason}`,
            mentions: [member.id]
          })
          console.log(`[AUTO-KICK] Expulsado ${member.id} de ${group.subject}`)
        }
      } catch (e) {
        if (e.data === 429 || e.message.includes('rate-overlimit')) {
          console.log(`⚠️ Rate limit en ${jid}, pausando 10s...`)
          await new Promise(r => setTimeout(r, 10000))
          continue
        }
        console.log(`⚠️ No se pudo expulsar de ${jid}: ${e.message}`)
      }
    }
  }

  // --- QUITAR DE LISTA NEGRA ---
  else if (command === 'remn') {
    if (!db[userJid]?.banned)
      return conn.sendMessage(m.chat, { text: `${emoji} @${mentionJid.split('@')[0]} no está en la lista negra.`, mentions: [mentionJid] })

    db[userJid].banned = false
    db[userJid].banReason = ''
    db[userJid].bannedBy = null

    await conn.sendMessage(m.chat, { text: `${done} @${mentionJid.split('@')[0]} fue eliminado de la lista negra.`, mentions: [mentionJid] })
  }

  // --- CONSULTAR USUARIO ---
  else if (command === 'seen') {
    if (!userJid || !db[userJid]?.banned)
      return conn.sendMessage(m.chat, { text: `✅ @${mentionJid?.split('@')[0] || 'Usuario'} no está en la lista negra.`, mentions: mentionJid ? [mentionJid] : [] })

    await conn.sendMessage(m.chat, {
      text: `${emoji} @${mentionJid.split('@')[0]} está en la lista negra.\n📝 Motivo: ${db[userJid].banReason || 'No especificado'}`,
      mentions: [mentionJid]
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
      const cleanJid = jid.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
      list += `• @${cleanJid.split('@')[0]}\n  Motivo: ${data.banReason || 'No especificado'}\n\n`
      mentions.push(cleanJid)
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
    try {
      await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
      await new Promise(r => setTimeout(r, 1000))
      await conn.sendMessage(m.chat, {
        text: `🚫 @${sender.split('@')[0]} fue eliminado por estar en la lista negra.\n📝 Motivo: ${reason}`,
        mentions: [sender]
      })
      console.log(`[AUTO-KICK] Eliminado ${sender}`)
    } catch (e) {
      if (e.data === 429 || e.message.includes('rate-overlimit')) {
        console.log(`⚠️ Rate limit al intentar autokick. Esperando 10s...`)
        await new Promise(r => setTimeout(r, 10000))
      } else console.log(`⚠️ No se pudo eliminar a ${sender}: ${e.message}`)
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
    const cleanJid = u.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
    if (db[u]?.banned) {
      const reason = db[u].banReason || 'No especificado'
      try {
        await conn.groupParticipantsUpdate(id, [u], 'remove')
        await new Promise(r => setTimeout(r, 1000))
        await conn.sendMessage(id, {
          text: `🚫 @${cleanJid.split('@')[0]} fue eliminado automáticamente por estar en la lista negra.\n📝 Motivo: ${reason}`,
          mentions: [cleanJid]
        })
        console.log(`[AUTO-KICK JOIN] ${cleanJid} eliminado`)
      } catch (e) {
        if (e.data === 429 || e.message.includes('rate-overlimit')) {
          console.log(`⚠️ Rate limit al expulsar al unirse, esperando 10s...`)
          await new Promise(r => setTimeout(r, 10000))
        } else console.log(`⚠️ No se pudo eliminar a ${cleanJid} al unirse: ${e.message}`)
      }
    }
  }
}

handler.help = ['addn', 'remn', 'clrn', 'listn', 'seen']
handler.tags = ['owner']
handler.command = ['addn', 'remn', 'clrn', 'listn', 'seen']
handler.rowner = true

export default handler
