let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  // 🔑 Metadata y admins reales
  const metadata = await conn.groupMetadata(m.chat)
  const participants = metadata.participants
  const senderId = m.sender.split(':')[0] + '@s.whatsapp.net'
  const groupAdmins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                                .map(p => p.id.split(':')[0] + '@s.whatsapp.net')
  const isAdminReal = groupAdmins.includes(senderId)
  const isOwner = ["59896026646@s.whatsapp.net","59898719147@s.whatsapp.net"].includes(senderId)

  if (!isAdminReal && !isOwner) return m.reply('❌ Solo administradores o dueños pueden usar este comando.')

  if (!groupAdmins.includes(conn.user.id.split(':')[0] + '@s.whatsapp.net'))
    return m.reply('❌ Necesito ser administrador para promover.')

  // 🔹 Obtener usuario objetivo
  let user = (m.mentionedJid && m.mentionedJid[0]) || (m.quoted && m.quoted.sender)
  if (!user && args[0]) user = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  if (!user) return m.reply('⚠️ Menciona o responde al usuario que deseas promover.')

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
    await conn.sendMessage(m.chat, { 
      text: `✅ @${user.split('@')[0]} ahora es admin.`, 
      mentions: [user] 
    })

    // --- Registrar en historial ---
    const chatData = global.db.data.chats[m.chat] || {}
    if (chatData.adminLog !== false) {
      if (!chatData.adminHistory) chatData.adminHistory = []
      const rango = isOwner ? '👑 DUEÑO' : '🛡️ ADMIN'
      chatData.adminHistory.push({
        fecha: new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo', hour12: false }),
        actor: m.sender,
        target: user,
        action: 'promovió a admin (por comando)',
        rango
      })
      if (chatData.adminHistory.length > 20) chatData.adminHistory.shift()
      global.db.data.chats[m.chat] = chatData
    }

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al intentar promover al usuario. Asegúrate de que el bot sea admin.')
  }
}

handler.command = ['p']
handler.group = true
handler.admin = false
handler.botAdmin = true

export default handler
