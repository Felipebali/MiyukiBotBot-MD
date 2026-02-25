// 📂 plugins/id-lid-owner.js

// 🧠 Normalizador de números (acepta +598..., 598..., JID, etc)
function normalizeNumber(input = '') {
  return String(input)
    .replace(/[^0-9]/g, '')
    .replace(/^0+/, '')
}

// 🔎 Extrae un número del texto aunque no sea mención
function extractNumberFromText(text = '') {
  const match = text.match(/\+?\d{7,15}/)
  return match ? normalizeNumber(match[0]) : null
}

// --- Handler para .id ---
let handler = async function (m, { conn, groupMetadata }) {

  // --- Verificación de owner ---
  const senderNumber = normalizeNumber(m.sender)
  const owners = Array.isArray(global.owner)
    ? global.owner.map(o => normalizeNumber(o))
    : []

  if (!owners.includes(senderNumber))
    return m.reply('❌ Solo el owner puede usar este comando.')

  // 🧷 Caso 1: mención real
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    const userJid = m.mentionedJid[0]
    const userName = await conn.getName(userJid) || 'Usuario'
    const number = normalizeNumber(userJid)

    const mensaje = `
╭─✿ *ID de Usuario* ✿─╮
│  *Nombre:* ${userName}
│  *Número:* ${number}
│  *JID/ID:* ${userJid}
╰─────────────────────╯`.trim()

    return conn.reply(m.chat, mensaje, m, { mentions: [userJid] })
  }

  // 🧷 Caso 2: número escrito sin mención
  const rawText =
    m.text ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const extracted = extractNumberFromText(rawText)

  if (extracted) {
    const userJid = extracted + '@s.whatsapp.net'
    const userName = await conn.getName(userJid) || 'Usuario'

    const mensaje = `
╭─✿ *ID de Usuario* ✿─╮
│  *Nombre:* ${userName}
│  *Número:* ${extracted}
│  *JID/ID:* ${userJid}
╰─────────────────────╯`.trim()

    return conn.reply(m.chat, mensaje, m)
  }

  // 🧷 Caso 3: sin datos → mostrar grupo
  if (m.isGroup) {
    const mensaje = `
╭─✿ *ID del Grupo* ✿─╮
│  *Nombre:* ${groupMetadata.subject}
│  *JID/ID:* ${m.chat}
│  *Participantes:* ${groupMetadata.participants.length}
╰─────────────────────╯`.trim()

    return conn.reply(m.chat, mensaje, m)
  }

  // 🧷 Ayuda
  const ayuda = `
📋 *Uso del comando ID/LID:*

🏷️ *.id @usuario*
📞 *.id +598XXXXXXXX*
🏢 *.id* (en grupo)
📱 *.lid* - lista completa

💡 *Ejemplos:*
• .id @juan
• .id +59898116138
• .id (en un grupo)
• .lid`.trim()

  return conn.reply(m.chat, ayuda, m)
}

// --- Handler para .lid ---
let handlerLid = async function (m, { conn, groupMetadata }) {

  if (!m.isGroup)
    return m.reply('❌ Este comando solo funciona en grupos.')

  // --- Verificación de owner ---
  const senderNumber = normalizeNumber(m.sender)
  const owners = Array.isArray(global.owner)
    ? global.owner.map(o => normalizeNumber(o))
    : []

  if (!owners.includes(senderNumber))
    return m.reply('❌ Solo el owner puede usar este comando.')

  const participantes = groupMetadata?.participants || []

  const tarjetas = participantes.map((p, index) => {
    const jid = p.id || 'N/A'
    const username = '@' + normalizeNumber(jid)

    const estado =
      p.admin === 'superadmin' ? '👑 *Propietario*' :
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
