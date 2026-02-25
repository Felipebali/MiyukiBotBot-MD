import fs from 'fs'
import path from 'path'

const dir = './database'
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const file = path.join(dir, 'parejas.json')
if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}, null, 2))

const loadDB = () => JSON.parse(fs.readFileSync(file))
const saveDB = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

let handler = async (m, { conn, command }) => {

  let db = loadDB()
  const sender = m.sender
  const ahora = Date.now()

  const getUser = (id) => {
    if (!db[id]) {
      db[id] = {
        pareja: null,
        estado: 'soltero',
        propuesta: null,
        propuestaFecha: null,
        relacionFecha: null,
        matrimonioFecha: null,
        amor: 0
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
    let dias = Math.floor(ms / 86400000)
    return `${dias} días`
  }

  // ======================
  // 💌 PROPUESTA
  // ======================
  if (command === 'pareja') {

    const target = getTarget()
    if (!target) return m.reply('💌 Menciona o responde al mensaje de la persona.')

    if (target === sender) return m.reply('😹 No puedes ser pareja contigo mismo.')

    const user = getUser(sender)
    const tu = getUser(target)

    if (user.estado !== 'soltero')
      return conn.reply(m.chat,
        `😡 Ya tienes pareja con ${tag(user.pareja)}`,
        m, { mentions: [sender, user.pareja] })

    if (tu.estado !== 'soltero')
      return conn.reply(m.chat,
        `😳 ${tag(target)} ya tiene pareja con ${tag(tu.pareja)}`,
        m, { mentions: [target, tu.pareja] })

    tu.propuesta = sender
    tu.propuestaFecha = ahora

    saveDB(db)

    return conn.reply(m.chat,
      `💖 *Propuesta de Amor*

${tag(sender)} quiere estar con ${tag(target)} ❤️

Responde:
👉 *.aceptar*
👉 *.rechazar*`,
      m, { mentions: [sender, target] })
  }

  // ======================
  // ✅ ACEPTAR
  // ======================
  if (command === 'aceptar') {

    const user = getUser(sender)

    if (!user.propuesta)
      return m.reply('💭 No tienes propuestas.')

    const proposer = user.propuesta
    const proposerUser = getUser(proposer)

    user.estado = 'novios'
    proposerUser.estado = 'novios'

    user.pareja = proposer
    proposerUser.pareja = sender

    user.relacionFecha = ahora
    proposerUser.relacionFecha = ahora

    user.propuesta = null

    saveDB(db)

    return conn.reply(m.chat,
      `💞 *¡Ahora son pareja!*

${tag(sender)} ❤️ ${tag(proposer)}`,
      m, { mentions: [sender, proposer] })
  }

  // ======================
  // ❌ RECHAZAR
  // ======================
  if (command === 'rechazar') {

    const user = getUser(sender)

    if (!user.propuesta)
      return m.reply('💭 No tienes propuestas.')

    const proposer = user.propuesta

    user.propuesta = null

    saveDB(db)

    return conn.reply(m.chat,
      `💔 ${tag(sender)} rechazó a ${tag(proposer)}`,
      m, { mentions: [sender, proposer] })
  }

  // ======================
  // 💍 CASARSE
  // ======================
  if (command === 'casarse') {

    const user = getUser(sender)

    if (!user.pareja)
      return m.reply('💔 No tienes pareja.')

    if (user.estado === 'casados')
      return m.reply('💍 Ya están casados.')

    const dias = ahora - user.relacionFecha

    if (dias < 7 * 86400000)
      return m.reply('⏳ Deben estar 7 días de novios para casarse.')

    const pareja = getUser(user.pareja)

    user.estado = 'casados'
    pareja.estado = 'casados'

    user.matrimonioFecha = ahora
    pareja.matrimonioFecha = ahora

    saveDB(db)

    return conn.reply(m.chat,
      `💍 *¡Boda realizada!*

${tag(sender)} 💖 ${tag(user.pareja)}

Ahora están casados 🥂`,
      m, { mentions: [sender, user.pareja] })
  }

  // ======================
  // 💔 TERMINAR NOVIAZGO
  // ======================
  if (command === 'terminar') {

    const user = getUser(sender)

    if (!user.pareja)
      return m.reply('💔 No tienes pareja.')

    if (user.estado === 'casados')
      return m.reply('⚠️ Están casados, usa *.divorciar*')

    const parejaID = user.pareja
    const pareja = getUser(parejaID)

    user.estado = 'soltero'
    pareja.estado = 'soltero'

    user.pareja = null
    pareja.pareja = null

    saveDB(db)

    return conn.reply(m.chat,
      `💔 *Ruptura*

${tag(sender)} terminó con ${tag(parejaID)}`,
      m, { mentions: [sender, parejaID] })
  }

  // ======================
  // ⚖️ DIVORCIO
  // ======================
  if (command === 'divorciar') {

    const user = getUser(sender)

    if (!user.pareja)
      return m.reply('💔 No tienes pareja.')

    if (user.estado !== 'casados')
      return m.reply('⚠️ No están casados.')

    const parejaID = user.pareja
    const pareja = getUser(parejaID)

    user.estado = 'soltero'
    pareja.estado = 'soltero'

    user.pareja = null
    pareja.pareja = null

    saveDB(db)

    return conn.reply(m.chat,
      `⚖️ *Divorcio realizado*

${tag(sender)} 💔 ${tag(parejaID)}`,
      m, { mentions: [sender, parejaID] })
  }

  // ======================
  // 💋 BESAR
  // ======================
  if (command === 'besar') {

    const target = getTarget()
    if (!target) return m.reply('💋 Menciona a alguien.')

    const user = getUser(sender)
    const tu = getUser(target)

    // target tiene pareja y no sos vos
    if (tu.pareja && tu.pareja !== sender) {
      return conn.reply(m.chat,
        `🚨 *ESA PERSONA TIENE PAREJA*

${tag(target)} está con ${tag(tu.pareja)} ❤️`,
        m, { mentions: [target, tu.pareja] })
    }

    if (!user.pareja)
      return m.reply('💔 No tienes pareja.')

    if (target !== user.pareja) {
      return conn.reply(m.chat,
        `😡 Tu pareja es ${tag(user.pareja)} no ${tag(target)}`,
        m, { mentions: [user.pareja, target] })
    }

    const pareja = getUser(user.pareja)

    user.amor += 5
    pareja.amor = user.amor

    saveDB(db)

    return conn.reply(m.chat,
      `💋 ${tag(sender)} besó a ${tag(user.pareja)}

❤️ Amor: ${user.amor}`,
      m, { mentions: [sender, user.pareja] })
  }

  // ======================
  // 🤗 ABRAZAR
  // ======================
  if (command === 'abrazar') {

    const target = getTarget()
    if (!target) return m.reply('🤗 Menciona a alguien.')

    const user = getUser(sender)
    const tu = getUser(target)

    if (tu.pareja && tu.pareja !== sender) {
      return conn.reply(m.chat,
        `🚨 *ESA PERSONA TIENE PAREJA*

${tag(target)} está con ${tag(tu.pareja)} ❤️`,
        m, { mentions: [target, tu.pareja] })
    }

    if (!user.pareja)
      return m.reply('💔 No tienes pareja.')

    if (target !== user.pareja) {
      return conn.reply(m.chat,
        `😡 Tu pareja es ${tag(user.pareja)}`,
        m, { mentions: [user.pareja] })
    }

    const pareja = getUser(user.pareja)

    user.amor += 3
    pareja.amor = user.amor

    saveDB(db)

    return conn.reply(m.chat,
      `🤗 ${tag(sender)} abrazó a ${tag(user.pareja)}

❤️ Amor: ${user.amor}`,
      m, { mentions: [sender, user.pareja] })
  }

  // ======================
  // ❤️ AMOR
  // ======================
  if (command === 'amor') {

    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 No tienes pareja.')

    const pareja = getUser(user.pareja)

    user.amor += 10
    pareja.amor = user.amor

    saveDB(db)

    return conn.reply(m.chat,
      `❤️ Amor aumentado

${tag(sender)} 💕 ${tag(user.pareja)}

Nivel: ${user.amor}`,
      m, { mentions: [sender, user.pareja] })
  }

  // ======================
  // 📊 RELACION
  // ======================
  if (command === 'relacion') {

    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 Estás soltero.')

    const parejaID = user.pareja
    const tiempoJuntos = tiempo(ahora - user.relacionFecha)

    return conn.reply(m.chat,
      `💑 *Relación*

${tag(sender)} ❤️ ${tag(parejaID)}

Estado: ${user.estado}
Tiempo: ${tiempoJuntos}
Amor: ${user.amor}`,
      m, { mentions: [sender, parejaID] })
  }

  // ======================
  // 📜 LISTA
  // ======================
  if (command === 'listapareja') {

    let texto = '💞 *Parejas activas*\n\n'
    let mentions = []

    for (let id in db) {
      let user = db[id]
      if (user.pareja && id < user.pareja) {
        texto += `💖 ${tag(id)} ❤️ ${tag(user.pareja)}\n`
        mentions.push(id, user.pareja)
      }
    }

    if (mentions.length === 0) texto += '😿 No hay parejas.'

    return conn.reply(m.chat, texto, m, { mentions })
  }

}

handler.command = [
  'pareja',
  'aceptar',
  'rechazar',
  'terminar',
  'casarse',
  'divorciar',
  'relacion',
  'amor',
  'besar',
  'abrazar',
  'listapareja'
]

export default handler
