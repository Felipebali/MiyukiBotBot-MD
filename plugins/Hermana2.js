let handler = async (m, { conn, isOwner }) => {
  const hermanaID = '59892975182@s.whatsapp.net' // Número completo de Melissa
  const hermanaNombre = 'Melissa' // Nombre que se mostrará en las frases

  // Permitir solo a ella o a owners
  if (m.sender.split('@')[0] !== hermanaID.split('@')[0] && !isOwner) {
    return conn.reply(m.chat, '❌ Este comando es privado y solo puede usarlo mi hermana 💞', m)
  }

  // Frases dedicadas a una hermana
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

  // Enviar el mensaje sin citar y mencionando a Melissa
  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: [hermanaID]
  })
}
handler.customPrefix = /^hermana$/i
handler.tags = ['frases']
handler.help = ['hermana2']
export default handler
