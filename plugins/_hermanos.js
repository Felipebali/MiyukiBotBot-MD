// 🔹 handler hermanos completo — FELI 2026 PRO

import fs from 'fs'
import path from 'path'

const dir = './database'
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const file = path.join(dir, 'hermanos.json')
if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}, null, 2))

const loadDB = () => JSON.parse(fs.readFileSync(file))
const saveDB = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

function getOwnersJid() {
  return (global.owner || [])
    .map(v => {
      if (Array.isArray(v)) v = v[0]
      if (typeof v !== 'string') return null
      return v.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    })
    .filter(Boolean)
}

let handler = async (m, { conn, command }) => {

  const db = loadDB()
  const sender = conn.decodeJid(m.sender)
  const ahora = Date.now()
  const ownersJid = getOwnersJid()

  const getUser = (id) => {
    if (!db[id]) {
      db[id] = {
        hermano: null,
        propuesta: null,
        propuestaFecha: null,
        hermandadFecha: null,
        nivel: 0,
        interacciones: 0,
        cooldown: 0
      }
    }
    return db[id]
  }

  const getTarget = () => {
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    if (m.quoted?.sender) return m.quoted.sender
    return null
  }

  const tag = (id) => '@' + id.split('@')[0]

  const fechaBonita = (ms) => {
    if (!ms) return 'Desconocida'
    const d = new Date(ms)
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const rango = (nivel) => {
    if (nivel >= 200) return '🔥 Hermanos Legendarios'
    if (nivel >= 120) return '💪 Hermanos Fuertes'
    if (nivel >= 60) return '🤝 Hermanos Reales'
    if (nivel >= 30) return '🙂 Hermanos Cercanos'
    return '👶 Hermanos Nuevos'
  }

  const checkCooldown = (user) => {
    if (Date.now() - user.cooldown < 60000)
      return true
    user.cooldown = Date.now()
    return false
  }

  // ======================
  // 🤝 PROPUESTA HERMANO
  // ======================

  if (command === 'hermano') {

    const target = getTarget()
    if (!target) return m.reply('🤝 Menciona o responde al mensaje.')
    if (target === sender) return m.reply('😹 No puedes ser tu propio hermano.')

    const user = getUser(sender)
    const tu = getUser(target)

    if (user.hermano)
      return m.reply(`😎 Ya tienes hermano: ${tag(user.hermano)}`)

    if (tu.hermano)
      return m.reply(`😅 ${tag(target)} ya tiene hermano.`)

    tu.propuesta = sender
    tu.propuestaFecha = ahora

    saveDB(db)

    return conn.reply(m.chat,
`🤝 *Propuesta de Hermandad*

${tag(sender)} quiere ser hermano de ${tag(target)} 🧬

Responde:
👉 *.aceptarhermano*
👉 *.rechazarhermano*`,
m,{mentions:[sender,target]})
  }

  // ======================
  // 👀 VER HERMANO
  // ======================

  if (command === 'verhermano') {

    const target = getTarget() || sender
    const user = getUser(target)

    if (!user.hermano)
      return m.reply('😹 Ese usuario no tiene hermano.')

    const dias = user.hermandadFecha
      ? Math.floor((Date.now() - user.hermandadFecha) / 86400000)
      : 0

    return conn.reply(m.chat,
`🧬 *Hermandad*

${tag(target)} 🤝 ${tag(user.hermano)}

🕒 Tiempo: ${dias} días
📅 Desde: ${fechaBonita(user.hermandadFecha)}

💪 Nivel: ${user.nivel}
🏅 Rango: ${rango(user.nivel)}
🎮 Interacciones: ${user.interacciones}`,
m,{mentions:[target,user.hermano]})
  }

  // ======================
  // ✅ ACEPTAR
  // ======================

  if (command === 'aceptarhermano') {

    const user = getUser(sender)
    if (!user.propuesta) return m.reply('💭 No tienes propuestas.')

    const proposer = user.propuesta
    const proposerUser = getUser(proposer)

    user.hermano = proposer
    proposerUser.hermano = sender

    user.hermandadFecha = ahora
    proposerUser.hermandadFecha = ahora

    user.propuesta = null

    saveDB(db)

    return conn.reply(m.chat,
`🧬 *¡Hermandad confirmada!*

${tag(sender)} 🤝 ${tag(proposer)}

📅 Desde: ${fechaBonita(ahora)}
💪 Ahora son hermanos oficiales`,
m,{mentions:[sender,proposer]})
  }

  // ======================
  // ❌ RECHAZAR
  // ======================

  if (command === 'rechazarhermano') {

    const user = getUser(sender)
    if (!user.propuesta) return m.reply('💭 No tienes propuestas.')

    const proposer = user.propuesta
    user.propuesta = null

    saveDB(db)

    return conn.reply(m.chat,
`😅 ${tag(sender)} rechazó la hermandad con ${tag(proposer)}`,
m,{mentions:[sender,proposer]})
  }

  // ======================
  // 💔 ROMPER
  // ======================

  if (command === 'romperhermandad') {

    const user = getUser(sender)
    if (!user.hermano) return m.reply('😹 No tienes hermano.')

    const broId = user.hermano
    const bro = getUser(broId)

    user.hermano = null
    bro.hermano = null

    user.hermandadFecha = null
    bro.hermandadFecha = null

    user.nivel = 0
    bro.nivel = 0

    saveDB(db)

    return conn.reply(m.chat,
`💔 ${tag(sender)} rompió la hermandad con ${tag(broId)}`,
m,{mentions:[sender,broId]})
  }

  // ======================
  // 🤜 INTERACCIONES
  // ======================

  if ([
    'abrazohermano',
    'proteger',
    'chocarhermano',
    'entrenarhermano',
    'relacionhermano'
  ].includes(command)) {

    const user = getUser(sender)
    if (!user.hermano) return m.reply('😹 No tienes hermano.')

    const bro = getUser(user.hermano)

    if (command !== 'relacionhermano') {
      if (checkCooldown(user))
        return m.reply('⏳ Espera 1 minuto para otra interacción.')
    }

    switch(command){

      case 'abrazohermano':
      user.nivel += 5
      user.interacciones++
      break

      case 'proteger':
      user.nivel += 10
      user.interacciones++
      break

      case 'chocarhermano':
      user.nivel += 7
      user.interacciones++
      break

      case 'entrenarhermano':
      user.nivel += 15
      user.interacciones++
      break

      case 'relacionhermano':

      const dias = user.hermandadFecha
      ? Math.floor((Date.now() - user.hermandadFecha) / 86400000)
      : 0

      return conn.reply(m.chat,
`🧬 *Hermandad*

${tag(sender)} 🤝 ${tag(user.hermano)}

🕒 Tiempo: ${dias} días
📅 Desde: ${fechaBonita(user.hermandadFecha)}

💪 Nivel: ${user.nivel}
🏅 Rango: ${rango(user.nivel)}
🎮 Interacciones: ${user.interacciones}`,
m,{mentions:[sender,user.hermano]})
    }

    bro.nivel = user.nivel
    bro.interacciones = user.interacciones

    saveDB(db)

    return conn.reply(m.chat,
`🤜 ${tag(sender)} interactuó con ${tag(user.hermano)}

💪 Nivel: ${user.nivel}
🏅 ${rango(user.nivel)}`,
m,{mentions:[sender,user.hermano]})
  }

  // ======================
  // 🏆 TOP HERMANOS
  // ======================

  if (command === 'tophermanos') {

    if (!ownersJid.includes(sender))
      return m.reply('❌ Solo el dueño.')

    const ranking = Object.entries(db)
      .filter(([id,u]) => u.hermano && id < u.hermano)
      .sort((a,b)=>b[1].nivel - a[1].nivel)
      .slice(0,5)

    let txt = '🏆 *TOP HERMANOS*\n\n'
    let mentions = []

    ranking.forEach(([id,u],i)=>{

      txt += `🥇 *${i+1}° Lugar*
${tag(id)} 🧬 ${tag(u.hermano)}
💪 Nivel: ${u.nivel}
🏅 ${rango(u.nivel)}

`

      mentions.push(id, u.hermano)

    })

    if (!mentions.length)
      txt += '😹 No hay hermanos aún.'

    return conn.reply(m.chat, txt.trim(), m, { mentions })
  }

  // ======================
  // 📜 LISTA HERMANOS
  // ======================

  if (command === 'listahermanos') {

    if (!ownersJid.includes(sender))
      return m.reply('❌ Solo el dueño.')

    let texto = '🧬 *Hermanos activos*\n\n'
    let mentions = []

    for (let id in db) {

      const user = db[id]

      if (user.hermano && id < user.hermano) {

        texto += `🤝 ${tag(id)} 🧬 ${tag(user.hermano)}
💪 Nivel: ${user.nivel}

`

        mentions.push(id,user.hermano)
      }
    }

    if (!mentions.length)
      texto += '😹 No hay hermanos activos.'

    return conn.reply(m.chat, texto.trim(), m, { mentions })
  }

  // ======================
  // 🧹 CLEAR
  // ======================

  if (command === 'clearbro') {

    if (!ownersJid.includes(sender))
      return m.reply('❌ Solo el dueño.')

    for (let id in db) {

      db[id] = {
        hermano: null,
        propuesta: null,
        propuestaFecha: null,
        hermandadFecha: null,
        nivel: 0,
        interacciones: 0,
        cooldown: 0
      }

    }

    saveDB(db)

    return m.reply('🧹 Todas las hermandades fueron eliminadas.')
  }
}

handler.command = [
  'hermano',
  'aceptarhermano',
  'rechazarhermano',
  'romperhermandad',
  'abrazohermano',
  'proteger',
  'chocarhermano',
  'entrenarhermano',
  'relacionhermano',
  'verhermano',
  'tophermanos',
  'listahermanos',
  'clearbro'
]

export default handler
