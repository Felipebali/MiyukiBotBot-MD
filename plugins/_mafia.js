// plugins/_casino_chetar.js — Casino Mafioso • Edición Don Feli Deluxe (Completo y funcional)
let handler = async (m, { conn, args = [], usedPrefix = '.', command = '' }) => {
  // Dueños (IDs sin @)
  const owners = ['59898719147', '59896026646', '59892363485']
  const who = m.sender
  const short = who.split('@')[0]

  // ---------- BASE DE DATOS ----------
  if (!global.db) global.db = { data: {} }
  if (!global.db.data.casinoMafia) global.db.data.casinoMafia = { active: true }
  if (!global.db.data.users) global.db.data.users = {}

  if (!global.db.data.users[who]) global.db.data.users[who] = {
    coins: owners.includes(short) ? 500 : 100,
    bank: 0,
    lastDaily: 0,
    lastRob: 0,
    history: [],
    inventory: []
  }

  const user = global.db.data.users[who]
  const casino = global.db.data.casinoMafia

  // Normalizaciones
  if (isNaN(user.coins)) user.coins = owners.includes(short) ? 500 : 100
  if (isNaN(user.bank)) user.bank = 0
  if (!Array.isArray(user.history)) user.history = []
  if (typeof user.lastRob !== 'number') user.lastRob = 0

  // ---------- CONSTANTES ----------
  const CURRENCY_LABEL = 'Fichas'
  const DAILY_REWARD = 50
  const DAILY_COOLDOWN = 24 * 60 * 60 * 1000
  const TAX_RATE = 0.05
  const TRANSFER_TAX = 0.02
  const ROB_COOLDOWN = 60 * 60 * 1000
  const ROB_SUCCESS_RATE_NORMAL = 0.45
  const ROB_SUCCESS_RATE_OWNER = 0.85

  // ICONOS y estilos
  const ICON = {
    CAS: '🎰', SKULL: '💀', BANK: '🏦', ALERT: '🚨', MONEY: '💸',
    STAR: '⭐', TROPHY: '🏆', NOTE: '📜', CLOCK: '⏳', DANGER: '⚠️',
    CHIP: '🎲', BAG: '🧳', SAFE: '🪙', DOOR: '🚪', GUN: '🔫'
  }
  const LINE = '━━━━━━━━━━━━━━━━━━━━━━━━━'

  // ---------- FUNCIONES ----------
  const safeSend = async (chat, text, mentions = []) => {
    try { await conn.sendMessage(chat, { text, mentions }) }
    catch {
      try { await conn.sendMessage(chat, { text }) }
      catch (e) { console.error('Error enviando casino:', e) }
    }
  }

  const pushHistory = (jid, msg) => {
    if (!global.db || !global.db.data || !global.db.data.users) return
    if (!global.db.data.users[jid]) return
    const time = new Date().toLocaleString()
    if (!Array.isArray(global.db.data.users[jid].history)) global.db.data.users[jid].history = []
    global.db.data.users[jid].history.unshift(`[${time}] ${msg}`)
    if (global.db.data.users[jid].history.length > 50) global.db.data.users[jid].history.pop()
  }

  const ensureUser = (jid) => {
    if (!global.db.data.users[jid]) {
      global.db.data.users[jid] = { coins: 100, bank: 0, lastDaily: 0, lastRob: 0, history: [], inventory: [] }
    }
    return global.db.data.users[jid]
  }

  const format = (n) => `${Number(n).toLocaleString()} ${CURRENCY_LABEL}`
  const randomSymbol = arr => arr[Math.floor(Math.random() * arr.length)]

  const getRank = (coins) => {
    if (coins >= 20000) return { name: 'Leyenda', badge: '👑', desc: 'La leyenda de la mesa. Todos te conocen.' }
    if (coins >= 5000) return { name: 'Don', badge: '🎩', desc: 'Capo respetado en cada partida.' }
    if (coins >= 1000) return { name: 'Capo', badge: '🕴️', desc: 'Jugador recurrente y temido.' }
    if (coins >= 300) return { name: 'Aprendiz', badge: '🔰', desc: 'Aprende las reglas, toma riesgos.' }
    return { name: 'Novato', badge: '🟢', desc: 'Aún en el camino, con hambre de fichas.' }
  }

  // ---------- TOGGLE CASINO ----------
  if (command === 'mafioso') {
    if (!owners.includes(short)) return safeSend(m.chat, `${ICON.DANGER} @${short} — Acceso denegado. Solo los Dueños controlan el salón.`, [m.sender])
    casino.active = !casino.active
    if (casino.active) {
      return safeSend(m.chat,
`${ICON.ALERT} *Casino Mafioso — Don Feli*  
${LINE}
🔔 El Don ha dado la orden: *ABRIR SALA*.
El humo sube, la orquesta comienza. Buenas noches, capo.`, [m.sender])
    } else {
      return safeSend(m.chat,
`${ICON.SKULL} *Casino Mafioso — Don Feli*  
${LINE}
🔒 El Don clausuró la sala por hoy. Las fichas vuelven a sus bolsillos.
Volvemos a abrir cuando el Don lo decida.`, [m.sender])
    }
  }

  // ---------- MENÚ ----------
  if (command === 'menucasino') {
    if (!casino.active) return safeSend(m.chat, `${ICON.SKULL} El Casino Mafioso está cerrado.`, [m.sender])
    const rank = getRank(user.coins)
    return safeSend(m.chat,
`${ICON.CAS} *CASINO MAFIOSO — Don Feli*  
${LINE}
👤 *Jugador:* @${short} ${rank.badge}  
🏷️ *Rango:* ${rank.name} — _${rank.desc}_  
💰 *Saldo disponible:* ${format(user.coins)}  
🏦 *En banco:* ${format(user.bank)}
${LINE}
🎲 *Juegos*
• ${usedPrefix}apuesta <cantidad o %> — Rueda el riesgo  
• ${usedPrefix}ruleta <cantidad> — Gira la fortuna  
• ${usedPrefix}slots — Máquina de la suerte  
• ${usedPrefix}robar @usuario [cantidad] — Si te animás

💵 *Economía*
• ${usedPrefix}saldo — Ver tu cuenta  
• ${usedPrefix}daily — Propina diaria del Don  
• ${usedPrefix}depositar <cantidad>  
• ${usedPrefix}sacar <cantidad>  
• ${usedPrefix}transferir @usuario <cantidad>  
• ${usedPrefix}history — Últimos movimientos
${LINE}
🔒 *Dueños:* ${usedPrefix}mafioso — abrir/cerrar la sala
${ICON.NOTE} Mensajes con estilo cinematográfico. Juega con responsabilidad.`, [m.sender])
  }

  const restricted = ['saldo','daily','depositar','sacar','apuesta','ruleta','slots','history','transferir','robar','rob','perfil','topcasino','top']
  if (!casino.active && restricted.includes(command))
    return safeSend(m.chat, `${ICON.SKULL} @${short} — El Casino está cerrado. Volvé cuando el Don lo permita.`, [m.sender])

  // ---------- SALDO ----------
  if (command === 'saldo') {
    const rank = getRank(user.coins)
    return safeSend(m.chat,
`${ICON.CAS} *Cuenta del Jugador — @${short}*  
${LINE}
💰 Saldo: ${format(user.coins)}  
🏦 Banco: ${format(user.bank)}  
🏷️ Rango: ${rank.name} ${rank.badge} — _${rank.desc}_  
${LINE}
${ICON.NOTE} “El Don dice: administra tu suerte con cabeza.”`, [m.sender])
  }

  // ---------- DAILY ----------
  if (command === 'daily') {
    const now = Date.now()
    if (now - user.lastDaily < DAILY_COOLDOWN) {
      const remaining = DAILY_COOLDOWN - (now - user.lastDaily)
      const hours = Math.ceil(remaining / (60 * 60 * 1000))
      return safeSend(m.chat, `${ICON.CLOCK} @${short} — Tu próxima propina estará disponible en *${hours}h*. El Don te espera.`, [m.sender])
    }
    user.coins += DAILY_REWARD
    user.lastDaily = now
    pushHistory(who, `Daily +${DAILY_REWARD}`)
    return safeSend(m.chat,
`${ICON.MONEY} *Propina del Don*  
${LINE}
@${short}, recibiste +${format(DAILY_REWARD)} como propina diaria.  
“El Don premia la fidelidad.”`, [m.sender])
  }

  // ---------- DEPOSITAR (vistoso) ----------
  if (command === 'depositar') {
    if (!args[0]) return safeSend(m.chat, `⚠️ Uso: ${usedPrefix}depositar <cantidad>`, [m.sender])
    const amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `⚠️ Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `❌ No tienes tantas fichas.`, [m.sender])

    user.coins -= amount
    user.bank += amount
    pushHistory(who, `Depositó ${format(amount)}`)

    const text = `
${ICON.BANK} *Operación Bancaria — Depósito Seguro*  
${LINE}
📥 @${short} coloca una maleta sobre el mostrador.  
🧳 El cajero abre... cuenta las fichas una por una.  
💼 Se registran *${format(amount)}* en la caja del Don.  
${LINE}
🏦 *Saldo actual en banco:* ${format(user.bank)}  
💰 *Saldo en mano:* ${format(user.coins)}  
${ICON.NOTE} “El Don murmura: quien ahorra, sobrevive.”`
    return safeSend(m.chat, text, [m.sender])
  }

  // ---------- SACAR (vistoso) ----------
  if (command === 'sacar') {
    if (!args[0]) return safeSend(m.chat, `⚠️ Uso: ${usedPrefix}sacar <cantidad>`, [m.sender])
    const amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `⚠️ Cantidad inválida.`, [m.sender])
    if (user.bank < amount) return safeSend(m.chat, `❌ No tienes tanto en el banco.`, [m.sender])

    user.bank -= amount
    user.coins += amount
    pushHistory(who, `Retiró ${format(amount)}`)

    const text = `
${ICON.MONEY} *Retiro Autorizado — Caja Fuerte del Don*  
${LINE}
💳 @${short} entrega una ficha dorada.  
🪙 El guardia asiente y abre la bóveda.  
💰 Retiras *${format(amount)}* cuidadosamente envueltas en terciopelo.  
${LINE}
🏦 *Banco restante:* ${format(user.bank)}  
🎲 *Saldo disponible:* ${format(user.coins)}  
${ICON.NOTE} “No hay poder sin liquidez, pero cuida tus movimientos.”`
    return safeSend(m.chat, text, [m.sender])
  }

  // ---------- TRANSFERIR ----------
  if (command === 'transferir') {
    if (!args[0] || !args[1]) return safeSend(m.chat, `⚠️ Uso: ${usedPrefix}transferir @usuario <cantidad>`, [m.sender])
    let target = (m.mentionedJid && m.mentionedJid.length > 0) ? m.mentionedJid[0] : null
    if (!target) {
      const num = args[0].replace(/[^0-9]/g, '')
      if (num) target = num + '@s.whatsapp.net'
    }
    if (!target) return safeSend(m.chat, `⚠️ Debes mencionar o escribir el número del jugador.`, [m.sender])
    const amount = parseInt(args[1])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `⚠️ Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `❌ No tienes suficientes fichas.`, [m.sender])

    const receptor = ensureUser(target)
    const tax = Math.floor(amount * TRANSFER_TAX)
    const final = amount - tax
    user.coins -= amount
    receptor.coins += final

    pushHistory(who, `Envió ${format(amount)} a @${target.split('@')[0]} (-${format(tax)} comisión)`)
    pushHistory(target, `Recibió ${format(final)} de @${short}`)

    return safeSend(m.chat,
`${ICON.MONEY} *Transferencia completada*  
${LINE}
📤 De: @${short}  
📥 A: @${target.split('@')[0]}  
💸 Monto: ${format(amount)}  
💰 Comisión: ${format(tax)} (2%)  
🏦 Recibido: ${format(final)}  
${LINE}
El Don asiente: transacción segura.`, [m.sender, target])
  }

  // ---------- APUESTA ----------
  if (command === 'apuesta') {
    if (!args[0]) return safeSend(m.chat, `⚠️ Uso: ${usedPrefix}apuesta <cantidad o %>`, [m.sender])
    let amount = 0
    const arg = args[0].trim()
    if (arg.endsWith('%')) {
      const perc = parseFloat(arg.replace('%',''))
      if (isNaN(perc) || perc <= 0 || perc > 100) return safeSend(m.chat, `⚠️ Porcentaje inválido (1–100%).`, [m.sender])
      amount = Math.floor(user.coins * (perc / 100))
    } else {
      amount = parseInt(arg)
    }
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `⚠️ Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `❌ No tienes fichas suficientes.`, [m.sender])

    const winChance = owners.includes(short) ? 0.85 : 0.50
    const win = Math.random() < winChance
    if (win) {
      const gain = amount - Math.floor(amount * TAX_RATE)
      user.coins += gain
      pushHistory(who, `Apuesta ganada +${gain}`)
      return safeSend(m.chat,
`${ICON.CAS} *Apuesta Ganada*  
${LINE}
El crupier lanza la ficha, la mesa calla…  
@${short} gana ${format(gain)}.  
“El Don brinda por tus reflejos.”`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Apuesta perdida -${amount}`)
      return safeSend(m.chat,
`${ICON.SKULL} *Apuesta Perdida*  
${LINE}
La ficha rueda y cae del lado contrario.  
@${short} pierde ${format(amount)}.  
“El azar no tiene piedad.”`, [m.sender])
    }
  }

  // ---------- RULETA ----------
  if (command === 'ruleta') {
    if (!args[0]) return safeSend(m.chat, `⚠️ Uso: ${usedPrefix}ruleta <cantidad>`, [m.sender])
    const amount = parseInt(args[0])
    if (isNaN(amount) || amount <= 0) return safeSend(m.chat, `⚠️ Cantidad inválida.`, [m.sender])
    if (user.coins < amount) return safeSend(m.chat, `❌ No tienes fichas suficientes.`, [m.sender])

    const winChance = owners.includes(short) ? 0.85 : 0.50
    const win = Math.random() < winChance
    if (win) {
      user.coins += amount
      pushHistory(who, `Ruleta ganada +${amount}`)
      return safeSend(m.chat,
`${ICON.TROPHY} *Ruleta: La fortuna te sonrió*  
${LINE}
La bola cae en tu número. @${short} gana ${format(amount)}.`, [m.sender])
    } else {
      user.coins -= amount
      pushHistory(who, `Ruleta perdida -${amount}`)
      return safeSend(m.chat,
`${ICON.SKULL} *Ruleta: Mala suerte*  
${LINE}
La bola no fue para vos. @${short} pierde ${format(amount)}.`, [m.sender])
    }
  }

  // ---------- SLOTS ----------
  if (command === 'slots') {
    const symbols = ['🍒','🍋','🍊','🍉','💎','7️⃣','⭐']
    const roll = Array.from({ length: 3 }, () => randomSymbol(symbols))
    const winChance = owners.includes(short) ? 0.80 : 0.40
    const win = Math.random() < winChance
    if (win) {
      const prize = 120
      user.coins += prize
      pushHistory(who, `Slots ganada +${prize}`)
      return safeSend(m.chat,
`${ICON.CAS} ${roll.join(' ')}  
${LINE}
¡Jackpot! @${short} gana +${format(prize)}.  
El Don aplaude desde su sillón.`, [m.sender])
    } else {
      const loss = 30
      user.coins -= loss
      pushHistory(who, `Slots perdida -${loss}`)
      return safeSend(m.chat,
`${ICON.CAS} ${roll.join(' ')}  
${LINE}
La máquina no estuvo de tu lado. @${short} pierde ${format(loss)}.`, [m.sender])
    }
  }

  // ---------- ROBAR ----------
  if (command === 'robar' || command === 'rob') {
    if (!m.isGroup) return safeSend(m.chat, `❗ Este comando funciona mejor en grupos.`, [m.sender])
    let targetJid = (m.mentionedJid && m.mentionedJid.length) ? m.mentionedJid[0] : null
    if (!targetJid && m.quoted && m.quoted.sender) targetJid = m.quoted.sender
    if (!targetJid && args[0] && /\d/.test(args[0])) {
      const num = args[0].replace(/[^0-9]/g, '')
      if (num) targetJid = num + '@s.whatsapp.net'
    }
    if (!targetJid) return safeSend(m.chat, `⚠️ Uso: ${usedPrefix}robar @usuario [cantidad]`, [m.sender])
    if (targetJid === who) return safeSend(m.chat, `❌ No puedes robarte a vos mismo.`, [m.sender])
    const targetShort = targetJid.split('@')[0].replace(/\D/g, '')
    if (owners.includes(targetShort)) return safeSend(m.chat, `❌ No intentes robar a un Dueño.`)
    if (conn.user && targetJid === conn.user.jid) return safeSend(m.chat, `❌ No intentes robar al bot.`)

    const targetUser = ensureUser(targetJid)
    const now = Date.now()
    if (now - user.lastRob < ROB_COOLDOWN) {
      const remain = ROB_COOLDOWN - (now - user.lastRob)
      const mins = Math.ceil(remain / 60000)
      return safeSend(m.chat, `${ICON.CLOCK} Tenés que esperar ${mins} minutos para robar otra vez.`, [m.sender])
    }

    let amountRequested = 0
    if (args && args.length > 1 && args[1]) {
      const n = parseInt(args[1].replace(/[^0-9]/g,''), 10)
      if (!isNaN(n) && n > 0) amountRequested = n
    }

    const pct = Math.random() * (0.5 - 0.1) + 0.1
    let possible = Math.max(1, Math.floor(targetUser.coins * pct))
    if (amountRequested > 0) possible = Math.min(possible, amountRequested, targetUser.coins)

    if (targetUser.coins <= 0 || possible <= 0) {
      user.lastRob = now
      pushHistory(who, `Intento de robo fallido (sin botín) a @${targetShort}`)
      return safeSend(m.chat, `${ICON.DANGER} @${targetShort} no tiene fichas para robar.`, [targetJid])
    }

    const successRate = owners.includes(short) ? ROB_SUCCESS_RATE_OWNER : ROB_SUCCESS_RATE_NORMAL
    const roll = Math.random()
    user.lastRob = now

    if (roll < successRate) {
      const stolen = Math.max(1, Math.floor(possible))
      targetUser.coins = Math.max(0, targetUser.coins - stolen)
      user.coins += stolen
      pushHistory(who, `Robó +${stolen} a @${targetShort}`)
      pushHistory(targetJid, `Le robaron -${stolen} por @${short}`)
      return safeSend(m.chat,
`${ICON.MONEY} *Robo exitoso*  
${LINE}
🕶️ @${short} ejecutó el golpe y obtuvo ${format(stolen)} de @${targetShort}.  
La familia celebra en silencio.`, [who, targetJid])
    } else {
      const thiefBalance = Math.max(0, user.coins)
      const penaltyPct = Math.random() * (0.15 - 0.05) + 0.05
      const penalty = Math.min(thiefBalance, Math.ceil(thiefBalance * penaltyPct))
      user.coins = Math.max(0, user.coins - penalty)
      const compensation = Math.ceil(penalty * 0.30)
      targetUser.coins += compensation
      pushHistory(who, `Intento de robo fallido -multas ${penalty}`)
      pushHistory(targetJid, `Recibió compensación +${compensation} tras intento de robo`)
      return safeSend(m.chat,
`${ICON.SKULL} *Robo fallido*  
${LINE}
Los guardias interceptaron el intento. Pagás una multa de ${format(penalty)}.  
@${targetShort} recibe ${format(compensation)} como compensación.`, [m.sender, targetJid])
    }
  }

  // ---------- HISTORY ----------
  if (command === 'history') {
    if (!user.history.length) return safeSend(m.chat, `${ICON.NOTE} No hay movimientos todavía.`, [m.sender])
    return safeSend(m.chat,
`${ICON.NOTE} *Historial de @${short}*  
${LINE}
${user.history.slice(0, 12).join('\n')}
${LINE}
_Pista_: usá ${usedPrefix}saldo para ver tu estado actual.`, [m.sender])
  }

  // ---------- PERFIL ----------
  if (command === 'perfil') {
    const rank = getRank(user.coins)
    const wins = user.history.filter(h => /ganad|jackpot|gana/i.test(h)).length
    const losses = user.history.filter(h => /perd|pierde|multa/i.test(h)).length
    return safeSend(m.chat,
`${ICON.STAR} *Perfil mafioso — @${short}*  
${LINE}
🏷️ Rango: ${rank.name} ${rank.badge}  
💬 Motto: ${rank.desc}
💰 Saldo líquido: ${format(user.coins)}  
🏦 En banco: ${format(user.bank)}  
📈 Victorias: ${wins} — Derrotas: ${losses}  
🕘 Último daily: ${user.lastDaily ? new Date(user.lastDaily).toLocaleString() : 'Nunca'}  
🕘 Último robo: ${user.lastRob ? new Date(user.lastRob).toLocaleString() : 'Nunca'}
${LINE}
_El Don observa. Juega con cabeza y honor._`, [m.sender])
  }

  // ---------- TOP (leaderboard) ----------
  if (command === 'topcasino' || command === 'mejores') {
    const usersObj = global.db.data.users || {}
    const usersArr = Object.keys(usersObj).map(k => ({ jid: k, coins: usersObj[k].coins || 0 }))
    usersArr.sort((a,b) => b.coins - a.coins)
    const top = usersArr.slice(0, 8)
    if (!top.length) return safeSend(m.chat, `${ICON.NOTE} No hay jugadores aún.`, [m.sender])
    let text = `${ICON.TROPHY} *Leaderboard — Casino Mafioso*\n${LINE}\n`
    top.forEach((u, i) => {
      const name = u.jid.split('@')[0]
      text += `#${i+1} • @${name} — ${format(u.coins)}\n`
    })
    text += `${LINE}\nConsigue fichas y asciende en la familia.`
    return safeSend(m.chat, text, top.map(t => t.jid))
  }
}

// Comandos disponibles
handler.help = ['mafioso','menucasino','saldo','daily','depositar','sacar','transferir','apuesta','ruleta','slots','robar','history','perfil','topcasino','mejores']
handler.tags = ['casino']
handler.command = /^(mafioso|menucasino|saldo|daily|depositar|sacar|transferir|apuesta|ruleta|slots|robar|rob|history|perfil|topcasino|mejores)$/i
export default handler
