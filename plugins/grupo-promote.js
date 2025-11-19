// 📂 plugins/promover.js — FelixCat_Bot 🐾

let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  // 🔑 Obtener metadata del grupo y participantes
  const metadata = await conn.groupMetadata(m.chat)
  const participants = metadata.participants

  // 🔹 Normalizar IDs
  const senderId = m.sender.split(':')[0] + '@s.whatsapp.net'
  const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net'
  const owners = ['59896026646@s.whatsapp.net','59898719147@s.whatsapp.net']

  // 🔑 Lista de admins del grupo
  const groupAdmins = participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id.split(':')[0] + '@s.whatsapp.net')

  // 🔑 Verificar si el remitente es admin o dueño
  const isAdminReal = groupAdmins.includes(senderId)
  const isOwnerReal = owners.includes(senderId)

  if (!isAdminReal && !isOwnerReal) return m.reply('❌ Solo administradores o dueños pueden usar este comando.')

  // 🔑 Verificar que el bot sea admin
  if (!groupAdmins.includes(botId)) return m.reply('❌ Necesito ser administrador para promover.')

  // 🔹 Obtener usuario objetivo
  let user = (m.mentionedJid && m.mentionedJid[0]) || (m.quoted && m.quoted.sender)
  if (!user && args[0]) user = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  if (!user) return m.reply('⚠️ Menciona o responde al usuario que deseas promover.')

  // 🔹 Protección: no promover al bot ni owners
  if (user === botId || owners.includes(user)) return m.reply('🤨 No puedo promover al bot ni a un owner.')

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
    await conn.sendMessage(m.chat, { 
      text: `✅ @${user.split('@')[0]} ahora es admin.`, 
      mentions: [user] 
    })

    // --- Registrar en historial solo si adminLog está activo ---
    const chatData = global.db.data.chats[m.chat] || {}
    if (chatData.adminLog !== false) {
      if (!chatData.adminHistory) chatData.adminHistory = []

      const rango = isOwnerReal ? '👑 DUEÑO' : '🛡️ ADMIN'
      chatData.adminHistory.push({
        fecha: new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo', hour12: false }),
        actor: senderId,  // quien ejecuta el comando
        target: user,     // a quien se promovió
        action: 'promovió a admin (por comando)',
        rango
      })

      // Mantener solo últimos 20 registros
      if (chatData.adminHistory.length > 20) chatData.adminHistory.shift()
      global.db.data.chats[m.chat] = chatData
    }

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al intentar promover al usuario. Asegúrate de que el bot sea admin y que el usuario no lo sea ya.')
  }
}

handler.command = ['p']
handler.group = true
handler.botAdmin = true
handler.admin = false  // ya verificamos admins reales
export default handler
