// plugins/tagallT.js
// Activador: letra "T" o "t" (sin prefijo)
// SOLO ROOT OWNERS reales pueden activarlo
// Mención visible a un usuario al azar + mención oculta al resto

let handler = async (m, { conn, groupMetadata }) => {
  try {
    if (!m.isGroup) return

    // 🔐 Verificación REAL de dueños (100% blindada)
    const owners = (global.owner || []).map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string' && typeof v !== 'number') return null
      return String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }).filter(Boolean)

    const sender = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    if (!owners.includes(sender)) return

    const texto = (m.text || '').trim()
    if (!/^t$/i.test(texto)) return

    const participantes = (groupMetadata?.participants || [])
      .map(p => (conn.decodeJid ? conn.decodeJid(p.id) : p.id))
      .filter(Boolean)

    if (participantes.length < 2) return

    const usuarioAzar = participantes[Math.floor(Math.random() * participantes.length)]
    const mencionesOcultas = participantes.filter(u => u !== usuarioAzar)

    const frases = [
      `📢 Parece que @${usuarioAzar.split('@')[0]} quiso asegurarse de que nadie se quede dormido 😴`,
      `👀 @${usuarioAzar.split('@')[0]} tocó la letra mágica... y ahora todos fueron notificados 💬`,
      `💡 @${usuarioAzar.split('@')[0]} pensó que sería buena idea avisar a todos 😅`,
      `⚡ @${usuarioAzar.split('@')[0]} activó el modo “presente o expulsado” 😆`,
      `🔥 @${usuarioAzar.split('@')[0]} encendió el grupo con una sola letra 😎`,
      `😂 Todo indica que @${usuarioAzar.split('@')[0]} tenía ganas de charlar con todos 📲`,
    ]

    const mensaje = frases[Math.floor(Math.random() * frases.length)]

    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [usuarioAzar, ...mencionesOcultas]
    })

  } catch (e) {
    console.error('Error en tagallT:', e)
  }
}

// Detecta "T" o "t" sin prefijo
handler.customPrefix = /^\s*t\s*$/i
handler.command = new RegExp()
handler.group = true

export default handler
