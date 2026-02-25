// 📂 plugins/gpo.js
// 📸 Obtener foto del grupo — SOLO OWNERS reales del bot

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup)
      return m.reply('❌ Este comando solo funciona en grupos.')

    // 🔐 Verificación REAL de dueños desde config.js (compatible con todos los formatos)
    const owners = (global.owner || []).map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string') return null
      return v.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }).filter(Boolean)

    const sender = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    if (!owners.includes(sender))
      return m.reply('🚫 Solo los dueños del bot pueden usar este comando.')

    const groupId = m.chat

    // 🖼️ Obtener foto del grupo
    let ppUrl
    try {
      ppUrl = await conn.profilePictureUrl(groupId, 'image')
    } catch {
      ppUrl = null
    }

    if (!ppUrl)
      return m.reply('❌ Este grupo no tiene foto de perfil.')

    await conn.sendMessage(m.chat, {
      image: { url: ppUrl },
      caption: '📸 Foto del grupo'
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    m.reply('⚠️ Ocurrió un error al intentar descargar la foto del grupo.')
  }
}

handler.command = ['gpo']
handler.tags = ['owner', 'tools']
handler.help = ['gpo']
handler.group = true

export default handler
