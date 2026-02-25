// 📂 plugins/propietario-listanegra.js — FELI 2026 — BLACKLIST JSON 🔥

import fs from 'fs'
import path from 'path'

const DATABASE_DIR = './database'
const BLACKLIST_FILE = path.join(DATABASE_DIR, 'blacklist.json')

// 🔹 Crear carpeta si no existe
if (!fs.existsSync(DATABASE_DIR)) fs.mkdirSync(DATABASE_DIR, { recursive: true })

// 🔹 Crear archivo si no existe
if (!fs.existsSync(BLACKLIST_FILE)) fs.writeFileSync(BLACKLIST_FILE, JSON.stringify({}))

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ================= UTILIDADES =================

function normalizeJid(jid = '') {
  if (!jid) return null
  jid = jid.toString().trim().replace(/^\+/, '')
  if (jid.endsWith('@c.us')) return jid.replace('@c.us', '@s.whatsapp.net')
  if (jid.endsWith('@s.whatsapp.net')) return jid
  if (jid.includes('@')) return jid
  const cleaned = jid.replace(/[^0-9]/g, '')
  if (!cleaned) return null
  return cleaned + '@s.whatsapp.net'
}

function digitsOnly(text = '') {
  return text.toString().replace(/[^0-9]/g, '')
}

function extractPhoneNumber(text = '') {
  const d = digitsOnly(text)
  if (!d || d.length < 5) return null
  return d
}

function findParticipantByDigits(metadata, digits) {
  return metadata.participants.find(p => {
    const pd = digitsOnly(p.id)
    return pd === digits || pd.endsWith(digits)
  })
}

// ================= BASE DE DATOS =================

function readBlacklist() {
  try {
    return JSON.parse(fs.readFileSync(BLACKLIST_FILE))
  } catch {
    return {}
  }
}

function writeBlacklist(data) {
  fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(data, null, 2))
}

// ================= UTILIDAD DISPLAY =================

async function getDisplayAndMentions(conn, chatId, jid) {
  const meta = chatId ? await conn.groupMetadata(chatId).catch(() => null) : null
  if (!meta) return { display: jid.split('@')[0], mentions: [jid] }
  const participant = meta.participants.find(p => p.id === jid)
  const display = participant ? (participant.notify || participant.name) : jid.split('@')[0]
  return { display, mentions: [jid] }
}

// =====================================================
// ================= HANDLER PRINCIPAL =================
// =====================================================

