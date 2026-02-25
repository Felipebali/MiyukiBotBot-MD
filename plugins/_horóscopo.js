import axios from "axios"

let handler = async (m, { conn, text }) => {

  const caption = `🌌 *HORÓSCOPO DIARIO* 🌌

📌 *Escribí tu signo:*

♈ aries        ♉ tauro
♊ geminis     ♋ cancer
♌ leo          ♍ virgo
♎ libra        ♏ escorpio
♐ sagitario   ♑ capricornio
♒ acuario     ♓ piscis

📝 *Ejemplo:*  
.horoscopo aries`

  if (!text)
    return conn.sendMessage(m.chat, { text: caption }, { quoted: m })

  const signos = [
    "aries", "tauro", "geminis", "cancer", "leo", "virgo",
    "libra", "escorpio", "sagitario", "capricornio", "acuario", "piscis"
  ]

  let sign = text.toLowerCase().trim()
  if (!signos.includes(sign))
    return conn.sendMessage(m.chat, { text: "❌ *Signo inválido.*" }, { quoted: m })

  if (sign === "escorpio") sign = "escorpion"

  try {
    const res = await axios.get(`https://www.horoscopo.com/horoscopos/general-diaria-${sign}`)
    const html = res.data

    const start = html.indexOf("<p>") + 3
    const end = html.indexOf("</p>", start)
    const content = html.substring(start, end)

    let [fecha, mensaje] = content.split("-")

    const emojis = {
      aries: "♈", tauro: "♉", geminis: "♊", cancer: "♋",
      leo: "♌", virgo: "♍", libra: "♎", escorpio: "♏",
      sagitario: "♐", capricornio: "♑", acuario: "♒", piscis: "♓"
    }

    const emoji = emojis[text.toLowerCase()]

    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })

    const textoFinal = `
╭━━━〔 ${emoji} *${text.toUpperCase()}* ${emoji} 〕━━━╮
┃ 📅 *Fecha:* ${fecha.trim()}
╰━━━━━━━━━━━━━━━━━━━━╯

🔮 *HORÓSCOPO GENERAL*
${mensaje.trim()}

✨ *Que los astros te acompañen*
🐾 *FelixCat Bot*
`

    const msg = await conn.sendMessage(
      m.chat,
      { text: textoFinal },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: "🌠", key: msg.key } })

  } catch (e) {
    console.error(e)
    return conn.sendMessage(
      m.chat,
      { text: "⚠️ *No se pudo obtener el horóscopo. Intentá más tarde.*" },
      { quoted: m }
    )
  }
}

handler.command = /^(horoscopo|horóscopo)$/i
handler.botAdmin = false

export default handler
