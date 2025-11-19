// 🔥 Comando adaptado por Anubis para FelixCat-Bot
import fetch from 'node-fetch'

const apkSession = new Map()

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (command === 'apk2' && text) {
    try {
      await m.react('🔍')

      const res = await fetch(`https://delirius-apiofc.vercel.app/download/apk?query=${encodeURIComponent(text)}`)
      const data = await res.json()

      if (!data.status || !data.data) throw new Error('No se encontró la aplicación.')

      const app = data.data
      apkSession.set(m.chat, { app })

      const info = `
╭━━━〔 📲 *Descarga de APKs* 〕━━━⬣
┃ 🍧 *Nombre:* ${app.name}
┃ 🌱 *Desarrollador:* ${app.developer}
┃ 📦 *Paquete:* ${app.id}
┃ ⚙️ *Tamaño:* ${app.size}
┃ ⭐ *Rating:* ${app.stats?.rating?.average || 'N/A'} (${app.stats?.rating?.total || 0} votos)
┃ 📅 *Publicado:* ${app.publish}
┃ 📥 *Descargas:* ${app.stats?.downloads?.toLocaleString() || 'N/A'}
┃ 🏪 *Tienda:* ${app.store?.name || 'Desconocida'}
╰━━━━━━━━━━━━━━━━━━━━⬣
> 🧩 Usa *.apk_download* para bajarla.
`.trim()

      await conn.sendMessage(m.chat, {
        image: { url: app.image },
        caption: info,
        footer: global.dev,
        buttons: [
          {
            buttonId: `${usedPrefix}apk_download`,
            buttonText: { displayText: '💖 ＤＥＳＣＡＲＧＡＲ' },
            type: 1
          }
        ],
        headerType: 4
      }, { quoted: m })

      await m.react('✅')
    } catch (e) {
      console.error(e)
      await m.react('❌')
      await conn.sendMessage(m.chat, { text: `❌ Ocurrió un error: ${e.message || 'Error desconocido'}` }, { quoted: m })
    }
    return
  }

  if (command === 'apk_download') {
    const session = apkSession.get(m.chat)
    if (!session) {
      return conn.sendMessage(m.chat, {
        text: `❗ No hay una búsqueda activa.\n> Usa: ${usedPrefix}apk2 <nombre de la app>`
      }, { quoted: m })
    }

    const { app } = session
    try {
      await m.react('⌛')

      const caption = `
╭━━━〔 ✅ *Descarga Completa* 〕━━━⬣
┃ 💔 *${app.name}*
┃ 👤 *Desarrollador:* ${app.developer}
┃ ⚙️ *Tamaño:* ${app.size}
┃ 📦 *Paquete:* ${app.id}
┃ 🍂 *Publicado:* ${app.publish}
╰━━━━━━━━━━━━━━━━━━━━⬣
`.trim()

      await conn.sendMessage(m.chat, {
        document: { url: app.download },
        fileName: `${app.name}.apk`,
        mimetype: 'application/vnd.android.package-archive',
        caption,
        contextInfo: {
          externalAdReply: {
            title: app.name,
            body: global.packname,
            sourceUrl: app.store?.avatar || null,
            thumbnailUrl: app.image,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })

      await m.react('☑️')
    } catch (err) {
      console.error('Error en descarga:', err)
      await m.react('❌')
      await conn.sendMessage(m.chat, { text: '❌ No se pudo descargar el archivo.' }, { quoted: m })
    }
    return
  }

  if (command === 'apk2' && !text) {
    return conn.sendMessage(m.chat, {
      text: `❗ Ingresa el nombre de una aplicación.\n\n💚 Ejemplo:\n${usedPrefix}apk2 WhatsApp`
    }, { quoted: m })
  }
}

handler.help = ['apk2', 'apk_download']
handler.tags = ['descargas']
handler.command = ['apk2', 'apk_download']

export default handler
