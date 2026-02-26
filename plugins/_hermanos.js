// 🔹 handler hermanos completo — FELI 2026
import fs from 'fs'
import path from 'path'

const dir = './database'
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const file = path.join(dir, 'hermanos.json')
if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}, null, 2))

const loadDB = () => JSON.parse(fs.readFileSync(file))
const saveDB = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

// 🧠 Sistema universal de owners
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
        nivel: 0
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

  const tiempo = (ms) => {
    const dias = Math.floor(ms / 86400000)
    return `${dias} días`
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
      `🤝 *Propuesta de Hermandad*\n\n${tag(sender)} quiere ser hermano de ${tag(target)} 🧬\n\nResponde:\n👉 *.aceptarhermano*\n👉 *.rechazarhermano*`,
      m, { mentions: [sender, target] })
  }

  // ======================
  // ✅ ACEPTAR
  // ======================
  if (command === 'aceptarhermano') {
    const user = getUser(sender)
    if (!user.propuesta) return m.reply('💭 No tienes propuestas.')

    const proposer = user.propuesta
    const proposerUser = getUser(proposer)

    if (user.propuestaFecha && ahora - user.propuestaFecha > 86400000) {
      user.propuesta = null
      saveDB(db)
      return m.reply('⏳ La propuesta expiró.')
    }

    user.hermano = proposer
    proposerUser.hermano = sender
    user.hermandadFecha = ahora
    proposerUser.hermandadFecha = ahora
    user.propuesta = null

    saveDB(db)

    return conn.reply(m.chat,
      `🧬 *¡Hermandad confirmada!*\n\n${tag(sender)} 🤝 ${tag(proposer)}\nAhora son hermanos oficiales 💪`,
      m, { mentions: [sender, proposer] })
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
      m, { mentions: [sender, proposer] })
  }

  // ======================
  // 💔 ROMPER HERMANDAD
  // ======================
  if (command === 'romperhermandad') {
    const user = getUser(sender)
    if (!user.hermano) return m.reply('😹 No tienes hermano.')

    const broId = user.hermano
    const bro = getUser(broId)

    user.hermano = null
    user.hermandadFecha = null
    user.nivel = 0

    bro.hermano = null
    bro.hermandadFecha = null
    bro.nivel = 0

    saveDB(db)

    return conn.reply(m.chat,
      `💔 ${tag(sender)} rompió la hermandad con ${tag(broId)}`,
      m, { mentions: [sender, broId] })
  }

  // ======================
  // 🤜 INTERACCIONES
  // ======================
  if (['abrazohermano','proteger','relacionhermano'].includes(command)) {

    const user = getUser(sender)
    if (!user.hermano) return m.reply('😹 No tienes hermano.')

    const bro = getUser(user.hermano)

    switch(command) {

      case 'abrazohermano':
        user.nivel += 5
        bro.nivel = user.nivel
        saveDB(db)
        return conn.reply(m.chat,
          `🫂 ${tag(sender)} abrazó a su hermano ${tag(user.hermano)}\n💪 Nivel de hermandad: ${user.nivel}`,
          m, { mentions: [sender, user.hermano] })

      case 'proteger':
        user.nivel += 10
        bro.nivel = user.nivel
        saveDB(db)
        return conn.reply(m.chat,
          `🛡️ ${tag(sender)} protegió a ${tag(user.hermano)} como un verdadero hermano 🔥\nNivel: ${user.nivel}`,
          m, { mentions: [sender, user.hermano] })

      case 'relacionhermano':
        const tiempoJuntos = tiempo(ahora - user.hermandadFecha)
        return conn.reply(m.chat,
          `🧬 *Hermandad*\n${tag(sender)} 🤝 ${tag(user.hermano)}\nTiempo: ${tiempoJuntos}\nNivel: ${user.nivel}`,
          m, { mentions: [sender, user.hermano] })
    }
  }

  // ======================
  // 📜 LISTA HERMANOS (owner)
  // ======================
  if (command === 'listahermanos') {
    if (!ownersJid.includes(sender)) return m.reply('❌ Solo el dueño.')

    let texto = '🧬 *Hermanos activos*\n\n'
    let mentions = []

    for (let id in db) {
      const user = db[id]
      if (user.hermano && id < user.hermano) {
        texto += `🤝 ${tag(id)} 🧬 ${tag(user.hermano)}\n`
        mentions.push(id, user.hermano)
      }
    }

    if (!mentions.length) texto += '😹 No hay hermanos.'
    return conn.reply(m.chat, texto, m, { mentions })
  }

  // ======================
  // 🧹 CLEAR BRO (owner)
  // ======================
  if (command === 'clearbro') {
    if (!ownersJid.includes(sender)) return m.reply('❌ Solo el dueño.')

    for (let id in db) {
      db[id] = {
        hermano: null,
        propuesta: null,
        propuestaFecha: null,
        hermandadFecha: null,
        nivel: 0
      }
    }

    saveDB(db)
    return m.reply('🧹 Todas las hermandades fueron eliminadas.')
  }
}

handler.command = [
  'hermano','aceptarhermano','rechazarhermano','romperhermandad',
  'abrazohermano','proteger','relacionhermano',
  'listahermanos','clearbro'
]

export default handler
