// 📂 plugins/_casino_deschetar.js — Comando "deschetar" solo para owners 💀

console.log('[Plugin] _casino_deschetar cargado') // <-- Log para confirmar carga en Termux

const owners = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net', '59892363485@s.whatsapp.net']

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender
    if (!owners.includes(sender)) 
      return m.reply(`🚫 @${sender.split('@')[0]} — No tienes permiso para usar este comando.`, null, { mentions: [m.sender] })

    let who

    // --- detectar usuario ---
    if (m.isGroup) {
      if (m.mentionedJid && m.mentionedJid.length > 0) who = m.mentionedJid[0]
      else if (m.quoted && m.quoted.sender) who = m.quoted.sender
    }

    // --- detectar por número ---
    if (text && !who) {
      const num = text.trim().replace(/[^0-9]/g, '')
      if (num) who = num + '@s.whatsapp.net'
    }

    if (!who) who = m.sender

    // --- base de datos segura ---
    if (!global.db) global.db = { data: {} }
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.users[who]) global.db.data.users[who] = {}

    const user = global.db.data.users[who]

    // Inicializar campos si no existen
    if (isNaN(user.coins)) user.coins = 100
    if (isNaN(user.bank)) user.bank = 0
    if (!Array.isArray(user.history)) user.history = []
    if (!Array.isArray(user.inventory)) user.inventory = []
    if (typeof user.lastDaily !== 'number') user.lastDaily = 0

    // --- aplicar deschetada ---
    user.coins = 100
    user.bank = 0
    user.history.unshift(`🧨 Don Feli te deschetó (${new Date().toLocaleDateString()})`)
    if (user.history.length > 50) user.history.pop()

    // --- respuesta ---
    await conn.sendMessage(m.chat, {
      text: `💀 *¡Usuario deschetado!* 💀\n\n` +
            `🎩 Usuario: @${who.split('@')[0]}\n` +
            `💰 Fichas: ${user.coins.toLocaleString()}\n` +
            `🏦 Banco: ${user.bank.toLocaleString()}\n\n` +
            `😈 Justicia del casino mafioso.`,
      mentions: [who]
    })

  } catch (e) {
    console.error('Error en _casino_deschetar:', e)
    m.reply('⚠️ Ocurrió un error al intentar deschetar al usuario.')
  }
}

// --- Compatibilidad con distintos loaders ---
handler.command = ['deschetar']         // array de comandos
handler.command = handler.command || /^deschetar$/i // regex alternativa

handler.help = ['deschetar *@usuario*']
handler.tags = ['owner']
handler.group = false

// Meta para loader: solo owners
handler.owner = true
handler.rowner = true

export default handler
