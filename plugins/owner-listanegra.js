// 📂 plugins/propietario-listanegra.js — FELI 2026 — ULTRA FIX 🔥

import fs from 'fs'
import path from 'path'

const DATABASE_DIR = './database'
const BLACKLIST_FILE = path.join(DATABASE_DIR, 'blacklist.json')

if (!fs.existsSync(DATABASE_DIR)) fs.mkdirSync(DATABASE_DIR, { recursive: true })
if (!fs.existsSync(BLACKLIST_FILE)) fs.writeFileSync(BLACKLIST_FILE, JSON.stringify({}))

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ================= UTIL =================
const normalizeJid = jid => {
  if (!jid) return null
  jid = jid.toString().replace(/^\+/, '')
  if (jid.endsWith('@s.whatsapp.net')) return jid
  if (jid.endsWith('@c.us')) return jid.replace('@c.us', '@s.whatsapp.net')
  const cleaned = jid.replace(/\D/g, '')
  return cleaned ? cleaned + '@s.whatsapp.net' : null
}

const readDB = () => {
  try { return JSON.parse(fs.readFileSync(BLACKLIST_FILE)) }
  catch { return {} }
}

const saveDB = data =>
  fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(data, null, 2))

// ================= HANDLER =================
const handler = async (m, { conn, command, text }) => {

  const ICON = { ok: '✅', ban: '🚫' }
  const SEP = '━━━━━━━━━━━━━━━━━━━━'
  const db = readDB()

  const bannedList = Object.entries(db).filter(([_, d]) => d.banned)

  let userJid = null

  if (m.mentionedJid?.length)
    userJid = normalizeJid(m.mentionedJid[0])
  else if (m.quoted)
    userJid = normalizeJid(m.quoted.sender)
  else if (text && /^\d+$/.test(text.trim()) && command === 'unln') {
    const index = parseInt(text.trim()) - 1
    if (!bannedList[index])
      return conn.reply(m.chat, `${ICON.ban} Número inválido.`, m)
    userJid = bannedList[index][0]
  }

  if (command === 'ln') {
    if (!userJid)
      return conn.reply(m.chat, 'Debes mencionar o responder al usuario.', m)

    db[userJid] = {
      banned: true,
      reason: text?.replace(/@\d+/g, '').trim() || 'No especificado',
      addedBy: m.sender
    }

    saveDB(db)

    await conn.sendMessage(m.chat, {
      text: `🚫 *AGREGADO A LISTA NEGRA*\n${SEP}\n👤 @${userJid.split('@')[0]}`,
      mentions: [userJid]
    })
  }

  else if (command === 'unln') {
    if (!userJid || !db[userJid]?.banned)
      return conn.reply(m.chat, 'No está en la lista negra.', m)

    db[userJid].banned = false
    saveDB(db)

    await conn.sendMessage(m.chat, {
      text: `${ICON.ok} *USUARIO LIBERADO*\n${SEP}\n👤 @${userJid.split('@')[0]}`,
      mentions: [userJid]
    })
  }

  else if (command === 'vln') {
    if (!bannedList.length)
      return conn.reply(m.chat, 'Lista negra vacía.', m)

    let msg = `🚫 *LISTA NEGRA — ${bannedList.length}*\n${SEP}\n`
    const mentions = []

    bannedList.forEach(([jid, data], i) => {
      msg += `*${i + 1}.* 👤 @${jid.split('@')[0]}\n📝 ${data.reason}\n\n`
      mentions.push(jid)
    })

    msg += SEP
    await conn.sendMessage(m.chat, { text: msg, mentions })
  }

  else if (command === 'clrn') {
    for (const jid in db) db[jid].banned = false
    saveDB(db)
    conn.reply(m.chat, 'Lista negra vaciada.', m)
  }
}

// ================= AUTO-KICK SI HABLA =================
handler.all = async function (m) {
  if (!m.isGroup) return
  const db = readDB()
  const sender = normalizeJid(m.sender)
  if (!db[sender]?.banned) return

  await this.groupParticipantsUpdate(m.chat, [sender], 'remove')
  await sleep(500)

  await this.sendMessage(m.chat, {
    text: `🚫 *USUARIO EN LISTA NEGRA*\n━━━━━━━━━━━━━━━━━━━━\n👤 @${sender.split('@')[0]}\n🚷 Expulsión automática`,
    mentions: [sender]
  })
}

// ================= AUTO-KICK AL UNIRSE =================
handler.before = async function (m) {

  if (!m.isGroup) return
  if (!m.messageStubType) return

  // Detecta entrada al grupo
  const joinTypes = [27, 31, 32] // distintos tipos según versión

  if (!joinTypes.includes(m.messageStubType)) return

  const db = readDB()

  for (const user of m.messageStubParameters || []) {

    const jid = normalizeJid(user)
    if (!db[jid]?.banned) continue

    await this.groupParticipantsUpdate(m.chat, [jid], 'remove')
    await sleep(500)

    await this.sendMessage(m.chat, {
      text: `🚨 *USUARIO EN LISTA NEGRA*\n━━━━━━━━━━━━━━━━━━━━\n👤 @${jid.split('@')[0]}\n🚷 Expulsión inmediata`,
      mentions: [jid]
    })
  }
}

handler.help = ['ln', 'unln', 'vln', 'clrn']
handler.tags = ['owner']
handler.command = ['ln', 'unln', 'vln', 'clrn']
handler.rowner = true

export default handler
