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
  ar: 'Árabe 🇸🇦'
}

// 🎯 Comando principal: traducir
let handler = async (m, { conn, text, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: '🌐', key: m.key } })

  // Si responde a un mensaje, toma ese texto
  let citado = m.quoted?.text ? m.quoted.text.trim() : null

  if (!text && !citado)
    return m.reply(
      `🌍 *Uso correcto:*\n\n` +
      `✦ \`${usedPrefix + command}\` <idioma> <texto>\n` +
      `✦ o respondé a un mensaje con \`${usedPrefix + command} <idioma>\`\n\n` +
      `📘 *Ejemplos:*\n> ${usedPrefix + command} en Hola, ¿cómo estás?\n> ${usedPrefix + command} it Buenos días\n> (Responder un mensaje con) ${usedPrefix + command} en\n\n` +
      `🌐 *Idiomas disponibles:*\n${Object.entries(idiomas).map(([k, v]) => `• ${k} = ${v}`).join('\n')}`
    )

  const partes = text ? text.trim().split(/\s+/) : []
  let lang = partes[0]?.toLowerCase() || 'es'
  let texto = partes.slice(1).join(' ') || citado

  if (!idiomas[lang]) {
    texto = [lang, ...partes.slice(1)].join(' ') || citado
    lang = 'es'
  }

  if (!texto) return m.reply('✏️ Escribí el texto que querés traducir o respondé a uno.')

  try {
    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(texto)}`
    const res = await fetch(apiUrl)
    const data = await res.json()

    const traduccion = data[0].map(t => t[0]).join('')
    const idiomaDetectado = data[2] || 'desconocido'

    const resultado = `
🌐 *Traducción al ${idiomas[lang] || lang.toUpperCase()}*

🗣️ *Texto original (${idiomaDetectado.toUpperCase()}):*
${texto}

💬 *Traducción:*
${traduccion}
`.trim()

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    await m.reply(resultado)

  } catch (err) {
    console.error('❌ Error al traducir:', err)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    await m.reply('⚠️ Ocurrió un error al traducir. Probá de nuevo más tarde.')
  }
}

handler.help = ['traducir <idioma> <texto>']
handler.tags = ['utilidades']
handler.command = /^traducir|translate|trad$/i

export default handler
