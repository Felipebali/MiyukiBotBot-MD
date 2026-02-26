// 🔹 handler amoroso completo — FELI 2026
import fs from 'fs'
import path from 'path'

const dir = './database'
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const file = path.join(dir, 'parejas.json')
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
    const dias = Math.floor(ms / 86400000)
    return `${dias} días`
  }

  // ======================
  // Protección de pareja
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
  // 💌 PROPUESTA
  // ======================
  if (command === 'pareja') {
    const target = getTarget()
    if (!target) return m.reply('💌 Menciona o responde al mensaje de la persona.')
    if (target === sender) return m.reply('😹 No puedes ser pareja contigo mismo.')

    const user = getUser(sender)
    const tu = getUser(target)

    if (user.estado !== 'soltero')
      return m.reply(`😡 Ya tienes pareja con ${tag(user.pareja)}`)
    if (tu.estado !== 'soltero')
      return m.reply(`😳 ${tag(target)} ya tiene pareja con ${tag(tu.pareja)}`)

    tu.propuesta = sender
    tu.propuestaFecha = ahora

    saveDB(db)

    return conn.reply(m.chat,
      `💖 *Propuesta de Amor*\n\n${tag(sender)} quiere estar con ${tag(target)} ❤️\n\nResponde:\n👉 *.aceptar*\n👉 *.rechazar*`,
      m, { mentions: [sender, target] })
  }

  // ======================
  // ✅ ACEPTAR
  // ======================
  if (command === 'aceptar') {
    const user = getUser(sender)
    if (!user.propuesta) return m.reply('💭 No tienes propuestas.')

    const proposer = user.propuesta
    const proposerUser = getUser(proposer)

    if (user.propuestaFecha && ahora - user.propuestaFecha > 86400000) {
      user.propuesta = null
      saveDB(db)
      return m.reply('⏳ La propuesta ha expirado.')
    }

    user.estado = 'novios'
    proposerUser.estado = 'novios'
    user.pareja = proposer
    proposerUser.pareja = sender
    user.relacionFecha = ahora
    proposerUser.relacionFecha = ahora
    user.propuesta = null

    saveDB(db)

    return conn.reply(m.chat, `💞 *¡Ahora son pareja!*\n\n${tag(sender)} ❤️ ${tag(proposer)}`, m, { mentions: [sender, proposer] })
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

    return conn.reply(m.chat, `💔 ${tag(sender)} rechazó a ${tag(proposer)}`, m, { mentions: [sender, proposer] })
  }

  // ======================
  // ❌ TERMINAR RELACIÓN
  // ======================
  if (command === 'terminar') {
    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 No tienes pareja para terminar la relación 😢')

    const parejaId = user.pareja
    const pareja = getUser(parejaId)

    user.pareja = null
    user.estado = 'soltero'
    user.relacionFecha = null
    user.matrimonioFecha = null
    user.amor = 0

    pareja.pareja = null
    pareja.estado = 'soltero'
    pareja.relacionFecha = null
    pareja.matrimonioFecha = null
    pareja.amor = 0

    saveDB(db)
    return conn.reply(m.chat, `💔 ${tag(sender)} terminó la relación con ${tag(parejaId)}`, m, { mentions: [sender, parejaId] })
  }

  // ======================
  // 💍 CASARSE / DIVORCIAR
  // ======================
  if (command === 'casarse') {
    const user = getUser(sender)
    const target = getTarget()
    if (!target) return m.reply('💍 Menciona a la persona con la que quieres casarte.')
    if (user.pareja !== target) return m.reply('❌ Solo puedes casarte con tu pareja actual.')
    if (user.matrimonioFecha) return m.reply('💒 Ya estás casado/a.')

    user.matrimonioFecha = ahora
    const pareja = getUser(target)
    pareja.matrimonioFecha = ahora
    saveDB(db)

    return conn.reply(m.chat, `💒 ¡Felicidades! ${tag(sender)} se casó con ${tag(target)} ❤️`, m, { mentions: [sender, target] })
  }

  if (command === 'divorciar') {
    const user = getUser(sender)
    const target = getTarget()
    if (!target) return m.reply('💔 Menciona a la persona con la que quieres divorciarte.')
    if (user.pareja !== target) return m.reply('❌ Solo puedes divorciarte de tu pareja actual.')
    if (!user.matrimonioFecha) return m.reply('💒 No estás casado/a.')

    user.matrimonioFecha = null
    const pareja = getUser(target)
    pareja.matrimonioFecha = null
    saveDB(db)

    return conn.reply(m.chat, `💔 ${tag(sender)} se divorció de ${tag(target)}`, m, { mentions: [sender, target] })
  }

  // ======================
  // 💋 / 🤗 / ❤️ / 📊 Interacciones
  // ======================
  if (['besar','abrazar','amor','relacion'].includes(command)) {
    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 No tienes pareja 😢')

    const target = getTarget()
    const mensajeProtegido = validarInteraccion(target)
    if (mensajeProtegido) return m.reply(mensajeProtegido)

    const pareja = getUser(user.pareja)

    switch(command) {
      case 'besar':
        user.amor += 5
        pareja.amor = user.amor
        saveDB(db)
        return conn.reply(m.chat, `💋 ${tag(sender)} besó a ${tag(user.pareja)}\n❤️ Amor: ${user.amor}`, m, { mentions: [sender, user.pareja] })
      case 'abrazar':
        user.amor += 3
        pareja.amor = user.amor
        saveDB(db)
        return conn.reply(m.chat, `🤗 ${tag(sender)} abrazó a ${tag(user.pareja)}\n❤️ Amor: ${user.amor}`, m, { mentions: [sender, user.pareja] })
      case 'amor':
        user.amor += 10
        pareja.amor = user.amor
        saveDB(db)
        return conn.reply(m.chat, `❤️ Amor aumentado\n${tag(sender)} 💕 ${tag(user.pareja)}\nNivel: ${user.amor}`, m, { mentions: [sender, user.pareja] })
      case 'relacion':
        const tiempoJuntos = tiempo(ahora - user.relacionFecha)
        return conn.reply(m.chat, `💑 *Relación*\n${tag(sender)} ❤️ ${tag(user.pareja)}\nEstado: ${user.estado}\nTiempo: ${tiempoJuntos}\nAmor: ${user.amor}`, m, { mentions: [sender, user.pareja] })
    }
  }

  // ======================
  // 📜 LISTA DE PAREJAS (solo owner)
  // ======================
  if (command === 'listapareja') {
    if (!ownersJid.includes(sender)) return m.reply('❌ Solo el dueño puede usar este comando.')

    let texto = '💞 *Parejas activas*\n\n'
    let mentions = []
    for (let id in db) {
      const user = db[id]
      if (user.pareja && id < user.pareja) {
        texto += `💖 ${tag(id)} ❤️ ${tag(user.pareja)}\n`
        mentions.push(id, user.pareja)
      }
    }
    if (!mentions.length) texto += '😿 No hay parejas.'
    return conn.reply(m.chat, texto, m, { mentions })
  }

  // ======================
  // 🧹 CLEARSHIP (borrar todo) — solo owner
  // ======================
  if (command === 'clearship') {
    if (!ownersJid.includes(sender)) return m.reply('❌ Solo el dueño puede usar este comando.')

    for (let id in db) {
      const user = db[id]
      user.pareja = null
      user.estado = 'soltero'
      user.propuesta = null
      user.propuestaFecha = null
      user.relacionFecha = null
      user.matrimonioFecha = null
      user.amor = 0
    }
    saveDB(db)
    return m.reply('🧹 Todas las parejas y propuestas fueron eliminadas.')
  }
}

handler.command = [
  'pareja','aceptar','rechazar','terminar','casarse','divorciar',
  'relacion','amor','besar','abrazar','listapareja','clearship'
]

export default handler
