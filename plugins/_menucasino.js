let cooldown = 5000 // 5 segundos
let lastUse = {}

let handler = async (m, { conn, usedPrefix, command, args }) => {

  // 🔐 Verificar owner
  const isOwner = global.owner
    .map(v => (Array.isArray(v) ? v[0] : v))
    .some(v => String(v).replace(/[^0-9]/g, '') + '@s.whatsapp.net' === m.sender)

  if (!isOwner) return

  // ⏱️ Cooldown
  if (lastUse[m.sender] && Date.now() - lastUse[m.sender] < cooldown) {
    return m.reply('⏳ Espera unos segundos para volver a jugar')
  }
  lastUse[m.sender] = Date.now()

  // 👤 Crear usuario si no existe
  if (!global.db.data.users[m.sender]) {
    global.db.data.users[m.sender] = { money: 1000 }
  }

  let user = global.db.data.users[m.sender]

  if (!user.money || user.money < 0) user.money = 1000

  // 🎰 Jackpot global
  if (!global.db.data.jackpot) global.db.data.jackpot = 5000

  const menu = `
╔═══🎰 *CASINO OWNER VIP* 🎰═══╗
║
║ 🎲 ${usedPrefix}slot
║ 🎰 ${usedPrefix}ruleta
║ 🃏 ${usedPrefix}blackjack
║ 💎 ${usedPrefix}apostar <cantidad>
║ 💰 ${usedPrefix}balance
║ 🎯 ${usedPrefix}doble
║ 🪙 ${usedPrefix}coinflip
║ 🎲 ${usedPrefix}dados
║ 🎁 ${usedPrefix}premio
║ 🏆 ${usedPrefix}jackpot
║
╚════════════════════╝

👑 Propietario detectado
💰 Dinero: ${user.money}
🏆 Jackpot: ${global.db.data.jackpot}
`

  // 🎰 MENU
  if (/^(menucasino|casino)$/i.test(command)) {
    return conn.reply(m.chat, menu, m)
  }

  // 💰 BALANCE
  if (command === 'balance') {
    return conn.reply(m.chat, `💰 Tu dinero actual: ${user.money}`, m)
  }

  // 🎲 SLOT
  if (command === 'slot') {
    let emojis = ['🍒','🍇','🍉','⭐','💎']
    let a = emojis[Math.floor(Math.random()*emojis.length)]
    let b = emojis[Math.floor(Math.random()*emojis.length)]
    let c = emojis[Math.floor(Math.random()*emojis.length)]

    let win = (a === b && b === c)

    if (win) {
      user.money += 500
      global.db.data.jackpot += 200
      return conn.reply(m.chat,
`🎰 ${a} | ${b} | ${c}

💎 ¡GANASTE 500!
💰 Dinero: ${user.money}`, m)
    } else {
      user.money = Math.max(0, user.money - 100)
      global.db.data.jackpot += 100
      return conn.reply(m.chat,
`🎰 ${a} | ${b} | ${c}

❌ Perdiste 100
💰 Dinero: ${user.money}`, m)
    }
  }

  // 🎰 RULETA
  if (command === 'ruleta') {
    let win = Math.random() < 0.5
    if (win) {
      user.money += 300
      return conn.reply(m.chat, `🎰 La ruleta giró...\n💚 GANASTE 300`, m)
    } else {
      user.money = Math.max(0, user.money - 150)
      return conn.reply(m.chat, `🎰 La ruleta giró...\n💔 Perdiste 150`, m)
    }
  }

  // 🃏 BLACKJACK
  if (command === 'blackjack') {
    let player = Math.floor(Math.random()*21)+1
    let dealer = Math.floor(Math.random()*21)+1

    if (player > dealer) {
      user.money += 400
      return conn.reply(m.chat,
`🃏 Blackjack

👤 Tú: ${player}
🤖 Dealer: ${dealer}

🔥 GANASTE 400`, m)
    } else {
      user.money = Math.max(0, user.money - 200)
      return conn.reply(m.chat,
`🃏 Blackjack

👤 Tú: ${player}
🤖 Dealer: ${dealer}

💀 Perdiste 200`, m)
    }
  }

  // 💎 APOSTAR
  if (command === 'apostar') {
    let bet = parseInt(args[0])

    if (!bet || bet <= 0) return m.reply(`💰 Ejemplo: ${usedPrefix}apostar 100`)
    if (bet > user.money) return m.reply('❌ No tienes suficiente dinero')

    let win = Math.random() < 0.5

    if (win) {
      user.money += bet
      return conn.reply(m.chat, `🎉 Ganaste ${bet}`, m)
    } else {
      user.money = Math.max(0, user.money - bet)
      return conn.reply(m.chat, `💀 Perdiste ${bet}`, m)
    }
  }

  // 🎯 DOBLE
  if (command === 'doble') {
    if (user.money <= 0) return m.reply('❌ No tienes dinero')

    let win = Math.random() < 0.5

    if (win) {
      user.money *= 2
      return conn.reply(m.chat, `🔥 DINERO DOBLADO\n💰 ${user.money}`, m)
    } else {
      user.money = 0
      return conn.reply(m.chat, `💀 Perdiste todo`, m)
    }
  }

  // 🪙 COINFLIP
  if (command === 'coinflip') {
    let result = Math.random() < 0.5 ? 'Cara 🪙' : 'Cruz 🪙'
    return conn.reply(m.chat, `🪙 Resultado: ${result}`, m)
  }

  // 🎲 DADOS
  if (command === 'dados') {
    let dice = Math.floor(Math.random()*6)+1
    let reward = dice * 20
    user.money += reward

    return conn.reply(m.chat,
`🎲 Sacaste: ${dice}

💰 Ganaste: ${reward}`, m)
  }

  // 🎁 PREMIO
  if (command === 'premio') {
    let reward = Math.floor(Math.random()*500)+100
    user.money += reward
    return conn.reply(m.chat, `🎁 Premio recibido: ${reward}`, m)
  }

  // 🏆 JACKPOT
  if (command === 'jackpot') {

    let win = Math.random() < 0.2

    if (win) {
      let reward = global.db.data.jackpot
      user.money += reward
      global.db.data.jackpot = 5000

      return conn.reply(m.chat,
`🏆 JACKPOT GANADO!!!

💰 Premio: ${reward}
💎 Nuevo saldo: ${user.money}`, m)
    } else {
      user.money = Math.max(0, user.money - 300)
      global.db.data.jackpot += 300

      return conn.reply(m.chat,
`💀 No hubo jackpot

💰 Dinero: ${user.money}
🏆 Jackpot acumulado: ${global.db.data.jackpot}`, m)
    }
  }

}

handler.help = [
  'menucasino','casino','slot','ruleta','blackjack',
  'apostar','balance','doble','coinflip','dados',
  'premio','jackpot'
]

handler.tags = ['owner']
handler.command = /^(menucasino|casino|slot|ruleta|blackjack|apostar|balance|doble|coinflip|dados|premio|jackpot)$/i

export default handler
