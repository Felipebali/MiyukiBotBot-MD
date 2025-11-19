import fetch from 'node-fetch'
import FormData from 'form-data'

const handler = async (m, { conn, usedPrefix }) => {
// Detectar imagen en mensaje directo o en respuesta
let q = m.quoted || m
let mime = (q.msg || q).mimetype || q.mediaType || ''

// Intentar detectar imageMessage directamente  
if (!mime && m.message?.imageMessage) {  
    q = m  
    mime = 'image/jpeg'  
}  

if (!mime || !/image\/(jpe?g|png)/.test(mime)) {  
    return conn.reply(m.chat, '❀ Por favor, responde a una imagen o envía una imagen con el comando.', m)  
}  

const buffer = await q.download?.() || (q.message?.imageMessage ? await conn.downloadMediaMessage(q) : null)  
if (!buffer || buffer.length < 1000) return conn.reply(m.chat, '⚠︎ Imagen no válida.', m)  

await m.react('🕒')  

try {  
    const url = await uploadToUguu(buffer)  
    await conn.sendFile(m.chat, buffer, 'imagen.jpg', `❀ Imagen subida y lista para usar.\n» URL: ${url}`, m)  
    await m.react('✔️')  
} catch (e) {  
    await m.react('✖️')  
    await conn.reply(m.chat, `⚠︎ No se pudo procesar la imagen\n> Usa ${usedPrefix}report para informarlo\n\n• Error: ${e.message}`, m)  
}  

}

handler.command = ['hd', 'remini', 'enhance']
handler.help = ['hd']
handler.tags = ['tools']

export default handler

async function uploadToUguu(buffer) {
const body = new FormData()
body.append('files[]', buffer, 'image.jpg')
const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body, headers: body.getHeaders() })
const text = await res.text()
try {
const json = JSON.parse(text)
const url = json.files?.[0]?.url
if (!url || !url.startsWith('https://')) throw new Error("Respuesta inválida de Uguu.\n> ${text}")
return url.trim()
} catch (e) {
throw new Error("Falló al parsear respuesta de Uguu.\n> ${text}")
}
}
