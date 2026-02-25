let handler = async (m, { conn }) => {
  let who = m.sender
  let targetJid = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0])

  let senderName = '@' + who.split('@')[0]
  let targetName = targetJid ? '@' + targetJid.split('@')[0] : null

  // Mensajes de abrazo 🤗💞
  const mensajes = [
    `🤗 ${senderName} abrazó con mucho cariño a ${targetName} 💞`,
    `🤗 ${senderName} le dio un abrazo fuerte y reconfortante a ${targetName} 🫶`,
    `🤗 ${senderName} rodeó a ${targetName} con un abrazo lleno de ternura ✨`,
    `🤗 ${senderName} se dio un abrazo a sí mismo porque también lo merece 💖`,
    `🤗 ${senderName} sorprendió a ${targetName} con un abrazo inesperado 🥰`
  ]

  let textMessage
  if (!targetJid || targetJid === who) {
    textMessage = mensajes[3] // autoabrazo
  } else {
    const opciones = [0, 1, 2, 4]
    textMessage = mensajes[opciones[Math.floor(Math.random() * opciones.length)]]
  }

  let mentions = targetJid ? [who, targetJid] : [who]

  await conn.sendMessage(m.chat, { text: textMessage, mentions })
}

handler.command = ['abrazar', 'hug']
handler.help = ['abrazar @usuario']
handler.tags = ['fun']

export default handler 
