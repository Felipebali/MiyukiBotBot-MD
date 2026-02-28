// 🌪 RESET ABSOLUTO DE USUARIO — FELI 2026 💎 FULL

import fs from 'fs'

// Archivos
const WARN_FILE = './data/warns.json'
const PAREJAS_FILE = './database/parejas.json'
const HERMANOS_FILE = './database/hermanos.json'
const PERFILES_FILE = './database/perfiles.json'

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

  // ================= BORRAR PERFILES =================

  if (fs.existsSync(PERFILES_FILE)) {
    const perfiles = loadJson(PERFILES_FILE)

    if (perfiles[who]) {
      delete perfiles[who]
      removed = true
    }

    saveJson(PERFILES_FILE, perfiles)
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
        delete parejas[id]
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
        delete hermanos[id]
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
    return conn.reply(
      m.chat,
      '⚠️ No se encontraron registros asociados a ese usuario.',
      m
    )
  }

  // ================= MENSAJES FINALES =================

  const fecha = new Date().toLocaleString('es-UY', {
    timeZone: 'America/Montevideo'
  })

  // 📢 Confirmación principal
  await conn.sendMessage(m.chat, {
    text:
`${emoji} *RESET EJECUTADO CORRECTAMENTE*

👤 Usuario: @${number}

El proceso de reinicialización fue aplicado con éxito.
La base de datos fue actualizada y sincronizada.

📅 ${fecha}

${done} Operación finalizada sin errores.`,
    mentions: [who]
  })

  // 🗑 Aviso oficial del sistema
  await conn.sendMessage(m.chat, {
    text:
`🗑 *SISTEMA DE RESETEO 💎*

Todos los registros vinculados a @${number} fueron eliminados de forma permanente.

🔒 No quedan datos almacenados.
♻️ Estado restablecido a configuración inicial.
📡 Sistema estable.`,
    mentions: [who]
  })
}

// ================= FLAGS =================

handler.command = ['resetabsoluto', 're', 'resetuser', 'borrardatos']
handler.rowner = true
handler.tags = ['owner']

export default handler
