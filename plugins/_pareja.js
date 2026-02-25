import fs from 'fs'
import path from 'path'

const dir = './database'
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const file = path.join(dir, 'parejas.json')
if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}, null, 2))

const loadDB = () => JSON.parse(fs.readFileSync(file))
const saveDB = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

const TIEMPO_PROPUESTA = 24 * 60 * 60 * 1000 // 24 horas

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
  // 🔒 Validación de parejas
  // ======================
  const validarInteraccion = (target) => {
    if (!target) return null
    const t = getUser(target)
    if (t.pareja && t.pareja !== sender) {
      const frases = [
        `🚨 ¡Alerta! ${tag(target)} ya tiene pareja (${tag(t.pareja)}) 😤 No intentes nada 💔`,
        `😳 ¡Cuidado! El corazón de ${tag(target)} está ocupado con ${tag(t.pareja)} ❤️`,
        `💘 ¡No seas travieso! ${tag(target)} ya está en una relación 💑`,
        `🙅‍♂️ ¡Stop! ${tag(target)} ya tiene dueño/a: ${tag(t.pareja)} 💖`
      ]
      return frases[Math.floor(Math.random() * frases.length)]
    }
    return null
  }

  // ======================
  // ⏰ Limpiar propuestas vencidas
  // ======================
  Object.keys(db).forEach(id => {
    const u = db[id]
    if (u.propuesta && u.propuestaFecha && (ahora - u.propuestaFecha > TIEMPO_PROPUESTA)) {
      const proposer = u.propuesta
      u.propuesta = null
      u.propuestaFecha = null
      conn.sendMessage(
        m.chat,
        { text: `💔 La propuesta de ${tag(proposer)} a ${tag(id)} ha expirado.` }
      )
    }
  })
  saveDB(db)

  // ======================
  // 💌 PROPUESTA
  // ======================
  if (command === 'pareja') {
    const target = getTarget()
    if (!target) return m.reply('💌 Menciona o responde al mensaje de la persona.')
    if (target === sender) return m.reply('😹 No puedes ser pareja contigo mismo.')

    const user = getUser(sender)
    const tu = getUser(target)

    const protegido = validarInteraccion(target)
    if (protegido) return m.reply(protegido)

    if (user.estado !== 'soltero')
      return m.reply(`😡 Ya tienes pareja con ${tag(user.pareja)}`)
    if (tu.estado !== 'soltero')
      return m.reply(`😳 ${tag(target)} ya tiene pareja con ${tag(tu.pareja)}`)

    tu.propuesta = sender
    tu.propuestaFecha = ahora
    saveDB(db)

    return conn.reply(m.chat,
      `💖 *Propuesta de Amor*\n\n${tag(sender)} quiere estar con ${tag(target)} ❤️\n\nResponde:\n👉 *.aceptar*\n👉 *.rechazar*\n⏱ Tienes 24 horas para aceptar.`,
      m, { mentions: [sender, target] })
  }

  // ======================
  // ✅ ACEPTAR
  // ======================
  if (command === 'aceptar') {
    const user = getUser(sender)
    if (!user.propuesta) return m.reply('💭 No tienes propuestas.')

    const proposer = user.propuesta
    const protegido = validarInteraccion(proposer)
    if (protegido) return m.reply(protegido)

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
      `💞 *¡Ahora son pareja!*\n\n${tag(sender)} ❤️ ${tag(proposer)}`,
      m, { mentions: [sender, proposer] })
  }

  // ======================
  // ❌ RECHAZAR
  // ======================
  if (command === 'rechazar') {
    const user = getUser(sender)
    if (!user.propuesta) return m.reply('💭 No tienes propuestas.')

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
    if (!user.pareja) return m.reply('💔 No tienes pareja.')
    if (user.estado === 'casados') return m.reply('💍 Ya están casados.')

    const dias = ahora - user.relacionFecha
    if (dias < 7 * 86400000) return m.reply('⏳ Deben estar 7 días de novios para casarse.')

    const pareja = getUser(user.pareja)
    user.estado = 'casados'
    pareja.estado = 'casados'
    user.matrimonioFecha = ahora
    pareja.matrimonioFecha = ahora

    saveDB(db)

    return conn.reply(m.chat,
      `💍 *¡Boda realizada!*\n\n${tag(sender)} 💖 ${tag(user.pareja)}\nAhora están casados 🥂`,
      m, { mentions: [sender, user.pareja] })
  }

  // ======================
  // 💔 TERMINAR NOVIAZGO
  // ======================
  if (command === 'terminar') {
    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 No tienes pareja.')
    if (user.estado === 'casados') return m.reply('⚠️ Están casados, usa *.divorciar*')

    const parejaID = user.pareja
    const pareja = getUser(parejaID)
    user.estado = 'soltero'
    pareja.estado = 'soltero'
    user.pareja = null
    pareja.pareja = null

    saveDB(db)

    return conn.reply(m.chat,
      `💔 *Ruptura*\n\n${tag(sender)} terminó con ${tag(parejaID)}`,
      m, { mentions: [sender, parejaID] })
  }

  // ======================
  // ⚖️ DIVORCIO
  // ======================
  if (command === 'divorciar') {
    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 No tienes pareja.')
    if (user.estado !== 'casados') return m.reply('⚠️ No están casados.')

    const parejaID = user.pareja
    const pareja = getUser(parejaID)
    user.estado = 'soltero'
    pareja.estado = 'soltero'
    user.pareja = null
    pareja.pareja = null

    saveDB(db)

    return conn.reply(m.chat,
      `⚖️ *Divorcio realizado*\n\n${tag(sender)} 💔 ${tag(parejaID)}`,
      m, { mentions: [sender, parejaID] })
  }

  // ======================
  // 💋 BESAR / 🤗 ABRAZAR / ❤️ AMOR / 📊 RELACION
  // ======================
  const acciones = { 'besar': 5, 'abrazar': 3, 'amor': 10 }
  if (Object.keys(acciones).includes(command)) {
    const target = getTarget()
    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 No tienes pareja.')

    const mensajeProtegido = validarInteraccion(target)
    if (mensajeProtegido) return m.reply(mensajeProtegido)
    if (target && target !== user.pareja) return m.reply(`😡 Tu pareja es ${tag(user.pareja)} no ${tag(target)}`)

    const pareja = getUser(user.pareja)
    user.amor += acciones[command]
    pareja.amor = user.amor
    saveDB(db)

    const mensajes = {
      'besar': `💋 ${tag(sender)} besó a ${tag(user.pareja)}\n\n❤️ Amor: ${user.amor}`,
      'abrazar': `🤗 ${tag(sender)} abrazó a ${tag(user.pareja)}\n\n❤️ Amor: ${user.amor}`,
      'amor': `❤️ Amor aumentado\n\n${tag(sender)} 💕 ${tag(user.pareja)}\n\nNivel: ${user.amor}`
    }

    return m.reply(mensajes[command])
  }

  if (command === 'relacion') {
    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 Estás soltero.')

    const parejaID = user.pareja
    const tiempoJuntos = tiempo(ahora - user.relacionFecha)

    return conn.reply(m.chat,
      `💑 *Relación*\n\n${tag(sender)} ❤️ ${tag(parejaID)}\n\nEstado: ${user.estado}\nTiempo: ${tiempoJuntos}\nAmor: ${user.amor}`,
      m, { mentions: [sender, parejaID] })
  }

  // ======================
  // 📜 LISTA DE PAREJAS
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

  // ======================
  // 🧹 CLEARCHIP: BORRAR TODO
  // ======================
  if (command === 'clearship') {
    Object.keys(db).forEach(id => {
      db[id].pareja = null
      db[id].estado = 'soltero'
      db[id].propuesta = null
      db[id].propuestaFecha = null
      db[id].relacionFecha = null
      db[id].matrimonioFecha = null
      db[id].amor = 0
    })
    saveDB(db)
    return m.reply('🧹 Se han borrado todas las parejas y propuestas 💔')
  }

}

handler.command = [
  'pareja', 'aceptar', 'rechazar',
  'terminar', 'casarse', 'divorciar',
  'relacion', 'amor', 'besar', 'abrazar', 'listapareja', 'clearship'
]

export default handler
