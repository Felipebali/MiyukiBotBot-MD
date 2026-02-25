// 🔹 handler amoroso con protección de parejas
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
    return `${dias} días de amor ❤️`
  }

  // =========================================
  // Protección de pareja (para cualquier interacción)
  // =========================================
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
  // 💌 PROPUESTA
  // ======================
  if (command === 'pareja') {
    const target = getTarget()
    if (!target) return m.reply('💌 Menciona o responde al mensaje de la persona que quieres conquistar 😏')
    if (target === sender) return m.reply('😹 ¡No puedes enamorarte de ti mismo!')

    const protegido = validarInteraccion(target)
    if (protegido) return m.reply(protegido)

    const user = getUser(sender)
    const tu = getUser(target)

    if (user.estado !== 'soltero')
      return m.reply(`😡 Ya estás en una relación con ${tag(user.pareja)} 💔 No puedes enamorarte de otra persona.`)

    tu.propuesta = sender
    tu.propuestaFecha = ahora
    saveDB(db)

    return conn.reply(m.chat,
      `💖 *¡Propuesta de Amor!* 💌

${tag(sender)} quiere conquistar a ${tag(target)} ❤️

Responde con:
👉 *.aceptar* para un amor eterno 🌹
👉 *.rechazar* si tu corazón dice que no 💔`,
      m, { mentions: [sender, target] })
  }

  // ======================
  // ✅ ACEPTAR
  // ======================
  if (command === 'aceptar') {
    const user = getUser(sender)
    if (!user.propuesta) return m.reply('💭 No tienes propuestas pendientes 😌')

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
      `💞 *¡Felicidades! Ahora son pareja oficial!* 💖

${tag(sender)} ❤️ ${tag(proposer)}

Que su amor crezca cada día más 🌹`,
      m, { mentions: [sender, proposer] })
  }

  // ======================
  // ❌ RECHAZAR
  // ======================
  if (command === 'rechazar') {
    const user = getUser(sender)
    if (!user.propuesta) return m.reply('💭 No tienes propuestas pendientes 😅')

    const proposer = user.propuesta
    const protegido = validarInteraccion(proposer)
    if (protegido) return m.reply(protegido)

    user.propuesta = null
    saveDB(db)

    return conn.reply(m.chat,
      `💔 ${tag(sender)} rechazó a ${tag(proposer)} 😢

A veces el corazón elige otro camino 💌`,
      m, { mentions: [sender, proposer] })
  }

  // ======================
  // 💋 BESAR / ABRAZAR / AMOR / RELACION
  // ======================
  if (['besar', 'abrazar', 'amor', 'relacion'].includes(command)) {
    const target = getTarget()
    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 No tienes pareja 😢')

    const mensajeProtegido = validarInteraccion(target)
    if (mensajeProtegido) return m.reply(mensajeProtegido)

    const pareja = getUser(user.pareja)

    if (command === 'besar') {
      user.amor += 5
      pareja.amor = user.amor
      saveDB(db)
      return conn.reply(m.chat,
        `💋 ${tag(sender)} besó a ${tag(user.pareja)} 😘\n\n❤️ Nivel de amor: ${user.amor}`,
        m, { mentions: [sender, user.pareja] })
    }

    if (command === 'abrazar') {
      user.amor += 3
      pareja.amor = user.amor
      saveDB(db)
      return conn.reply(m.chat,
        `🤗 ${tag(sender)} abrazó a ${tag(user.pareja)} 💞\n\n❤️ Nivel de amor: ${user.amor}`,
        m, { mentions: [sender, user.pareja] })
    }

    if (command === 'amor') {
      user.amor += 10
      pareja.amor = user.amor
      saveDB(db)
      return conn.reply(m.chat,
        `❤️ *Tu amor crece cada día más* 🌞\n\n${tag(sender)} 💕 ${tag(user.pareja)}\n\nNivel de amor: ${user.amor} 💖`,
        m, { mentions: [sender, user.pareja] })
    }

    if (command === 'relacion') {
      const tiempoJuntos = tiempo(ahora - user.relacionFecha)
      return conn.reply(m.chat,
        `💑 *Estado de la relación* 🌹\n\n${tag(sender)} ❤️ ${tag(user.pareja)}\n\nEstado: ${user.estado}\nTiempo juntos: ${tiempoJuntos}\nNivel de amor: ${user.amor} 💖`,
        m, { mentions: [sender, user.pareja] })
    }
  }

  // ======================
  // 📜 LISTA DE PAREJAS
  // ======================
  if (command === 'listapareja') {
    let texto = '💞 *Parejas activas* 💌\n\n'
    let mentions = []
    for (let id in db) {
      let user = db[id]
      if (user.pareja && id < user.pareja) {
        texto += `💖 ${tag(id)} ❤️ ${tag(user.pareja)}\n`
        mentions.push(id, user.pareja)
      }
    }
    if (mentions.length === 0) texto += '😿 ¡No hay parejas activas!'
    return conn.reply(m.chat, texto, m, { mentions })
  }
}

handler.command = [
  'pareja', 'aceptar', 'rechazar',
  'terminar', 'casarse', 'divorciar',
  'relacion', 'amor', 'besar', 'abrazar', 'listapareja'
]

export default handler
