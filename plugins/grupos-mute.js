// 📂 plugins/mute.js — FelixCat_Bot 🐾

let mutedUsers = new Set()

let handler = async (m, { conn, args, command, participants }) => {
  const botNumber = conn.user.id.split(":")[0]
  const botJid = botNumber + "@s.whatsapp.net"
  const protectedOwners = ["59896026646@s.whatsapp.net", "59898719147@s.whatsapp.net"] // 🔒 Owners protegidos

  // 🧠 Comprobar si es un grupo
  if (!m.isGroup) return m.reply("👥 Este comando solo puede usarse en grupos.")

  // 🔑 Verificar si el usuario que ejecuta es admin
  const groupAdmins = participants
    .filter(p => p.admin)
    .map(p => p.id)
  const isAdmin = groupAdmins.includes(m.sender)

  if (!isAdmin)
    return m.reply("❌ Solo los administradores pueden usar este comando.")

  // 🎯 Obtener usuario objetivo (mención, número o mensaje citado)
  let who =
    m.mentionedJid && m.mentionedJid[0]
      ? m.mentionedJid[0]
      : args[0]
      ? args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net"
      : m.quoted
      ? m.quoted.sender
      : ""

  if (!who)
    return m.reply("🔇 *Debes etiquetar, responder o escribir el número del usuario que querés silenciar o desilenciar.*")

  // 🛡️ Protección: no se puede mutear al bot ni a los dueños
  if (who === botJid || protectedOwners.includes(who))
    return m.reply("🤨 No podés silenciar al bot ni a un owner protegido.")

  // 🔇 Comando mute/silenciar
  if (/^(mute|silenciar)$/i.test(command)) {
    if (mutedUsers.has(who))
      return m.reply(`⚠️ @${who.split("@")[0]} ya está silenciado.`, null, {
        mentions: [who],
      })

    mutedUsers.add(who)
    return m.reply(`🔇 @${who.split("@")[0]} fue silenciado.`, null, {
      mentions: [who],
    })
  }

  // 🔈 Comando unmute/desilenciar
  if (/^(unmute|desilenciar)$/i.test(command)) {
    if (!mutedUsers.has(who))
      return m.reply(`⚠️ @${who.split("@")[0]} no está silenciado.`, null, {
        mentions: [who],
      })

    mutedUsers.delete(who)
    return m.reply(`🔈 @${who.split("@")[0]} fue desmuteado.`, null, {
      mentions: [who],
    })
  }
}

// 🚫 Antes de procesar mensajes: borrar si el remitente está muteado
handler.before = async (m, { conn }) => {
  const botNumber = conn.user.id.split(":")[0]
  const botJid = botNumber + "@s.whatsapp.net"
  const protectedOwners = ["59896026646@s.whatsapp.net", "59898719147@s.whatsapp.net"]

  if (m.sender === botJid || protectedOwners.includes(m.sender)) return false

  if (mutedUsers.has(m.sender)) {
    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          id: m.key.id,
          participant: m.sender,
        },
      })
      return true
    } catch (e) {
      console.error("Error al borrar mensaje:", e)
    }
  }
  return false
}

handler.help = ["mute", "silenciar", "unmute", "desilenciar"]
handler.tags = ["grupo"]
handler.command = /^(mute|silenciar|unmute|desilenciar)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
