let handler = async (m, { conn }) => {
  let who = m.sender
  let targetJid = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0])

  let senderName = '@' + who.split('@')[0]
  let targetName = targetJid ? '@' + targetJid.split('@')[0] : null

  // Mensajes picantes 🔞🔥
  const mensajes = [
    `💋 ${senderName} besó apasionadamente a ${targetName} 😏🔥`,
    `💋 ${senderName} no pudo resistirse y le dio un beso travieso a ${targetName} 😳🔥`,
    `💋 ${senderName} se acercó y dejó un beso ardiente en ${targetName} 😘🔥`,
    `💋 ${senderName} se dio un beso a sí mismo de manera muy traviesa 😏🔥`,
    `💋 ${senderName} le robó un beso intenso a ${targetName} 🔥😈`
  ]

  // Elegir mensaje adecuado
  let textMessage
  if (!targetJid || targetJid === who) {
    textMessage = mensajes[3] // beso a sí mismo
  } else {
    textMessage = mensajes[Math.floor(Math.random() * 4)] // beso a otro
  }

  // Menciones
  let mentions = targetJid ? [who, targetJid] : [who]

  // Enviar mensaje
  await conn.sendMessage(m.chat, { text: textMessage, mentions })
}

handler.command = ['kiss', 'beso', 'besar']
handler.help = ['kiss @usuario']
handler.tags = ['fun', 'nsfw']

export default handler
