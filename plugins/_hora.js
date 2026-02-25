// 📂 plugins/hora.js

const cooldowns = new Map()

const ZONAS = {
  uruguay: 'America/Montevideo',
  montevideo: 'America/Montevideo',

  argentina: 'America/Argentina/Buenos_Aires',
  buenosaires: 'America/Argentina/Buenos_Aires',

  chile: 'America/Santiago',
  santiago: 'America/Santiago',

  brasil: 'America/Sao_Paulo',
  saopaulo: 'America/Sao_Paulo',

  mexico: 'America/Mexico_City',
  mexicocity: 'America/Mexico_City',

  españa: 'Europe/Madrid',
  madrid: 'Europe/Madrid'
}

let handler = async (m, { conn, text }) => {
  try {
    const userId = m.sender
    const now = Date.now()
    const cooldownTime = 3 * 60 * 60 * 1000

    if (cooldowns.has(userId)) {
      const diff = now - cooldowns.get(userId)
      if (diff < cooldownTime) {
        const r = cooldownTime - diff
        return conn.reply(
          m.chat,
          `🕒 Esperá ${Math.ceil(r / 60000)} minutos para volver a usarlo.`,
          m
        )
      }
    }

    cooldowns.set(userId, now)
    await m.react('🕒')

    // 🧠 Normalización inteligente
    let input = (text || 'uruguay')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)

    // 🔍 Detectar zona por palabra
    let zona = 'America/Montevideo'
    for (const word of input) {
      if (ZONAS[word]) {
        zona = ZONAS[word]
        break
      }
    }

    const ahora = new Date()

    const fecha = new Intl.DateTimeFormat('es-UY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: zona
    }).format(ahora)

    const hora = new Intl.DateTimeFormat('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: zona
    }).format(ahora)

    const horaNum = Number(hora.split(':')[0])
    let emoji = '🌙'
    if (horaNum >= 6 && horaNum < 12) emoji = '🌅'
    else if (horaNum >= 12 && horaNum < 19) emoji = '🌞'
    else if (horaNum >= 19 && horaNum < 23) emoji = '🌆'

    const msg = `
${emoji} *Hora actual*

⏰ *${hora}*
📅 *${fecha.charAt(0).toUpperCase() + fecha.slice(1)}*
🗺️ Zona: *${zona}*
    `.trim()

    await conn.reply(m.chat, msg, m)
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('⚠️')
    await conn.reply(m.chat, '⚠️ Error al obtener la hora.', m)
  }
}

handler.help = ['hora <ciudad/país>']
handler.tags = ['utilidad']
handler.command = ['hora', 'time', 'tiempo']
export default handler
