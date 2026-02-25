import axios from "axios"
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, text }) => {
try {
if (!text)
return conn.sendMessage(m.chat, {
text: "❌ Usá así:\n\n.ttp Hola mundo"
}, { quoted: m })

if (text.length > 80)  
  return conn.sendMessage(m.chat, {  
    text: "❌ Máximo 80 caracteres."  
  }, { quoted: m })  

// 🧠 Generador de imagen estable  
const url = `https://dummyimage.com/600x400/000/fff.png&text=${encodeURIComponent(text)}`  

// Descargar imagen  
const res = await axios.get(url, { responseType: "arraybuffer" })  
const imgBuffer = Buffer.from(res.data)  

// 🎨 Convertir a sticker  
const stiker = await sticker(imgBuffer, false, global.packname, global.author)  

// 📨 Enviar sticker  
await conn.sendFile(  
  m.chat,  
  stiker,  
  'ttp.webp',  
  '',  
  m,  
  true  
)

} catch (e) {
console.error("❌ TTP STICKER ERROR:", e)
return conn.sendMessage(m.chat, {
text: "⚠️ Error al generar el sticker."
}, { quoted: m })
}
}

handler.command = ['ttp']
handler.help = ['ttp <texto>']
handler.tags = ['sticker']

export default handler
