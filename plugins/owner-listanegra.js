let handler = async (m, { conn, text, command, isOwner }) => {

  if (!isOwner) return

  const users = global.db.data.users
  const mentioned = m.mentionedJid?.[0] || m.quoted?.sender

  if (command === 'ln') {

    if (!mentioned)
      return conn.reply(m.chat,
        '🚫 Menciona o responde al usuario\n\nEjemplo:\n.ln @usuario motivo',
        m)

    let reason = text.replace(/@\d+/g, '').trim() || 'Sin motivo'

    if (!users[mentioned]) users[mentioned] = {}

    users[mentioned].blacklist = true
    users[mentioned].blacklistReason = reason
    users[mentioned].blacklistBy = m.sender
    users[mentioned].blacklistTime = Date.now()

    await conn.sendMessage(m.chat, {
      text:
`🚫 *USUARIO EN LISTA NEGRA*
━━━━━━━━━━━━━━━━━━━━
👤 @${mentioned.split('@')[0]}
📝 ${reason}`,
      mentions: [mentioned]
    })
  }

  if (command === 'unln') {

    if (!mentioned)
      return conn.reply(m.chat, '🚫 Menciona al usuario.', m)

    if (users[mentioned]) {
      users[mentioned].blacklist = false
    }

    await conn.sendMessage(m.chat, {
      text:
`✅ *USUARIO LIBERADO*
━━━━━━━━━━━━━━━━━━━━
👤 @${mentioned.split('@')[0]}`,
      mentions: [mentioned]
    })
  }

  if (command === 'vln') {

    let list = Object.entries(users)
      .filter(([_, u]) => u.blacklist)

    if (!list.length)
      return conn.reply(m.chat, 'Lista negra vacía.', m)

    let txt = '🚫 *LISTA NEGRA*\n━━━━━━━━━━━━━━━━━━━━\n'
    let mentions = []

    list.forEach(([jid, data], i) => {
      txt += `${i + 1}. @${jid.split('@')[0]}\n`
      txt += `📝 ${data.blacklistReason || 'Sin motivo'}\n\n`
      mentions.push(jid)
    })

    await conn.sendMessage(m.chat, {
      text: txt,
      mentions
    })
  }

}

handler.help = ['ln @user motivo', 'unln @user', 'vln']
handler.tags = ['owner']
handler.command = ['ln', 'unln', 'vln']
handler.rowner = true

export default handler


// ================= AUTO KICK SI HABLA =================

handler.all = async function (m) {

  if (!m.isGroup) return

  let user = global.db.data.users[m.sender]
  if (!user) return
  if (!user.blacklist) return

  try {

    await this.groupParticipantsUpdate(m.chat, [m.sender], 'remove')

    await this.sendMessage(m.chat, {
      text:
`🚫 *USUARIO EN LISTA NEGRA*
━━━━━━━━━━━━━━━━━━━━
👤 @${m.sender.split('@')[0]}
🚷 Expulsión automática`,
      mentions: [m.sender]
    })

  } catch (e) {
    console.log('AutoKick:', e)
  }
}


// ================= AUTO KICK AL ENTRAR =================

handler.before = async function (m, { participants }) {

  if (!m.isGroup) return
  if (!m.messageStubType) return

  const joinTypes = [27, 31, 32]

  if (!joinTypes.includes(m.messageStubType)) return

  for (let user of m.messageStubParameters || []) {

    let data = global.db.data.users[user]
    if (!data) continue
    if (!data.blacklist) continue

    try {

      await this.groupParticipantsUpdate(m.chat, [user], 'remove')

      await this.sendMessage(m.chat, {
        text:
`🚨 *USUARIO EN LISTA NEGRA*
━━━━━━━━━━━━━━━━━━━━
👤 @${user.split('@')[0]}
🚷 Expulsión inmediata`,
        mentions: [user]
      })

    } catch (e) {
      console.log('JoinKick:', e)
    }
  }
}
