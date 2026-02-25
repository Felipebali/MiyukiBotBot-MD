let handler = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!isAdmin && !isOwner) return m.reply('❌ Solo administradores o dueños pueden usar este comando.')
  if (!isBotAdmin) return m.reply('❌ Necesito ser administrador para promover.')

  const user = (m.mentionedJid && m.mentionedJid[0]) || (m.quoted && m.quoted.sender)
  if (!user) return m.reply('⚠️ Menciona o responde al usuario que deseas promover.')

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
    await conn.sendMessage(m.chat, { 
      text: `✅ @${user.split('@')[0]} ahora es admin.`, 
      mentions: [user] 
    })

    // --- Registrar en historial solo si adminLog está activo ---
    const chatData = global.db.data.chats[m.chat] || {}
    if (chatData.adminLog === false) return

    if (!chatData.adminHistory) chatData.adminHistory = []

    const rango = isOwner ? '👑 DUEÑO' : '🛡️ ADMIN'
    chatData.adminHistory.push({
      fecha: new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo', hour12: false }),
      actor: m.sender,    // quien ejecuta el comando
      target: user,       // a quien se promovió
      action: 'promovió a admin (por comando)',
      rango
    })
    if (chatData.adminHistory.length > 20) chatData.adminHistory.shift()
    global.db.data.chats[m.chat] = chatData

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al intentar promover al usuario.')
  }
}

handler.command = ['p']
handler.group = true
handler.admin = false
handler.botAdmin = true

export default handler
