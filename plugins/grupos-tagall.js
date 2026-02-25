// 📂 plugins/tagall.js — FelixCat-Bot 🐾
// TagAll con toggle .antitagall — sin cooldown

let handler = async function (m, { conn, groupMetadata, args, isAdmin, isOwner, command }) {

  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  const chatId = m.chat
  const sender = m.sender

  // Inicializar datos del chat
  if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}
  const chatData = global.db.data.chats[chatId]

  // 🔥 Toggle .antitagall — SOLO ADMIN / OWNER
  if (command === 'antitagall') {
    if (!(isAdmin || isOwner)) {
      return conn.sendMessage(chatId, { text: '❌ Solo un administrador puede usar este comando.' })
    }

    chatData.tagallEnabled = !chatData.tagallEnabled

    return conn.sendMessage(chatId, {
      text: `⚡ TagAll ahora está ${chatData.tagallEnabled ? 'activado ✅' : 'desactivado ❌'} para este grupo.`
    })
  }

  // ===========================
  // TagAll normal
  // ===========================

  if (!(isAdmin || isOwner)) {
    return conn.sendMessage(chatId, {
      text: '❌ Solo un administrador puede usar este comando.',
      mentions: [sender]
    })
  }

  if (!chatData.tagallEnabled) {
    return conn.sendMessage(chatId, {
      text: '⚠️ El TagAll está desactivado. Usa ".antitagall" para activarlo.'
    })
  }

  const participantes = groupMetadata?.participants || []
  const mencionados = participantes.map(p => p.id).filter(Boolean)

  const mensajeOpcional = args.length ? args.join(' ') : ''

  const mensaje = [
    `🔥 Se activó el tag de todos! 🔥`,
    `⚡ Usuarios invocados:`,
    mencionados.map(jid => `- @${jid.split('@')[0]}`).join('\n'),
    '💥 Que comience la acción!',
    'https://miunicolink.local/tagall-FelixCat',
    mensajeOpcional
  ].filter(Boolean).join('\n')

  await conn.sendMessage(chatId, {
    text: mensaje,
    mentions: mencionados.concat(sender)
  })
}

// Comandos
handler.command = ['invocar', 'todos', 'tagall', 'antitagall']
handler.help = ['tagall', 'antitagall']
handler.tags = ['grupos']
handler.group = true
handler.admin = true

export default handler
