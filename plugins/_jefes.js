// 📂 plugins/admins.js
// Lista dueños del bot + admins del grupo + aviso opcional

let handler = async (m, { conn, groupMetadata, isBotAdmin, isAdmin, text }) => {
  try {
    if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.')
    if (!isBotAdmin) return m.reply('❗ Necesito ser admin para ejecutar este comando.')

    // 🔐 obtener owners reales desde config.js
    const owners = (global.owner || [])
      .map(v => {
        if (Array.isArray(v)) v = v[0]
        if (!v) return null
        return String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net'
      })
      .filter(Boolean)

    const sender = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender

    // ❌ solo owners o admins pueden usar
    if (!owners.includes(sender) && !isAdmin) {
      return m.reply('🚫 Solo los administradores o dueños del bot pueden usar este comando.')
    }

    const botJid = conn.user?.id || conn.user?.jid

    // 👥 participantes del grupo
    const participants = groupMetadata.participants.map(p => ({
      id: conn.decodeJid ? conn.decodeJid(p.id) : p.id,
      admin: p.admin
    }))

    // 👑 owners que están en el grupo
    const ownersInGroup = participants.filter(p => owners.includes(p.id))

    // 🛡️ admins del grupo
    const admins = participants.filter(p => p.admin && !owners.includes(p.id) && p.id !== botJid)

    // 👤 rol del que ejecuta
    const role = owners.includes(sender) ? '👑 Owner del Bot' : '🛡️ Administrador'

    // 👑 títulos
    const ownerTitles = {
      [owners[0]]: 'Dueño Principal 👑',
      [owners[1]]: 'Creador Asociado 👑'
    }

    let msg = `╭━━━〔 👥 *ADMINISTRACIÓN* 〕━━━⬣\n\n`

    if (ownersInGroup.length) {
      msg += `👑 *Dueños del Bot*\n`
      msg += ownersInGroup
        .map(o => `▸ ${ownerTitles[o.id] || 'Dueño'} @${o.id.split('@')[0]}`)
        .join('\n')
      msg += `\n\n`
    }

    msg += `🛡️ *Admins del Grupo*\n`
    msg += admins.length
      ? admins.map(a => `▸ @${a.id.split('@')[0]}`).join('\n')
      : '▸ Ninguno'
    msg += `\n\n`

    // 📢 aviso opcional
    if (text) {
      msg += `📢 *Aviso para administradores*\n`
      msg += `💬 ${text}\n\n`
    }

    msg += `╰━━━━━━━━━━━━━━━━⬣\n`
    msg += `⚡ Ejecutado por: @${sender.split('@')[0]}\n`
    msg += `🎖️ Rol: ${role}`

    const mentions = [
      sender,
      ...ownersInGroup.map(o => o.id),
      ...admins.map(a => a.id)
    ]

    await conn.sendMessage(
      m.chat,
      { text: msg, mentions },
      { quoted: m }
    )

  } catch (e) {
    console.error('Error en admins:', e)
  }
}

handler.command = ['admins']
handler.group = true
handler.tags = ['group']
handler.help = ['admins', 'admins <aviso>']

export default handler
