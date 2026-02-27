// 🌪 RESET ABSOLUTO DE USUARIO — FELI 2026 💎
import fs from 'fs'

const WARN_FILE = './data/warns.json'
const PAREJAS_FILE = './database/parejas.json'
const HERMANOS_FILE = './database/hermanos.json'

// ================= UTILIDADES =================

function normalizeJid(jid = '') {
  return jid
    .toString()
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/@c\.us$/, '@s.whatsapp.net')
}

function extractNumber(jid = '') {
  return jid.replace(/[^\d]/g, '')
}

function loadJson(file) {
  if (!fs.existsSync(file)) return {}
  return JSON.parse(fs.readFileSync(file))
}

function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// ================= HANDLER =================

const handler = async (m, { conn, text, mentionedJid }) => {
  const emoji = '♻️'
  const done = '✅'
  let user = ''

  // 🔎 Detectar usuario
  if (mentionedJid?.length) user = mentionedJid[0]
  else if (text?.match(/\d+/)) user = text.match(/\d+/)[0] + '@s.whatsapp.net'
  else if (m.quoted?.sender) user = m.quoted.sender
  else return conn.reply(m.chat, `${emoji} Menciona, responde o escribe el número.`, m)

  const userJid = normalizeJid(user)
  if (!userJid) return conn.reply(m.chat, '⚠️ JID inválido.', m)

  const number = extractNumber(userJid)
  const who = number + '@s.whatsapp.net'

  let removed = false

  // ================= BORRAR WARNS =================
  if (fs.existsSync(WARN_FILE)) {
    const warns = loadJson(WARN_FILE)

    for (const chatId in warns) {
      if (!warns[chatId]) continue
      for (const key in warns[chatId]) {
        if (key.replace(/[^\d]/g, '') === number) {
          delete warns[chatId][key]
          removed = true
        }
      }
    }

    saveJson(WARN_FILE, warns)
  }

  // ================= BORRAR PAREJAS =================
  if (fs.existsSync(PAREJAS_FILE)) {
    const parejas = loadJson(PAREJAS_FILE)

    if (parejas[who]) {
      delete parejas[who]
      removed = true
    }

    for (const id in parejas) {
      if (parejas[id]?.pareja === who) {
        parejas[id].pareja = null
        parejas[id].estado = 'soltero'
        removed = true
      }
    }

    saveJson(PAREJAS_FILE, parejas)
  }

  // ================= BORRAR HERMANOS =================
  if (fs.existsSync(HERMANOS_FILE)) {
    const hermanos = loadJson(HERMANOS_FILE)

    if (hermanos[who]) {
      delete hermanos[who]
      removed = true
    }

    for (const id in hermanos) {
      if (hermanos[id]?.hermano === who) {
        hermanos[id].hermano = null
        removed = true
      }
    }

    saveJson(HERMANOS_FILE, hermanos)
  }

  // ================= BORRAR GLOBAL.DB =================
  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.chats) global.db.data.chats = {}

  if (global.db.data.users[who]) {
    delete global.db.data.users[who]
    removed = true
  }

  for (const chat of Object.values(global.db.data.chats)) {
    if (!chat) continue

    if (chat.warns) {
      for (const key in chat.warns) {
        if (key.replace(/[^\d]/g, '') === number) {
          delete chat.warns[key]
          removed = true
        }
      }
    }
  }

  if (global.db.write) await global.db.write()

  if (!removed) {
    return conn.reply(m.chat, '⚠️ El usuario no se encontró en ninguna base de datos.', m)
  }

  // ================= MENSAJE FINAL =================
  const fecha = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' })

  await conn.sendMessage(m.chat, {
    text: `${emoji} *RESET ABSOLUTO COMPLETADO*\n\n👤 Usuario: @${number}\n🧾 Eliminado de:\n• warns.json\n• parejas.json\n• hermanos.json\n• global.db\n\n📅 ${fecha}\n\n${done} Usuario restaurado como nuevo.`,
    mentions: [who]
  })
}

// ================= FLAGS =================

handler.command = ['resetabsoluto', 'resettotal', 'resetuser', 'borrardatos']
handler.rowner = true
handler.tags = ['owner']

export default handler
