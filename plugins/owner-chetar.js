// 📂 plugins/_casino_chetar.js — Comando "chetar" solo para owners 👑

console.log('[Plugin] _casino_chetar cargado') // <-- Log para confirmar carga en Termux

const owners = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net', '59892363485@s.whatsapp.net']

let handler = async (m, { conn, text }) => {
  try {
    const sender = m.sender
    if (!owners.includes(sender)) 
      return m.reply(`🚫 @${sender.split('@')[0]} — No tienes permiso para usar este comando.`, null, { mentions: [m.sender] })

    let who
    let cantidad = 999999 // valor por defecto

    // --- detectar usuario ---
    if (m.isGroup) {
      if (m.mentionedJid && m.mentionedJid.length > 0) who = m.mentionedJid[0]
      else if (m.quoted && m.quoted.sender) who = m.quoted.sender
    }

    // --- detectar número manual ---
    if (text) {
      const partes = text.trim().split(/\s+/)
      if (!who && partes[0].match(/\d+/)) who = partes[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
      if (partes[1] && !isNaN(partes[1])) cantidad = parseInt(partes[1])
    }

    if (!who) who = m.sender
    if (isNaN(cantidad) || cantidad <= 0) cantidad = 999999

    // --- inicializar base de datos ---
    if (!global.db) global.db = { data: {} }
    if (!global.db.data) global.db.data = {}
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.users[who]) {
      global.db.data.users[who] = { coins: 100, bank: 0, lastDaily: 0, history: [], inventory: [] }
    }

    const user = global.db.data.users[who]
    if (!Array.isArray(user.history)) user.history = []
    if (typeof user.coins !== 'number') user.coins = 0
    if (typeof user.bank !== 'number') user.bank = 0

    // --- aplicar la "chetada" ---
    user.coins = cantidad
    user.bank = cantidad
    const registro = `💼 Don Feli te chetó (${new Date().toLocaleDateString()}) con ${cantidad} fichas.`
    user.history.unshift(registro)
    if (user.history.length > 50) user.history.pop()

    // --- enviar mensaje ---
    await conn.sendMessage(m.chat, {
      text:
        `👑 *¡Cuentas chetadas con éxito!*\n\n` +
        `🎩 Usuario: @${who.split('@')[0]}\n` +
        `💰 Fichas: ${user.coins.toLocaleString()}\n` +
        `🏦 Banco: ${user.bank.toLocaleString()}`,
      mentions: [who],
    })

  } catch (e) {
    console.error('Error en _casino_chetar:', e)
    m.reply('⚠️ Ocurrió un error al intentar chetar las cuentas.')
  }
}

// --- Compatibilidad con distintos loaders ---
handler.command = ['chetar']         // array de comandos
handler.command = handler.command || /^chetar$/i // regex alternativa

handler.help = ['chetar *@usuario* <cantidad>']
handler.tags = ['owner']
handler.group = false

// Meta para loader: solo owners
handler.owner = true
handler.rowner = true

export default handler
