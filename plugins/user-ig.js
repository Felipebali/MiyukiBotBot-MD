const handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      '❌ *Debes escribir un usuario de Instagram.*\n\n📌 *Ejemplo:*\n.ig messi',
      m
    )
  }

  // Quitar @ si lo escribe
  if (text.startsWith('@')) text = text.slice(1)

  await m.react('🤳')

  const image = 'https://telegra.ph/file/1af5d76a06d74180fac0d.jpg'
  const instagramUrl = `https://instagram.com/${text}`

  const str = `
╭━━━〔 🤳 *INSTAGRAM* 〕━━━╮
┃ 👤 *Usuario:* @${text}
┃ 👀 *Solicitado por:* @${m.sender.split('@')[0]}
╰━━━━━━━━━━━━━━━━━━━━━━╯

🔗 *Perfil:*  
${instagramUrl}

✨ *Abrí el enlace para ver el perfil*
`.trim()

  await conn.sendFile(
    m.chat,
    image,
    'instagram.jpg',
    str,
    m,
    false,
    {
      mentions: [
        m.sender
      ]
    }
  )
}

handler.command = ['ig']
handler.group = false
handler.limit = false

export default handler
