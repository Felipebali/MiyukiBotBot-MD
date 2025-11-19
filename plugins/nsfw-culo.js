import fetch from 'node-fetch'

const owners = ['59896026646@s.whatsapp.net', '59898719147@s.whatsapp.net'] // Owners

let handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {}

  // Verificar si NSFW está activado
  if (m.isGroup && !chat.nsfw) {
    if (owners.includes(m.sender)) {
      await m.reply('《✦》El contenido *NSFW* está desactivado en este grupo.\n> Puedes activarlo con » *.nsfw on*')
    }
    return
  }

  try {
    // Obtener username del emisor
    const usernameSender = `@${m.sender.split("@")[0]}`

    // Obtiene una imagen aleatoria
    const res = await fetch('https://nekobot.xyz/api/image?type=ass')
    const json = await res.json()

    if (!json || !json.message) throw new Error('No se pudo obtener la imagen')

    const img = json.message
    const text = `🍑 ${usernameSender}, disfruta tu ración de... arte digital 🙈`

    // Enviar la imagen con botón
    await conn.sendMessage(m.chat, {
      image: { url: img },
      caption: text,
      buttons: [
        {
          buttonId: '.culo',
          buttonText: { displayText: '😏 Siguiente' },
          type: 1
        }
      ],
      headerType: 4,
      mentions: [m.sender]
    }, { quoted: m })

    await m.react('🍑') // Reacción al mensaje

  } catch (e) {
    console.error(e)
    await m.reply('❌ Error al obtener la imagen, revisa tu conexión o la API.')
  }
}

handler.help = ['culo']
handler.tags = ['nsfw']
handler.command = ['culo']
handler.group = true

export default handler
