// plugins/grupo-configuracion.js — Panel limpio (EVENTO + Welcome)

const aliasMap = {
  antifake: ["antifake", "antiFake"],
  antispam: ["antispam", "antiSpam"],
  antilink: ["antilink", "antiLink"],
  antilink2: ["antilink2", "antiLink2"],
  antitagall: ["tagallEnabled", "antitagall"],
  evento: ["evento", "detect"],
  onlyadmin: ["onlyadmin", "onlyAdmin", "soloAdmins", "modoadmin"],
  nsfw: ["nsfw"],
  juegos: ["juegos", "games"],
  welcome: ["welcome", "bienvenida"]
}

function getChatValue(chat, key) {
  const keys = aliasMap[key]
  if (!keys) return false
  for (const k of keys) {
    if (chat[k] !== undefined)
      return chat[k] === true || chat[k] === 1 || chat[k] === 'on'
  }
  return false
}

let handler = async (m, { isAdmin, isOwner }) => {
  if (!m.isGroup)
    return m.reply('⚠️ Este comando solo funciona en grupos')
  if (!isAdmin && !isOwner)
    return m.reply('🚫 Solo administradores pueden usar este panel')

  const chat = global.db.data.chats[m.chat] || {}

  const on = '🟢 ACTIVADO'
  const off = '🔴 DESACTIVADO'

  const panel = `
╔══════════════════════╗
║   ⚙️ PANEL DEL GRUPO   ║
╚══════════════════════╝
📌 *Uso:* _.comando_ para activar / desactivar

━━━━━━━━━━━━━━━━━━━━━━
🛡️ *SEGURIDAD*
━━━━━━━━━━━━━━━━━━━━━━
🔗 AntiLink        » ${getChatValue(chat, 'antilink') ? on : off}
🔗 AntiLink 2      » ${getChatValue(chat, 'antilink2') ? on : off}
🚫 AntiFake        » ${getChatValue(chat, 'antifake') ? on : off}
🚫 AntiSpam        » ${getChatValue(chat, 'antispam') ? on : off}
⚡ AntiTagAll      » ${getChatValue(chat, 'antitagall') ? on : off}

━━━━━━━━━━━━━━━━━━━━━━
🛠️ *ADMINISTRACIÓN*
━━━━━━━━━━━━━━━━━━━━━━
🎭 Evento del grupo » ${getChatValue(chat, 'evento') ? on : off}
🛡️ Solo Admins     » ${getChatValue(chat, 'onlyadmin') ? on : off}

━━━━━━━━━━━━━━━━━━━━━━
🎉 *BIENVENIDA*
━━━━━━━━━━━━━━━━━━━━━━
👋 Mensaje Welcome  » ${getChatValue(chat, 'welcome') ? on : off}

━━━━━━━━━━━━━━━━━━━━━━
🎮 *EXTRAS*
━━━━━━━━━━━━━━━━━━━━━━
🎮 Juegos           » ${getChatValue(chat, 'juegos') ? on : off}
🔞 NSFW             » ${getChatValue(chat, 'nsfw') ? on : off}

━━━━━━━━━━━━━━━━━━━━━━
🐾 *FelixCat Bot* • Panel de control
`.trim()

  m.reply(panel)
}

handler.help = ['panel', 'config']
handler.tags = ['group']
handler.command = ['panel', 'config']
handler.group = true

export default handler
