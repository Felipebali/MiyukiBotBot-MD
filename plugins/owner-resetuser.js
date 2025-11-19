// plugins/owner-resetuser.js
function normalizeJid(jid) {
  if (!jid) return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp.net$/, '@s.whatsapp.net')
}

const handler = async (m, { conn, text, mentionedJid }) => {
  const emoji = '♻️'
  const done = '✅'
  let user = ''

  // 1️⃣ Detectar usuario (mención / número / respuesta)
  if (mentionedJid && mentionedJid.length > 0) user = mentionedJid[0]
  else if (text?.match(/\d+/g)) user = text.match(/\d+/g).join('') + '@s.whatsapp.net'
  else if (m.quoted && m.quoted.sender) user = m.quoted.sender
  else return conn.reply(m.chat, `${emoji} Debes mencionar, responder o escribir el número del usuario.\n\n📌 Ejemplo:\n.r @usuario\n.r 59898719147`, m)

  const userJid = normalizeJid(user)
  if (!userJid) return conn.reply(m.chat, '⚠️ JID inválido.', m)

  // 2️⃣ Asegurar existencia de las bases
  global.db.data.users = global.db.data.users || {}
  global.db.data.chats = global.db.data.chats || {}

  // 3️⃣ Verificar si el usuario está en la base (si existe)
  const existsInUsers = !!global.db.data.users[userJid]
  // También chequeamos si aparece en alguna chat.warns
  const appearsInWarns = Object.values(global.db.data.chats).some(chat => chat.warns && chat.warns[userJid])

  if (!existsInUsers && !appearsInWarns) {
    return conn.reply(m.chat, `⚠️ El usuario no tiene datos ni advertencias registradas.`, m)
  }

  try {
    // 4️⃣ Eliminar datos del usuario en global.db.data.users
    if (existsInUsers) delete global.db.data.users[userJid]

    // 5️⃣ Eliminar advertencias y motivos del usuario en todos los grupos
    Object.entries(global.db.data.chats).forEach(([chatId, chat]) => {
      if (!chat) return
      if (chat.warns && chat.warns[userJid]) {
        // Si quieres mantener registro pero reiniciar:
        // chat.warns[userJid].count = 0
        // chat.warns[userJid].motivos = []
        // Aquí borramos la entrada por completo:
        delete chat.warns[userJid]
      }

      // Opcional: si guardas listas negras (blacklist / ln / banned), intentamos limpiar:
      // comprueba nombres comunes de listas negras y bórralo si existe
      const blacklistKeys = ['blacklist', 'ln', 'lista_negra', 'listaNegra', 'banned']
      blacklistKeys.forEach(k => {
        if (chat[k] && Array.isArray(chat[k])) {
          const idx = chat[k].indexOf(userJid)
          if (idx !== -1) chat[k].splice(idx, 1)
        } else if (chat[k] && typeof chat[k] === 'object' && chat[k][userJid]) {
          delete chat[k][userJid]
        }
      })
    })

    // 6️⃣ Además, limpiar en root (global.db.data) si tienes listas globales
    const globalBlacklistKeys = ['blacklist', 'ln', 'lista_negra', 'listaNegra', 'banned', 'bannedUsers']
    globalBlacklistKeys.forEach(k => {
      if (global.db.data[k]) {
        if (Array.isArray(global.db.data[k])) {
          const idx = global.db.data[k].indexOf(userJid)
          if (idx !== -1) global.db.data[k].splice(idx, 1)
        } else if (typeof global.db.data[k] === 'object' && global.db.data[k][userJid]) {
          delete global.db.data[k][userJid]
        }
      }
    })

    // 7️⃣ Guardar cambios
    if (global.db.write) await global.db.write()

    // 8️⃣ Mensaje final en grupo con mención clickeable
    const name = userJid.split('@')[0]
    const fecha = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' })

    await conn.sendMessage(m.chat, {
      text: `${emoji} *Reinicio completado*\n\n👤 Usuario: @${name}\n🧾 Estado: Datos y advertencias eliminados\n📅 Fecha: ${fecha}\n\n${done} Base de datos actualizada correctamente.`,
      mentions: [userJid]
    })
  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, '❌ Ocurrió un error al intentar resetear el usuario. Revisa los logs.', m)
  }
}

handler.tags = ['owner']
handler.command = ['deletedatauser', 'resetuser', 'borrardatos']
handler.owner = true // Solo dueño

export default handler
