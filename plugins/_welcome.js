// 📂 plugins/welcome.js
// Welcome + Leave limpio — SIN FOTO — SIN BUGS

let handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup)
    return conn.sendMessage(m.chat, { text: "❌ Solo funciona en grupos." })

  if (!isAdmin)
    return conn.sendMessage(m.chat, { text: "⚠️ Solo los administradores pueden usar este comando." })

  if (!global.db.data.chats[m.chat])
    global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]

  if (typeof chat.welcome === "undefined")
    chat.welcome = false

  chat.welcome = !chat.welcome

  await conn.sendMessage(m.chat, {
    text: `✨ *Welcome ${chat.welcome ? "ACTIVADO" : "DESACTIVADO"}*\nLos mensajes están ${chat.welcome ? "habilitados" : "deshabilitados"}.`
  })
}


// =======================
// DETECCIÓN ENTRADA / SALIDA
// =======================

handler.before = async function (m, { conn }) {
  if (!m.isGroup) return

  if (!global.db.data.chats[m.chat])
    global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  if (!chat.welcome) return

  // Anti spam 2 segundos
  const now = Date.now()
  if (chat._lastWelcome && now - chat._lastWelcome < 2000) return
  chat._lastWelcome = now

  const meta = await conn.groupMetadata(m.chat)
  const current = meta.participants.map(p => p.id)

  if (!chat.participants) {
    chat.participants = current
    return
  }

  const old = chat.participants

  const added = current.filter(x => !old.includes(x))
  const removed = old.filter(x => !current.includes(x))

  const groupName = meta.subject

  // =======================
  // BIENVENIDA
  // =======================
  for (let user of added) {
    await conn.sendMessage(m.chat, {
      text: `🎉 ¡Bienvenido/a @${user.split("@")[0]}!\n✨ Ahora formas parte de *${groupName}*.\nDisfruta tu estadía.`,
      mentions: [user]
    })
  }

  // =======================
  // DESPEDIDA
  // =======================
  for (let user of removed) {
    await conn.sendMessage(m.chat, {
      text: `👋 @${user.split("@")[0]} salió de *${groupName}*.\nLe deseamos lo mejor.`,
      mentions: [user]
    })
  }

  chat.participants = current
}


handler.command = ["welcome", "welc", "wl"]
handler.group = true
handler.admin = true

export default handler
