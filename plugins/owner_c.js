// plugins/tagallC.js
// Activador: letra "C" o "c" (sin prefijo)
// SOLO ROOT OWNERS reales
// Mención visible a un usuario al azar + mención oculta al resto
// NO repite la última frase en el grupo

const lastMessage = {}

let handler = async (m, { conn, groupMetadata }) => {
  try {
    if (!m.isGroup) return

    // 🔐 ROOT OWNERS reales desde config.js (blindado)
    const owners = (global.owner || []).map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string' && typeof v !== 'number') return null
      return String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }).filter(Boolean)

    const sender = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    if (!owners.includes(sender)) return

    const texto = (m.text || '').trim().toLowerCase()
    if (texto !== 'c') return

    const participantes = (groupMetadata?.participants || [])
      .map(p => (conn.decodeJid ? conn.decodeJid(p.id) : p.id))
      .filter(Boolean)

    if (participantes.length < 2) return

    const usuarioAzar = participantes[Math.floor(Math.random() * participantes.length)]
    const mencionesOcultas = participantes.filter(u => u !== usuarioAzar)
    const user = `@${usuarioAzar.split('@')[0]}`

    const frases = [
      `🤡 Este es re gil ${user}`,
      `🥖 Confirmado: ${user} es pancho`,
      `😂 ${user} tiene cara de que se ríe solo`,
      `🐒 ${user} vino sin cerebro hoy`,
      `💀 ${user} quedó regaladísimo`,
      `🚨 Atención grupo: ${user} acaba de mandarse cualquiera`,
      `📉 El coeficiente intelectual de ${user} bajó solo`,
      `🤦 ${user} pensó… pero muy poquito`,
      `🐂 Se rumorea fuerte que ${user} es cornudo`,
      `🐮 Dicen por ahí que ${user} es cornuda`,
      `🦌 ${user} podría trabajar de reno en Navidad`,
      `😂 ${user} no es tóxico… es cornudo consciente`,
      `👀 ${user} mirando el techo mientras le meten los cuernos`,
      `🚩 ${user} viene con cuernos incluidos`,
      `📢 Último momento: ${user} confirmado como cornudo/a`,
      `💔 ${user} confió… y pasó lo que pasó`,
      `🧠 ${user} tiene el cerebro en modo ahorro de energía`,
      `📴 ${user} está pensando… cargando… 0%`,
      `🪫 ${user} se quedó sin neuronas`,
      `🫠 ${user} procesa ideas en 2G`,
      `🤖 ${user} es NPC confirmado`,
      `🐀 ${user} corre y se tropieza solo`,
      `🥴 ${user} es la prueba de que Dios tiene sentido del humor`,
      `🎪 ${user} vino directo del circo`,
      `📦 ${user} vino vacío por dentro`,
      `🧃 ${user} toma jugo y se atraganta`,
      `🤏 ${user} le pone poca sal hasta al agua`,
      `📺 ${user} aplaude cuando termina una película`,
      `😬 ${user} quedó más expuesto que infidelidad en grupo`,
      `🫣 ${user} pensó que hoy no le tocaba`,
      `⚰️ RIP dignidad de ${user}`,
      `🎯 El sistema eligió a ${user} para descansar`,
      `🔥 ${user} activó el modo descanso eterno`,
      `😈 Hoy el sacrificio fue ${user}`,
    ]

    let mensaje
    let intentos = 0
    do {
      mensaje = frases[Math.floor(Math.random() * frases.length)]
      intentos++
    } while (mensaje === lastMessage[m.chat] && intentos < 10)

    lastMessage[m.chat] = mensaje

    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [usuarioAzar, ...mencionesOcultas]
    })

  } catch (e) {
    console.error('Error en tagallC:', e)
  }
}

handler.customPrefix = /^c$/i
handler.command = new RegExp()
handler.group = true

export default handler
