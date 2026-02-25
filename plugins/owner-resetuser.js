import fs from 'fs'

const WARN_FILE = './data/warns.json'

// =================== UTILIDADES ===================

function normalizeJid(jid = '') {
  return jid
    .toString()
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/@c\.us$/, '@s.whatsapp.net')
}

function extractNumber(jid = '') {
  return jid.replace(/[^\d]/g, '')
}

// =================== HANDLER ===================

const handler = async (m, { conn, text, mentionedJid }) => {
  const emoji = '♻️'
  const done = '✅'
  let user = ''

  // 1️⃣ Detectar usuario
  if (mentionedJid?.length) user = mentionedJid[0]
  else if (text?.match(/\d+/)) user = text.match(/\d+/)[0] + '@s.whatsapp.net'
  else if (m.quoted?.sender) user = m.quoted.sender
  else return conn.reply(m.chat, `${emoji} Menciona, responde o escribe el número.`, m)

  const userJid = normalizeJid(user)
  if (!userJid) return conn.reply(m.chat, '⚠️ JID inválido.', m)

  const number = extractNumber(userJid)
  const who = number + '@s.whatsapp.net'

  // =================== CARGAR WARNS ===================

  let warns = {}
  if (fs.existsSync(WARN_FILE)) {
    warns = JSON.parse(fs.readFileSync(WARN_FILE))
  }

  let removed = false

  // 🧨 BORRADO REAL DE WARNS.JSON
  for (const chatId in warns) {
    const chat = warns[chatId]
    if (!chat || typeof chat !== 'object') continue

    for (const key in chat) {
      const cleanKey = key.replace(/[^\d]/g, '')
      if (cleanKey === number) {
        delete chat[key]
        removed = true
      }
    }
  }

  fs.writeFileSync(WARN_FILE, JSON.stringify(warns, null, 2))

  // =================== LIMPIAR GLOBAL.DB ===================

  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.chats) global.db.data.chats = {}

  if (global.db.data.users[who]) {
    delete global.db.data.users[who]
    removed = true
  }

  for (const chat of Object.values(global.db.data.chats)) {
    if (!chat?.warns) continue

    for (const key in chat.warns) {
      const cleanKey = key.replace(/[^\d]/g, '')
      if (cleanKey === number) {
        delete chat.warns[key]
        removed = true
      }
    }
  }

  if (global.db.write) await global.db.write()

  if (!removed) {
    return conn.reply(m.chat, `⚠️ El usuario no tenía advertencias registradas.`, m)
  }

  // =================== MENSAJE FINAL ===================

  const fecha = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' })

  await conn.sendMessage(m.chat, {
    text: `${emoji} *Reset completado*\n\n👤 Usuario: @${number}\n🧾 Advertencias: eliminadas\n📅 ${fecha}\n\n${done} Base actualizada correctamente.`,
    mentions: [who]
  })
}

// =================== FLAGS ===================

handler.command = ['resetuser', 'deletedatauser', 'borrardatos']
handler.rowner = true
handler.tags = ['owner']

export default handler
