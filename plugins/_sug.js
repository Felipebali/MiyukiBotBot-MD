// 📦 FelixCat_Bot — Comando .sug (sugerencias con cooldown de 24h)
const cooldown = {} // Objeto para registrar cuándo cada usuario envió su última sugerencia
const SUG_GROUP = "120363422768748953@g.us" // ID del grupo donde llegan las sugerencias

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = m.sender
  const now = Date.now()
  const cooldownTime = 24 * 60 * 60 * 1000 // 24 horas

  // 🕒 Verificar si el usuario aún está en cooldown
  if (cooldown[user] && now - cooldown[user] < cooldownTime) {
    const timeLeft = cooldownTime - (now - cooldown[user])
    const hours = Math.floor(timeLeft / 3600000)
    const minutes = Math.floor((timeLeft % 3600000) / 60000)
    return m.reply(`⏳ Ya enviaste una sugerencia recientemente.\nPodrás enviar otra en ${hours}h ${minutes}m.`)
  }

  // 📝 Si no hay texto
  if (!text)
    return m.reply(`🍂 *Uso correcto:*\n\n✦ \`${usedPrefix + command}\` <tu sugerencia>\n\n💡 Ejemplo:\n${usedPrefix + command} estaría bueno que agreguen un comando de memes`)

  // 📩 Enviar sugerencia al grupo
  try {
    await conn.sendMessage(SUG_GROUP, {
      text: `💡 *Nueva sugerencia recibida:*\n\n👤 De: @${user.split('@')[0]}\n📜 Sugerencia:\n${text}`,
      mentions: [user]
    })
    m.reply("✅ ¡Gracias! Tu sugerencia fue enviada correctamente al grupo de revisión.")
    cooldown[user] = now // Guardar timestamp del último uso
  } catch (err) {
    console.error(err)
    m.reply("⚠️ Ocurrió un error al enviar tu sugerencia. Intenta más tarde.")
  }
}

handler.help = ["sug <texto>"]
handler.tags = ["info"]
handler.command = /^sug$/i

export default handler 
