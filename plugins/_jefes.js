// 📂 plugins/admins.js
// Muestra dueños, admins y usuarios especiales
// ROOT OWNERS reales + ADMINS del grupo

let handler = async (m, { conn, isBotAdmin, groupMetadata, isAdmin }) => {
  try {
    if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.')
    if (!isBotAdmin) return m.reply('❗ Necesito ser admin para ejecutar este comando.')

    // 🔐 ROOT OWNERS reales desde config.js (blindado)
    const owners = (global.owner || []).map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string' && typeof v !== 'number') return null
      return String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }).filter(Boolean)

    const sender = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender

    // ❌ solo owners o admins
    if (!owners.includes(sender) && !isAdmin) {
      return m.reply('🚫 Solo los administradores o los dueños pueden usar este comando.')
    }

    const participants = groupMetadata.participants
      .map(p => ({
        id: conn.decodeJid ? conn.decodeJid(p.id) : p.id,
        admin: p.admin
      }))
      .filter(p => p.id && p.id !== conn.user.jid)

    // 🧠 separar roles
    const ownersInGroup = participants.filter(p => owners.includes(p.id))
    const admins = participants.filter(p => p.admin && !owners.includes(p.id))

    // ✨ títulos de owners
    const ownerTitles = {
      [owners[0]]: 'Dueño Principal 👑',
      [owners[1]]: 'Creador Asociado 👑'
    }

    let texto = `👥 *Administración del Grupo*\n\n`

    if (ownersInGroup.length) {
      texto += `👑 *Dueños del Bot:*\n`
      texto += ownersInGroup
        .map(o => `${ownerTitles[o.id] || 'Dueño'} @${o.id.split('@')[0]}`)
        .join('\n')
      texto += `\n\n`
    }

    texto += `🛡️ *Administradores:*\n`
    texto += admins.length
      ? admins.map(a => `• @${a.id.split('@')[0]}`).join('\n')
      : 'Ninguno'
    texto += `\n\n`

    texto += `✅ *Comando ejecutado por:* @${sender.split('@')[0]}`

    const mentions = [
      sender,
      ...ownersInGroup.map(o => o.id),
      ...admins.map(a => a.id)
    ]

    await conn.sendMessage(
      m.chat,
      { text: texto, mentions },
      { quoted: m }
    )

  } catch (e) {
    console.error('Error en admins:', e)
  }
}

handler.command = ['admins']
handler.group = true
handler.tags = ['group']
handler.help = ['admins']

export default handler
