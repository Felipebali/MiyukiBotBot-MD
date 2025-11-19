import { googleImage } from '@bochilteam/scraper'

let handler = async (m, { conn, text }) => {
  if (!text) {
    await conn.sendMessage(m.chat, { text: '⚠️ Ingresa algo para buscar. Ejemplo: *.imagen gatos*' }, { quoted: m })
    return
  }

  try {
    // 🔹 Reacción de inicio
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    const res = await googleImage(text)
    const results = res.slice(0, 20)
    const image = results[Math.floor(Math.random() * results.length)]

    // 🔹 Reacción de búsqueda exitosa
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    await conn.sendFile(m.chat, image, 'imagen.jpg', `🔎 Resultado de: *${text}*`, m)

    // 🔹 Reacción final OK
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    // 🔹 Reacción de error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, { text: '⚠️ No se pudo obtener la imagen. Intenta con otro término.' }, { quoted: m })
  }
}

handler.help = ['imagen <texto>']
handler.tags = ['buscador']
handler.command = ['imagen']

export default handler
