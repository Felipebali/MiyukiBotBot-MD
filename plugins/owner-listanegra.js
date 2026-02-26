import fs from 'fs'
import path from 'path'

const DB_DIR = './database'
const DB_FILE = path.join(DB_DIR, 'blacklist.json')

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({}))

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ================= UTIL =================

const normalizeJid = jid => {
  if (!jid) return null
  jid = jid.toString()

  if (jid.includes('@')) return jid

  const num = jid.replace(/\D/g, '')
  if (!num) return null

  return num + '@s.whatsapp.net'
}

const readDB = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE))
  } catch {
    return {}
  }
}

const saveDB = data =>
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))

const isBotAdmin = async (conn, chat) => {
  try {
    const meta = await conn.groupMetadata(chat)
    const bot = meta.participants.find(p =>
      normalizeJid(p.id) === normalizeJid(conn.user.id)
    )
    return bot?.admin || false
  } catch {
    return false
  }
}

// ================= OBTENER USUARIO =================

const getUser = (m) => {
  if (m.mentionedJid?.length) return normalizeJid(m.mentionedJid[0])
  if (m.quoted?.sender) return normalizeJid(m.quoted.sender)
  return null
}

// ================= HANDLER =================

const handler = async (m, { conn, command, text }) => {

  const SEP = '━━━━━━━━━━━━━━━━━━━━'
  const db = readDB()

  const bannedList = Object.entries(db).filter(([_, d]) => d.banned)

  let userJid = null

  // ================= LN =================
  if (command === 'ln') {

    userJid = getUser(m)

    if (!userJid)
      return conn.reply(
        m.chat,
        '🚫 Debes mencionar o responder al usuario.\n\nEjemplo:\n.ln @usuario motivo',
        m
      )

    const reason = text?.replace(/@\d+/g, '').trim() || 'No especificado'

    db[userJid] = {
      banned: true,
      reason,
      by: m.sender,
      time: Date.now()
    }

    saveDB(db)

    await conn.sendMessage(m.chat, {
      text:
`🚫 *AGREGADO A LISTA NEGRA*
${SEP}
👤 @${userJid.split('@')[0]}
📝 ${reason}`,
      mentions: [userJid]
    })
  }

  // ================= UNLN =================
  else if (command === 'unln') {

    const index = parseInt(text) - 1

    if (!bannedList[index])
      return conn.reply(m.chat, '❌ Número inválido.', m)

    userJid = bannedList[index][0]

    db[userJid].banned = false
    saveDB(db)

    await conn.sendMessage(m.chat, {
      text:
`✅ *USUARIO LIBERADO*
${SEP}
👤 @${userJid.split('@')[0]}`,
      mentions: [userJid]
    })
  }

  // ================= VER LISTA =================
  else if (command === 'vln') {

    if (!bannedList.length)
      return conn.reply(m.chat, 'Lista negra vacía.', m)

    let msg = `🚫 *LISTA NEGRA*\n${SEP}\n`
    const mentions = []

    bannedList.forEach(([jid, data], i) => {
      msg += `${i + 1}. @${jid.split('@')[0]}\n`
      msg += `📝 ${data.reason}\n\n`
      mentions.push(jid)
    })

    await conn.sendMessage(m.chat, { text: msg, mentions })
  }

  // ================= LIMPIAR =================
  else if (command === 'clrn') {

    for (const jid in db) db[jid].banned = false

    saveDB(db)

    conn.reply(m.chat, '✅ Lista negra vaciada.', m)
  }
}

// ================= AUTO KICK SI HABLA =================

handler.all = async function (m) {

  try {

    if (!m.isGroup) return

    const db = readDB()
    const sender = normalizeJid(m.sender)

    if (!db[sender]?.banned) return
    if (sender === normalizeJid(this.user.id)) return

    if (!(await isBotAdmin(this, m.chat))) return

    await this.groupParticipantsUpdate(m.chat, [sender], 'remove')

    await sleep(800)

    await this.sendMessage(m.chat, {
      text:
`🚫 *USUARIO EN LISTA NEGRA*
━━━━━━━━━━━━━━━━━━━━
👤 @${sender.split('@')[0]}
🚷 Expulsión automática`,
      mentions: [sender]
    })

  } catch (e) {
    console.log('AutoKick:', e)
  }
}

// ================= AUTO KICK AL ENTRAR =================

handler.before = async function (m) {

  try {

    if (!m.isGroup) return
    if (!m.messageStubType) return

    const joinTypes = [27, 31, 32]
    if (!joinTypes.includes(m.messageStubType)) return

    const db = readDB()

    if (!(await isBotAdmin(this, m.chat))) return

    for (const user of m.messageStubParameters || []) {

      const jid = normalizeJid(user)

      if (!db[jid]?.banned) continue
      if (jid === normalizeJid(this.user.id)) continue

      await this.groupParticipantsUpdate(m.chat, [jid], 'remove')

      await sleep(800)

      await this.sendMessage(m.chat, {
        text:
`🚨 *USUARIO EN LISTA NEGRA*
━━━━━━━━━━━━━━━━━━━━
👤 @${jid.split('@')[0]}
🚷 Expulsión inmediata`,
        mentions: [jid]
      })
    }

  } catch (e) {
    console.log('JoinKick:', e)
  }
}

// ================= CONFIG =================

handler.help = ['ln @usuario', 'unln <numero>', 'vln', 'clrn']
handler.tags = ['owner']
handler.command = ['ln', 'unln', 'vln', 'clrn']
handler.rowner = true

export default handler