const handler = async (m, { conn, command, text }) => {
  const SEP = '━━━━━━━━━━━━━━━━━━━━'
  const ICON = { ban: '🚫', ok: '✅', warn: '⚠️', alert: '🚨' }

  const dbUsers = readBlacklist()

  // ================= REACCIONES =================
  if (command === 'ln') await m.react('🚫')
  if (command === 'unln') await m.react('🕊️')
  if (command === 'vln') await m.react('📋')
  if (command === 'clrn') await m.react('🧹')

  // ================= AUTO-KICK AL CITAR =================
  if (m.isGroup && m.quoted) {
    const quotedJid = normalizeJid(m.quoted.sender || m.quoted.participant)
    if (quotedJid && dbUsers[quotedJid]?.banned) {
      try {
        const reason = dbUsers[quotedJid].reason || 'No especificado'
        const { display, mentions } = await getDisplayAndMentions(conn, m.chat, quotedJid)
        await conn.groupParticipantsUpdate(m.chat, [quotedJid], 'remove')
        await sleep(700)
        await conn.sendMessage(m.chat, {
          text: `${ICON.ban} *ELIMINACIÓN INMEDIATA — LISTA NEGRA*\n${SEP}\n👤 @${display}\n📝 *Motivo:* ${reason}\n🚷 *Expulsión automática*\n${SEP}`,
          mentions
        })
      } catch {}
    }
  }

  const bannedList = Object.entries(dbUsers).filter(([_, d]) => d.banned)

  let userJid = null
  let numberDigits = null

  if (command === 'unln' && /^\d+$/.test(text?.trim())) {
    const index = parseInt(text.trim()) - 1
    if (!bannedList[index]) {
      await m.react('❌')
      return conn.reply(m.chat, `${ICON.ban} Número inválido.`, m)
    }
    userJid = bannedList[index][0]
  } else if (m.quoted) {
    userJid = normalizeJid(m.quoted.sender || m.quoted.participant)
  } else if (m.mentionedJid?.length) {
    userJid = normalizeJid(m.mentionedJid[0])
  } else if (text) {
    const num = extractPhoneNumber(text)
    if (num) {
      numberDigits = num
      userJid = normalizeJid(num)
    }
  }

  let reason = text?.replace(/@/g, '').replace(/\d{5,}/g, '').trim()
  if (!reason) reason = 'No especificado'

  if (!userJid && !['vln', 'clrn'].includes(command)) {
    await m.react('❌')
    return conn.reply(m.chat, `${ICON.warn} Debes responder, mencionar o usar índice.`, m)
  }

  if (userJid && !dbUsers[userJid]) dbUsers[userJid] = {}

  // ================= ADD =================
  if (command === 'ln') {
    if (numberDigits && !m.quoted && !m.mentionedJid) {
      await m.react('❌')
      return conn.reply(m.chat, `${ICON.ban} Usa mencionar o citar, no escribas números.`, m)
    }

    dbUsers[userJid] = { banned: true, reason, addedBy: m.sender }

    try {
      const groups = Object.keys(await conn.groupFetchAllParticipating())
      for (const jid of groups) {
        await sleep(800)
        try {
          const { display, mentions } = await getDisplayAndMentions(conn, jid, userJid)
          await conn.groupParticipantsUpdate(jid, [userJid], 'remove')
          await sleep(700)
          await conn.sendMessage(jid, {
            text: `${ICON.ban} *USUARIO BLOQUEADO — LISTA NEGRA*\n${SEP}\n👤 @${display}\n📝 *Motivo:* ${reason}\n🚷 *Expulsión automática*\n${SEP}`,
            mentions
          })
        } catch {}
      }
    } catch {}

    writeBlacklist(dbUsers)
  }

  // ================= REMOVER =================
  else if (command === 'unln') {
    if (!dbUsers[userJid]?.banned) {
      await m.react('❌')
      return conn.reply(m.chat, `${ICON.ban} No está en la lista negra.`, m)
    }

    dbUsers[userJid] = { banned: false }
    writeBlacklist(dbUsers)

    const { display, mentions } = await getDisplayAndMentions(conn, m.chat, userJid)
    await conn.sendMessage(m.chat, {
      text: `${ICON.ok} *USUARIO LIBERADO*\n${SEP}\n👤 @${display}\n${SEP}`,
      mentions
    })
  }

  // ================= LISTAR =================
  else if (command === 'vln') {
    if (!bannedList.length) return conn.reply(m.chat, `${ICON.ok} Lista negra vacía.`, m)

    const SEP = '━━━━━━━━━━━━━━━━━━━━'
    const ICON = { ban: '🚫' }
    let msg = ''
    const mentions = []

    for (let i = 0; i < bannedList.length; i++) {
      const [jid, d] = bannedList[i]
      const { display, mentions: mnts } = await getDisplayAndMentions(conn, m.chat, jid)
      msg += `${i + 1}. ${ICON.ban} 👤 @${display}\n📝 Motivo: ${d.reason || 'No especificado'}\n${SEP}\n`
      mentions.push(...mnts)
    }

    await conn.sendMessage(m.chat, { text: msg.trim(), mentions })
  }

  // ================= LIMPIAR =================
  else if (command === 'clrn') {
    for (const jid in dbUsers) dbUsers[jid].banned = false
    writeBlacklist(dbUsers)
    await conn.sendMessage(m.chat, { text: `✅ *LISTA NEGRA VACIADA*\n━━━━━━━━━━━━━━━━━━━━` })
  }
}

// =====================================================
// ================= AUTO-KICK SI HABLA =================
// =====================================================

handler.all = async function (m) {
  try {
    if (!m.isGroup) return
    const sender = normalizeJid(m.sender)
    const dbUsers = readBlacklist()
    if (!dbUsers[sender]?.banned) return

    const { display, mentions } = await getDisplayAndMentions(this, m.chat, sender)
    await this.groupParticipantsUpdate(m.chat, [sender], 'remove')
    await sleep(700)
    await this.sendMessage(m.chat, {
      text: `🚫 *USUARIO BLOQUEADO — LISTA NEGRA*\n━━━━━━━━━━━━━━━━━━━━\n👤 @${display}\n🚷 *Expulsión automática*\n━━━━━━━━━━━━━━━━━━━━`,
      mentions
    })
  } catch {}
}

// =====================================================
// ========== AUTO-KICK + AVISO AL ENTRAR =================
// =====================================================

handler.before = async function (m) {
  try {
    if (![27, 31].includes(m.messageStubType)) return
    if (!m.isGroup) return

    const dbUsers = readBlacklist()
    for (const u of m.messageStubParameters || []) {
      const ujid = normalizeJid(u)
      if (!dbUsers[ujid]?.banned) continue

      const { display, mentions } = await getDisplayAndMentions(this, m.chat, ujid)
      await this.groupParticipantsUpdate(m.chat, [ujid], 'remove')
      await sleep(700)

      const reason = dbUsers[ujid].reason || 'No especificado'
      await this.sendMessage(m.chat, {
        text: `🚨 *USUARIO EN LISTA NEGRA*\n━━━━━━━━━━━━━━━━━━━━\n👤 @${display}\n📝 *Motivo:* ${reason}\n🚷 *Expulsión inmediata*\n━━━━━━━━━━━━━━━━━━━━`,
        mentions
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
