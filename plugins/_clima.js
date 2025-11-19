// 📂 plugins/clima.js — FelixCat_Bot 🌤️
import fetch from 'node-fetch'

// 🌦️ Diccionario de traducciones al español
const traducciones = {
  "Sunny": "Soleado",
  "Clear": "Despejado",
  "Partly cloudy": "Parcialmente nublado",
  "Cloudy": "Nublado",
  "Overcast": "Cubierto",
  "Mist": "Neblina",
  "Patchy rain possible": "Posibles lluvias aisladas",
  "Patchy snow possible": "Posibles nevadas aisladas",
  "Thundery outbreaks possible": "Posibles tormentas eléctricas",
  "Fog": "Niebla",
  "Light rain": "Lluvia ligera",
  "Moderate rain": "Lluvia moderada",
  "Heavy rain": "Lluvia fuerte",
  "Light snow": "Nieve ligera",
  "Moderate snow": "Nieve moderada",
  "Heavy snow": "Nieve fuerte"
}

// ⏳ Cooldown (3 horas en milisegundos)
const COOLDOWN = 3 * 60 * 60 * 1000
const userCooldowns = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const sender = m.sender

  // 🕓 Verificar cooldown
  const lastUsed = userCooldowns[sender] || 0
  const now = Date.now()
  const remaining = COOLDOWN - (now - lastUsed)

  if (remaining > 0) {
    const horas = Math.floor(remaining / 3600000)
    const minutos = Math.floor((remaining % 3600000) / 60000)
    return conn.reply(
      m.chat,
      `😒 Tranquilo @${sender.split('@')[0]}, ya pediste el clima.\n\n⏳ Podés volver a usarlo en *${horas}h ${minutos}m*.\n\n🫠 No atomices al bot, que se recalienta.`,
      m,
      { mentions: [sender] }
    )
  }

  if (!text)
    return conn.reply(
      m.chat,
      `🌦️ *Uso correcto:*\n\n${usedPrefix + command} <ciudad>\n\n🧭 Ejemplo:\n${usedPrefix + command} Mercedes`,
      m
    )

  try {
    await conn.sendMessage(m.chat, { react: { text: '🌤️', key: m.key } })

    const res = await fetch(`https://wttr.in/${encodeURIComponent(text)}?format=j1`)
    const data = await res.json()

    if (!data || !data.current_condition)
      throw new Error('No se pudieron obtener los datos del clima.')

    const lugar = data.nearest_area?.[0]?.areaName?.[0]?.value || text
    const region = data.nearest_area?.[0]?.region?.[0]?.value || ''
    const pais = data.nearest_area?.[0]?.country?.[0]?.value || ''
    const clima = data.current_condition?.[0]
    const temperatura = clima?.temp_C
    const sensacion = clima?.FeelsLikeC
    let estado = clima?.weatherDesc?.[0]?.value
    const humedad = clima?.humidity
    const viento = clima?.windspeedKmph
    const icono = clima?.weatherIconUrl?.[0]?.value || null

    // 🌈 Traducción al español
    if (estado && traducciones[estado]) estado = traducciones[estado]

    const horaLocal = new Date().toLocaleString('es-UY', {
      timeZone: 'America/Montevideo'
    })

    const info = `
🌍 *Clima actual en ${lugar}, ${region}, ${pais}:*

🕒 Hora local: *${horaLocal}*
🌡️ Temperatura: *${temperatura}°C*
🥵 Sensación térmica: *${sensacion}°C*
🌤️ Estado del cielo: *${estado}*
💧 Humedad: *${humedad}%*
💨 Viento: *${viento} km/h*
    `.trim()

    // Guardar cooldown del usuario
    userCooldowns[sender] = now

    // 💬 Enviar con o sin ícono
    if (icono) {
      await conn.sendMessage(m.chat, { image: { url: icono }, caption: info })
    } else {
      await conn.reply(m.chat, info, m)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    console.error('❌ Error en el comando .clima:', err)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    await conn.reply(
      m.chat,
      '⚠️ No se pudo obtener el clima. Verificá el nombre de la ciudad o intentá nuevamente.',
      m
    )
  }
}

handler.help = ['clima <ciudad>']
handler.tags = ['información']
handler.command = ['clima', 'tiempo']

export default handler
