// 📂 plugins/id-lid-owner.js

// --- Handler para .id ---
let handler = async function (m, { conn, groupMetadata }) {
  // --- Verificación de owner ---
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const owners = Array.isArray(global.owner)
    ? global.owner.filter(Boolean).map(o => String(o).replace(/[^0-9]/g, ''))
    : []
  if (!owners.includes(senderNumber)) return m.reply('❌ Solo el owner puede usar este comando.')

  // Si hay menciones, mostrar ID del usuario mencionado
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    const userJid = m.mentionedJid[0]
    const userName = await conn.getName(userJid) || 'Usuario'
    const number = userJid.split('@')[0]
    
    const mensaje = `
╭─✿ *ID de Usuario* ✿─╮
│  *Nombre:* ${userName}
│  *Número:* ${number}
│  *JID/ID:* ${userJid}
╰─────────────────────╯`.trim()
    
    return conn.reply(m.chat, mensaje, m, { mentions: [userJid] })
  }

  // Si no hay menciones y es un grupo, mostrar ID del grupo
  if (m.isGroup) {
    const mensaje = `
╭─✿ *ID del Grupo* ✿─╮
│  *Nombre:* ${groupMetadata.subject}
│  *JID/ID:* ${m.chat}
│  *Participantes:* ${groupMetadata.participants.length}
╰─────────────────────╯`.trim()
    
    return conn.reply(m.chat, mensaje, m)
  }

  // Si no es grupo y no hay menciones, mostrar ayuda
  const ayuda = `
📋 *Uso del comando ID/LID:*

🏷️ *.id @usuario* - Ver ID de usuario
🏢 *.id* (en grupo) - Ver ID del grupo
📱 *.lid* - Ver lista completa de participantes

💡 *Ejemplos:*
• .id @juan
• .id (en un grupo)
• .lid (lista completa)`.trim()
  
  return conn.reply(m.chat, ayuda, m)
}

// --- Handler para .lid ---
let handlerLid = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  // --- Verificación de owner ---
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const owners = Array.isArray(global.owner)
    ? global.owner.filter(Boolean).map(o => String(o).replace(/[^0-9]/g, ''))
    : []
  if (!owners.includes(senderNumber)) return m.reply('❌ Solo el owner puede usar este comando.')

  const participantes = groupMetadata?.participants || []

  const tarjetas = participantes.map((p, index) => {
    const jid = p.id || 'N/A'
    const username = '@' + jid.split('@')[0]
    const estado = p.admin === 'superadmin' ? '👑 *Propietario*' :
                   p.admin === 'admin' ? '🛡️ *Administrador*' :
                   '👤 *Miembro*'

    return [
      '╭─✿ *Usuario ' + (index + 1) + '* ✿',
      `│  *Nombre:* ${username}`,
      `│  *JID:* ${jid}`,
      `│  *Rol:* ${estado}`,
      '╰───────────────✿'
    ].join('\n')
  })

  const contenido = tarjetas.join('\n\n')
  const mencionados = participantes.map(p => p.id).filter(Boolean)

  const mensajeFinal = `╭━━━❖『 *Lista de Participantes* 』❖━━━╮
👥 *Grupo:* ${groupMetadata.subject}
🔢 *Total:* ${participantes.length} miembros
╰━━━━━━━━━━━━━━━━━━━━━━╯

${contenido}`

  return conn.reply(m.chat, mensajeFinal, m, { mentions: mencionados })
}

// --- Configuración de comandos ---
handler.command = ['id']
handler.help = ['id', 'id @user']
handler.tags = ['info']
handler.rowner = true

handlerLid.command = ['lid']
handlerLid.help = ['lid']
handlerLid.tags = ['group']
handlerLid.group = true
handlerLid.rowner = true

// --- Exportar handlers ---
export { handler as default, handlerLid }
