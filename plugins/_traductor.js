import fetch from 'node-fetch'

const idiomas = {
  es: 'Español 🇪🇸',
  en: 'Inglés 🇬🇧',
  pt: 'Portugués 🇧🇷',
  fr: 'Francés 🇫🇷',
  it: 'Italiano 🇮🇹',
  de: 'Alemán 🇩🇪',
  ja: 'Japonés 🇯🇵',
  ru: 'Ruso 🇷🇺',
  ko: 'Coreano 🇰🇷',
  zh: 'Chino 🇨🇳',
  ar: 'Árabe 🇸🇦',
  pl: 'Polaco 🇵🇱'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {

  await conn.sendMessage(m.chat, { react: { text: '🌐', key: m.key } })

  let citado = m.quoted?.text ? m.quoted.text.trim() : null

  if (!text && !citado) {
    return m.reply(
`🌍 *TRADUCTOR UNIVERSAL*

📌 *Uso:*
• ${usedPrefix + command} <idioma> <texto>
• Responder mensaje con ${usedPrefix + command} <idioma>

📘 *Ejemplos:*
> ${usedPrefix + command} en Hola amigo
> ${usedPrefix + command} pl Buenos días
> (responder) ${usedPrefix + command} en

🌐 *Idiomas disponibles:*
${Object.entries(idiomas).map(([k, v]) => `• ${k} = ${v}`).join('\n')}
`)
  }

  const partes = text ? text.trim().split(/\s+/) : []
  let lang = partes[0]?.toLowerCase() || 'es'
  let texto = partes.slice(1).join(' ') || citado

  // Si idioma no existe → asumir texto
  if (!idiomas[lang]) {
    texto = text || citado
    lang = 'es'
  }

  if (!texto) return m.reply('✏️ Escribí algo para traducir.')

  try {

    const apiUrl =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(texto)}`

    const res = await fetch(apiUrl)
    const data = await res.json()

    if (!data || !data[0]) throw 'Sin respuesta'

    const traduccion = data[0].map(v => v[0]).join('')
    const idiomaDetectado = data[2] || 'auto'

    const resultado =
`🌐 *Traducción completada*

🔤 *Idioma destino:* ${idiomas[lang] || lang.toUpperCase()}
🗣️ *Detectado:* ${idiomaDetectado.toUpperCase()}

📥 *Texto original:*
${texto}

📤 *Traducción:*
${traduccion}
`.trim()

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    await m.reply(resultado)

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    await m.reply('⚠️ Error al traducir. Intentá nuevamente.')
  }
}

handler.help = ['traducir <idioma> <texto>']
handler.tags = ['utilidades']
handler.command = /^(traducir|translate|trad)$/i

export default handler
