import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, `🎋 Por favor, proporciona el nombre de una canción o artista.\nEjemplo: ${usedPrefix}spotify <canción>`, m)

  try {
    // Buscamos en la API principal
    let searchUrl = `https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`
    let searchRes = await axios.get(searchUrl, { timeout: 15000 })
    let searchData = searchRes.data

    if (!searchData.status || !searchData.data || searchData.data.length === 0) {
      throw new Error('No se encontró resultado.')
    }

    let data = searchData.data[0]
    let { title, artist, url: spotifyUrl, image } = data

    // Función para obtener JSON seguro
    const tryFetchJson = async (url) => {
      try {
        let res = await fetch(url, { timeout: 20000 })
        let text = await res.text()
        try {
          return JSON.parse(text)
        } catch {
          return null
        }
      } catch {
        return null
      }
    }

    // Intentamos descargar desde varias APIs
    let downloadUrl = null

    const apis = [
      `https://api.nekolabs.my.id/downloader/spotify/v1?url=${encodeURIComponent(spotifyUrl)}`,
      `https://api.sylphy.xyz/download/spotify?url=${encodeURIComponent(spotifyUrl)}&apikey=sylphy-c519`,
      `https://api.neoxr.eu/api/spotify?url=${encodeURIComponent(spotifyUrl)}&apikey=russellxz`
    ]

    for (let api of apis) {
      let res
      if (api.includes('neoxr')) res = await tryFetchJson(api)
      else res = await axios.get(api, { timeout: 20000 }).then(r => r.data).catch(()=>null)
      
      if (res?.result?.downloadUrl) { downloadUrl = res.result.downloadUrl; break }
      if (res?.data?.dl_url) { downloadUrl = res.data.dl_url; break }
      if (res?.data?.url) { downloadUrl = res.data.url; break }
    }

    if (!downloadUrl) return conn.reply(m.chat, `❌ No se encontró un link de descarga válido para esta canción.`, m)

    // Descargar audio
    let audio = await fetch(downloadUrl)
    let buffer = await audio.buffer()

    // Enviar solo audio con miniatura
    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: artist,
          thumbnailUrl: image,
          sourceUrl: spotifyUrl,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `❌ Error al buscar o descargar la canción.`, m)
  }
}

handler.help = ["spotify"]
handler.tags = ["download"]
handler.command = ["spotify","splay"]
handler.group = true

export default handler
