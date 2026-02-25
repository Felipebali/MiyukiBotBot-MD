// 📂 plugins/gpu.js
// 🖼️ Obtener foto de perfil — SOLO OWNERS reales del bot

let handler = async (m, { conn, args }) => {
  try {
    // 🔐 Verificación REAL de dueños desde config.js
    const owners = (global.owner || []).map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string') return null
      return v.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }).filter(Boolean)

    const sender = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    if (!owners.includes(sender))
      return m.reply('🚫 Solo los dueños del bot pueden usar este comando.')

    // 🧩 Determinar objetivo
    let target = null

    // 1️⃣ Mención
    if (m.mentionedJid?.length) {
      target = m.mentionedJid[0]
    }

    // 2️⃣ Mensaje citado
    else if (m.quoted?.sender) {
      target = m.quoted.sender
    }

    // 3️⃣ Número como argumento
    else if (args[0]) {
      const num = args[0].replace(/[^0-9]/g, '')
      if (num.length < 8)
        return m.reply('❌ Número no válido. Usa: .gpu 5989xxxxxxx')
      target = `${num}@s.whatsapp.net`
    }

    if (!target)
      return m.reply('❌ Debes mencionar, citar o escribir el número de alguien.')

    const simple = target.split('@')[0]

    // 🖼️ Obtener foto de perfil
    let ppUrl
    try {
      ppUrl = await conn.profilePictureUrl(target, 'image')
    } catch {
      ppUrl = null
    }

    if (!ppUrl)
      return m.reply(`❌ No se pudo obtener la foto de perfil de @${simple}.`, {
        mentions: [target]
      })

    await conn.sendMessage(m.chat, {
      image: { url: ppUrl },
      caption: `📥 Foto de perfil de @${simple}`,
      mentions: [target]
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    m.reply('⚠️ Ocurrió un error al intentar obtener la foto.')
  }
}

handler.command = ['gpu']
handler.tags = ['owner', 'tools']
handler.help = ['gpu @usuario | número | (responder mensaje)']

// 🔓 Desactivar filtros del core
handler.owner = false
handler.admin = false
handler.botAdmin = false
handler.private = false
handler.fail = null

export default handler
