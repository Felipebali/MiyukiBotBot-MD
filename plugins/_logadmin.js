function normalizeJid(jid = '') {
  return jid.replace(/@c\.us$/, '@s.whatsapp.net')
}

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']

const handler = async (m, { conn, command }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❗ Este comando solo funciona en grupos.' })

  const chatData = global.db.data.chats[m.chat] || {}
  if (typeof chatData.adminLog !== 'boolean') chatData.adminLog = true // activo por defecto

  if (command === 'adminlog') {
    chatData.adminLog = !chatData.adminLog
    const estado = chatData.adminLog
      ? '✅ *LOGS ACTIVADOS*'
      : '❌ *LOGS DESACTIVADOS*'
    const emoji = chatData.adminLog ? '🟢' : '🔴'

    await conn.sendMessage(m.chat, { text: `🎯 ${estado} para este grupo ${emoji}` })
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })
  }

  if (command === 'adminh') {
    const history = chatData.adminHistory || []
    if (history.length === 0) return conn.sendMessage(m.chat, { text: '📋 No hay historial de cambios de admin en este grupo.' })

    let texto = '📋 *Historial de Cambios de Administración*\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n'
    texto += history
      .map((h, i) => {
        let accionEmoji = h.action.includes('promovió') ? '🟢' : h.action.includes('degradó') ? '🔴' : '⚙️'
        return `✨ *${i + 1}.* [${h.fecha}]
${accionEmoji} ${h.rango} @${h.actor.split('@')[0]}
➡️ ${h.action} a @${h.target.split('@')[0]}
━━━━━━━━━━━━━━━━━━━━━━━━`
      })
      .join('\n')

    await conn.sendMessage(m.chat, { text: texto, mentions: history.flatMap(h => [h.actor, h.target]) })
  }

  if (command === 'adminclear') {
    chatData.adminHistory = []
    await conn.sendMessage(m.chat, { text: '🗑️ *Historial de admins borrado exitosamente.*' })
  }

  global.db.data.chats[m.chat] = chatData
}

handler.command = ['adminlog', 'adminh', 'adminclear']
handler.group = true
handler.admin = false
handler.owner = true

// before hook para registrar cambios de admin
handler.before = async (m, { conn }) => {
  if (!m.isGroup) return
  if (!m.messageStubType) return

  const chatData = global.db.data.chats[m.chat] || {}
  if (chatData.adminLog === false) return

  try {
    let actor = m.participant || m.key?.participant || m.sender || 'Desconocido'
    actor = normalizeJid(actor)

    // --- Ignorar cambios hechos por el bot ---
    if (actor === conn.user.jid) return

    let target = m.messageStubParameters ? m.messageStubParameters[0] : null
    if (!target) return

    let action = ''
    switch (m.messageStubType) {
      case 29: action = 'promovió a admin'; break
      case 30: action = 'degradó de admin'; break
      default: return
    }

    const isOwner = ownerNumbers.includes(actor)
    const rango = isOwner ? '👑 DUEÑO' : '🛡️ ADMIN'
    const emoji = isOwner ? '👑' : '⚙️'

    const texto = `⚡ *CAMBIO DE ADMINISTRACIÓN DETECTADO*\n\n${rango} @${actor.split('@')[0]} *${action}* a @${target.split('@')[0]}`
    await conn.sendMessage(m.chat, { text: texto, mentions: [actor, target] })
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })

    // Guardar historial (últimas 20 acciones) de forma vistosa
    if (!chatData.adminHistory) chatData.adminHistory = []
    chatData.adminHistory.push({
      fecha: new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo', hour12: false }),
      actor,
      target,
      action,
      rango
    })
    if (chatData.adminHistory.length > 20) chatData.adminHistory.shift()

    global.db.data.chats[m.chat] = chatData

  } catch (e) {
    console.error('Error en grupo-adminlog.js:', e)
  }
}

export default handler
