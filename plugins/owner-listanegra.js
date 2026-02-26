// 📂 propietario-listanegra.js — FELI 2026 — FINAL 🔥

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
  jid = jid.toString().replace(/^\+/, '')
  if (jid.endsWith('@s.whatsapp.net')) return jid
  if (jid.endsWith('@c.us')) return jid.replace('@c.us', '@s.whatsapp.net')
  const clean = jid.replace(/\D/g, '')
  return clean ? clean + '@s.whatsapp.net' : null
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
    return bot?.admin
  } catch {
    return false
  }
}

// ================= HANDLER =================

const handler = async (m, { conn, command, text }) => {

  const ICON = { ok: '✅', ban: '🚫', warn: '⚠️' }
  const SEP = '━━━━━━━━━━━━━━━━━━━━'

  const db = readDB()
  const bannedList = Object.entries(db).filter(([_, d]) => d.banned)

  let userJid = null

  // ================= LN =================
  if (command === 'ln') {

    if (!m.mentionedJid?.length)
      return conn.reply(
        m.chat,
        '🚫 Debes mencionar al usuario.\n\nEjemplo:\n.ln @usuario motivo',
        m
      )

    userJid = normalizeJid(m.mentionedJid[0])

    const reason =
      text?.replace(/@\d+/g, '').trim() || 'No especificado'

    db[userJid] = {
      banned: true,
      reason,
      addedBy: m.sender,
      time: Date.now()
    }

    saveDB(db)

    await conn.sendMessage(m.chat, {
      text: `🚫 *AGREGADO A LISTA NEGRA*\n${SEP}\n👤 @${userJid.split('@')[0]}\n📝 ${reason}`,
      mentions: [userJid]
    })

  }

  // ================= UNLN =================
  else if (command === 'unln') {

    if (!text || !/^\d+$/.test(text.trim()))
      return conn.reply(
        m.chat,
        '⚠️ Usa el número de la lista.\n\nEjemplo:\n.unln 1',
        m
      )

    const index = parseInt(text.trim()) - 1

    if (!bannedList[index])
      return conn.reply(m.chat, '❌ Número inválido.', m)

    userJid = bannedList[index][0]

    db[userJid].banned = false
    saveDB(db)

    await conn.sendMessage(m.chat, {
      text: `${ICON.ok} *USUARIO LIBERADO*\n${SEP}\n👤 @${userJid.split('@')[0]}`,
      mentions: [userJid]
    })

  }

  // ================= LISTA =================
  else if (command === 'vln') {

    if (!bannedList.length)
      return conn.reply(m.chat, 'Lista negra vacía.', m)

    let msg = `🚫 *LISTA NEGRA — ${bannedList.length}*\n${SEP}\n`
    const mentions = []

    bannedList.forEach(([jid, data], i) => {

      msg += `*${i + 1}.* 👤 @${jid.split('@')[0]}\n`
      msg += `📝 ${data.reason}\n\n`

      mentions.push(jid)
    })

    msg += SEP

    await conn.sendMessage(m.chat, { text: msg, mentions })

  }

  // ================= LIMPIAR =================
  else if (command === 'clrn') {

    for (const jid in db)
      db[jid].banned = false

    saveDB(db)

    conn.reply(m.chat, '✅ Lista negra vaciada.', m)
  }
}

// ================= AUTO KICK SI HABLA =================

handler.all = async function (m) {

  if (!m.isGroup) return

  const db = readDB()
  const sender = normalizeJid(m.sender)

  if (!db[sender]?.banned) return

  if (!(await isBotAdmin(this, m.chat))) return

  try {

    await this.groupParticipantsUpdate(m.chat, [sender], 'remove')

    await sleep(500)

    await this.sendMessage(m.chat, {
      text: `🚫 *USUARIO EN LISTA NEGRA*\n━━━━━━━━━━━━━━━━━━━━\n👤 @${sender.split('@')[0]}\n🚷 Expulsión automática`,
      mentions: [sender]
    })

  } catch {}
}

// ================= AUTO KICK AL ENTRAR =================

handler.before = async function (m) {

  if (!m.isGroup) return
  if (!m.messageStubType) return

  const joinTypes = [27, 31, 32]

  if (!joinTypes.includes(m.messageStubType)) return

  const db = readDB()

  if (!(await isBotAdmin(this, m.chat))) return

  for (const user of m.messageStubParameters || []) {

    const jid = normalizeJid(user)

    if (!db[jid]?.banned) continue

    try {

      await this.groupParticipantsUpdate(m.chat, [jid], 'remove')

      await sleep(500)

      await this.sendMessage(m.chat, {
        text: `🚨 *USUARIO EN LISTA NEGRA*\n━━━━━━━━━━━━━━━━━━━━\n👤 @${jid.split('@')[0]}\n🚷 Expulsión inmediata`,
        mentions: [jid]
      })

    } catch {}
  }
}

// ================= CONFIG =================

handler.help = ['ln @usuario', 'unln <número>', 'vln', 'clrn']
handler.tags = ['owner']
handler.command = ['ln', 'unln', 'vln', 'clrn']
handler.rowner = true

export default handler
