let handler = async (m, { conn, isOwner }) => {
  const hermanaID = "59892975182@s.whatsapp.net"
  const hermanaNombre = "Melissa"

  // Permitir solo a la hermana o owners
  if (m.sender !== hermanaID && !isOwner) {
    return conn.reply(m.chat, '❌ Este comando es privado y solo puede usarlo mi hermana 💞', m)
  }

  let mensajes = [
    `Ser tu hermano/a es uno de los mayores regalos que me dio la vida, ${hermanaNombre} 💞.`,
    `Gracias por existir y ser parte de mi historia, ${hermanaNombre} hermosa ✨.`,
    `No importa lo que pase, siempre estaré para vos, ${hermanaNombre}, porque sos mi familia y mi corazón 🤍.`,
    `${hermanaNombre}, tu luz hace más brillante cada momento de mi vida 🌟.`,
    `Dios me bendijo con muchas cosas, pero tenerte como hermana, ${hermanaNombre}, fue la más grande de todas 🙏💗.`,
    `${hermanaNombre}, gracias por tu amor, tu apoyo y por ser única en este mundo 💖.`,
    `Sos mi persona favorita en esta vida, y no importa lo que pase, siempre te voy a cuidar, ${hermanaNombre} 💫.`,
    `Tu corazón es tan hermoso que hace que todo a tu alrededor sea mejor, ${hermanaNombre} 💜.`,
    `Sos más que una hermana, sos mi amiga, mi cómplice y mi hogar, ${hermanaNombre} 🏡💞.`,
    `Si la vida fuera un viaje, vos serías mi destino favorito, ${hermanaNombre} 🚀❤️.`
  ]

  let texto = mensajes[Math.floor(Math.random() * mensajes.length)]

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: [hermanaID]
  })
}

// Activador sin prefijo
handler.customPrefix = /^hermana$/i
handler.command = new RegExp // <- HACE QUE FUNCIONE SIN PREFIJO
handler.tags = ['frases']
handler.help = ['hermana']

export default handler
