let handler = async (m, { conn, text, command, isOwner }) => {

  if (!isOwner) return

  const users = global.db.data.users

  const getUser = () => {
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    if (m.quoted?.sender) return m.quoted.sender

    let num = text.match(/\d{5,16}/)
    if (num) return num[0] + '@s.whatsapp.net'

    return null
  }

  const target = getUser()

  // ================= LN =================

  if (command === 'ln') {

    if (!target)
      return conn.reply(m.chat,
        '🚫 Menciona, responde o escribe el número\n\nEjemplo:\n.ln @user motivo',
        m)

    let reason = text.replace(/@\d+/g, '').trim() || 'Sin motivo'

    if (!users[target]) users[target] = {}

    users[target].blacklist = true
    users[target].blacklistReason = reason
    users[target].blacklistBy = m.sender
    users[target].blacklistTime = Date.now()

    await conn.sendMessage(m.chat, {
      text:
`🚫 *USUARIO EN LISTA NEGRA*
━━━━━━━━━━━━━━━━━━━━
👤 @${target.split('@')[0]}
📝 ${reason}`,
      mentions: [target]
    })
  }

  // ================= UNLN =================

  if (command === 'unln') {

    if (!target)
      return conn.reply(m.chat, '🚫 Menciona o responde al usuario.', m)

    if (users[target]) users[target].blacklist = false

    await conn.sendMessage(m.chat, {
      text:
`✅ *USUARIO LIBERADO*
━━━━━━━━━━━━━━━━━━━━
👤 @${target.split('@')[0]}`,
      mentions: [target]
    })
  }

  // ================= VER LISTA =================

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

    await conn.sendMessage(m.chat, { text: txt, mentions })
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
  if (!user?.blacklist) return

  try {

    let group = await this.groupMetadata(m.chat)
    let bot = group.participants.find(p => p.id == this.user.id)

    if (!bot?.admin) return

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

handler.before = async function (m) {

  if (!m.isGroup) return
  if (!m.messageStubType) return

  const joinTypes = [27, 31, 32]
  if (!joinTypes.includes(m.messageStubType)) return

  for (let jid of m.messageStubParameters || []) {

    let data = global.db.data.users[jid]
    if (!data?.blacklist) continue

    try {

      let group = await this.groupMetadata(m.chat)
      let bot = group.participants.find(p => p.id == this.user.id)

      if (!bot?.admin) return

      await this.groupParticipantsUpdate(m.chat, [jid], 'remove')

      await this.sendMessage(m.chat, {
        text:
`🚨 *USUARIO EN LISTA NEGRA*
━━━━━━━━━━━━━━━━━━━━
👤 @${jid.split('@')[0]}
🚷 Expulsión inmediata`,
        mentions: [jid]
      })

    } catch (e) {
      console.log('JoinKick:', e)
    }
  }
}
