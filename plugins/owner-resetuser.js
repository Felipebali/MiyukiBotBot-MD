// 🌪 Reset total de usuario — FELI 2026
import fs from 'fs'

const DB_FILE = './data/warns.json' // archivo de warns, opcional

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

  let removed = false

  // =================== BORRAR WARNS ===================
  if (fs.existsSync(DB_FILE)) {
    const warns = JSON.parse(fs.readFileSync(DB_FILE))
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
    fs.writeFileSync(DB_FILE, JSON.stringify(warns, null, 2))
  }

  // =================== BORRAR TODO DE LA DATABASE ===================
  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.chats) global.db.data.chats = {}

  // Borrar todas las propiedades del usuario
  if (global.db.data.users[who]) {
    delete global.db.data.users[who]
    removed = true
  }

  // Limpiar cualquier referencia en chats
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
    return conn.reply(m.chat, `⚠️ El usuario no se encuentra en la base de datos.`, m)
  }

  // =================== MENSAJE FINAL ===================
  const fecha = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' })

  await conn.sendMessage(m.chat, {
    text: `${emoji} *Reset TOTAL completado*\n\n👤 Usuario: @${number}\n🧾 Toda la base de datos del usuario ha sido eliminada\n📅 ${fecha}\n\n${done} Base actualizada correctamente.`,
    mentions: [who]
  })
}

// =================== FLAGS ===================
handler.command = ['resetuser', 're', 'borrardatos', 'resettotal']
handler.rowner = true
handler.tags = ['owner']

export default handler
