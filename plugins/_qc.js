import { sticker } from "../lib/sticker.js"
import axios from "axios"

let handler = async (m, { conn, text }) => {
  try {
    // ✅ Texto desde comando o citado
    let frase = text
    if (!frase && m.quoted?.text) frase = m.quoted.text

    if (!frase)
      return conn.sendMessage(m.chat, {
        text: "❌ Escribí un texto o citá un mensaje para crear el sticker."
      }, { quoted: m })

    if (frase.length > 50)
      return conn.sendMessage(m.chat, {
        text: "❌ El texto no puede superar los 50 caracteres."
      }, { quoted: m })

    // ✅ Usuario correcto (citado o autor)
    const userJid = m.quoted?.sender || m.sender
    const nombre = m.quoted?.name || m.name || "Usuario"

    // ✅ PROTECCIÓN TOTAL DE FOTO
    let pp = "https://i.ibb.co/dyk5QdQ/1212121212121212.png"
    try {
      const url = await conn.profilePictureUrl(userJid, "image")
      if (typeof url === "string") pp = url
    } catch {}

    // ✅ OBJETO SEGURO PARA LA API
    const obj = {
      type: "quote",
      format: "png",
      backgroundColor: "#000000",
      width: 512,
      height: 768,
      scale: 2,
      messages: [{
        entities: [],
        avatar: true,
        from: {
          id: 1,
          name: nombre,
          photo: { url: pp }
        },
        text: frase,
        replyMessage: {}
      }]
    }

    // ✅ REQUEST CON TIMEOUT
    const json = await axios.post(
      "https://bot.lyo.su/quote/generate",
      obj,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000
      }
    )

    if (!json?.data?.result?.image)
      throw "API no devolvió imagen"

    const buffer = Buffer.from(json.data.result.image, "base64")
    const stiker = await sticker(buffer, false)

    return conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })

  } catch (e) {
    console.error("QC ERROR:", e)
    return conn.sendMessage(m.chat, {
      text: "⚠️ El generador de stickers está temporalmente caído.\nProbá de nuevo en unos minutos."
    }, { quoted: m })
  }
}

// ✅ COMANDO PÚBLICO
handler.command = ["qc"]
handler.botAdmin = false

export default handler
