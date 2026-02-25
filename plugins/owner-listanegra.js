// 📂 plugins/propietario-listanegra.js — FELI FIX MENCIONES 🔥

import fs from 'fs'
import path from 'path'

const DATABASE_DIR = './database'
const BLACKLIST_FILE = path.join(DATABASE_DIR, 'blacklist.json')

if (!fs.existsSync(DATABASE_DIR)) fs.mkdirSync(DATABASE_DIR, { recursive: true })
if (!fs.existsSync(BLACKLIST_FILE)) fs.writeFileSync(BLACKLIST_FILE, JSON.stringify({}))

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ================= UTIL =================

function normalizeJid(jid = '') {
  if (!jid) return null
  jid = jid.toString()

  if (jid.includes('@')) jid = jid.split('@')[0]

  const digits = jid.replace(/[^0-9]/g, '')
  if (!digits) return null

  return digits + '@s.whatsapp.net'
}

function getTarget(m) {
  return (
    m.mentionedJid?.[0] ||
    m.quoted?.sender ||
    m.quoted?.participant ||
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    null
  )
}

function digitsOnly(text = '') {
  return text.replace(/[^0-9]/g, '')
}

function findParticipant(meta, jid) {
  const target = digitsOnly(jid)

  return meta.participants.find(p => {
    const pd = digitsOnly(p.id)
    return pd === target || pd.endsWith(target)
  })
}

// ================= DB =================

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(BLACKLIST_FILE))
  } catch {
    return {}
  }
}

function writeDB(data) {
  fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(data, null, 2))
}

// =====================================================
// ================= HANDLER =================
// =====================================================

const handler = async (m, { conn, command, text }) => {

  const SEP = '━━━━━━━━━━━━━━━━━━━━'
  const db = readDB()

  const rawUser = getTarget(m)
  const userJid = normalizeJid(rawUser)

  if (!userJid && ['ln', 'unln'].includes(command))
    return conn.reply(m.chat, '⚠️ Debes mencionar o responder a un usuario.', m)

  if (userJid && !db[userJid]) db[userJid] = {}

  let reason = text?.replace(/@/g, '').replace(/\d+/g, '').trim()
  if (!reason) reason = 'No especificado'

  const bannedList = Object.entries(db).filter(([_, d]) => d.banned)

  // ================= ADD =================

  if (command === 'ln') {

    db[userJid] = {
      banned: true,
      reason,
      addedBy: m.sender
    }

    writeDB(db)

    await conn.sendMessage(m.chat, {
      text:
`🚫 *USUARIO EN LISTA NEGRA*
${SEP}
👤 @${userJid.split('@')[0]}
📝 ${reason}
${SEP}`,
      mentions: [userJid]
    })
  }

  // ================= REMOVE =================

  if (command === 'unln') {

    if (!db[userJid]?.banned)
      return conn.reply(m.chat, '⚠️ No está en lista.', m)

    db[userJid].banned = false
    writeDB(db)

    await conn.sendMessage(m.chat, {
      text:
`✅ *USUARIO LIBERADO*
${SEP}
👤 @${userJid.split('@')[0]}
${SEP}`,
      mentions: [userJid]
    })
  }

  // ================= VER =================

  if (command === 'vln') {

    if (!bannedList.length)
      return conn.reply(m.chat, '✅ Lista negra vacía.', m)

    let msg = `🚫 *LISTA NEGRA — ${bannedList.length}*\n${SEP}\n`
    const mentions = []

    bannedList.forEach(([jid, d], i) => {
      msg += `*${i + 1}.* @${jid.split('@')[0]}\n📝 ${d.reason}\n\n`
      mentions.push(jid)
    })

    msg += SEP

    await conn.sendMessage(m.chat, { text: msg.trim(), mentions })
  }

  // ================= LIMPIAR =================

  if (command === 'clrn') {

    for (const jid in db) db[jid].banned = false
    writeDB(db)

    await conn.sendMessage(m.chat, { text: '✅ Lista negra vaciada' })
  }
}

// =====================================================
// ================= AUTO KICK =================
// =====================================================

handler.all = async function (m) {

  try {

    if (!m.isGroup) return

    const sender = normalizeJid(m.sender)
    const db = readDB()

    if (!db[sender]?.banned) return

    const meta = await this.groupMetadata(m.chat)
    const participant = findParticipant(meta, sender)

    if (!participant) return

    await this.groupParticipantsUpdate(m.chat, [participant.id], 'remove')

  } catch {}
}

// =====================================================
// ================= AUTO JOIN =================
// =====================================================

handler.before = async function (m) {

  try {

    if (!m.isGroup) return
    if (![27, 31, 145, 146].includes(m.messageStubType)) return

    const db = readDB()

    for (const u of m.messageStubParameters || []) {

      const ujid = normalizeJid(u)

      if (!db[ujid]?.banned) continue

      const meta = await this.groupMetadata(m.chat)
      const participant = findParticipant(meta, ujid)

      if (!participant) continue

      await this.groupParticipantsUpdate(m.chat, [participant.id], 'remove')

      await this.sendMessage(m.chat, {
        text:
`🚨 *USUARIO EN LISTA NEGRA*
━━━━━━━━━━━━━━━━━━━━
👤 @${participant.id.split('@')[0]}
🚷 Expulsión automática
━━━━━━━━━━━━━━━━━━━━`,
        mentions: [participant.id]
      })
    }

  } catch {}
}

// ================= CONFIG =================

handler.help = ['ln', 'unln', 'vln', 'clrn']
handler.tags = ['owner']
handler.command = ['ln', 'unln', 'vln', 'clrn']
handler.rowner = true

export default handler
