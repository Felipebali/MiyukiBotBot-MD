// 🌸 FELI 2026 LOVE SUPREME — FULL PROTECT 💎

import fs from 'fs'
import path from 'path'

const dir = './database'
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const file = path.join(dir, 'parejas.json')
if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}, null, 2))

const loadDB = () => JSON.parse(fs.readFileSync(file))
const saveDB = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

const SIETE_DIAS = 7 * 24 * 60 * 60 * 1000

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
        propuestaMatrimonio: null,
        propuestaMatrimonioFecha: null,
        relacionFecha: null,
        matrimonioFecha: null,
        amor: 0
      }
    }
    return db[id]
  }

  const getTarget = () => {
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    if (m.quoted?.sender) return conn.decodeJid(m.quoted.sender)
    return null
  }

  const tag = (id) => '@' + id.split('@')[0]

  const tiempo = (ms) => {
    const dias = Math.floor(ms / 86400000)
    const horas = Math.floor((ms % 86400000) / 3600000)
    return `${dias} día(s) y ${horas} hora(s)`
  }

  const box = (title, text) => {
    return `╭━━━〔 ${title} 〕━━━⬣
${text}
╰━━━━━━━━━━━━━━━━⬣`
  }

  /* 💘 PROPUESTA */
  if (command === 'pareja') {

    const target = getTarget()
    if (!target) return m.reply('💌 Menciona a alguien.')
    if (target === sender) return m.reply('😹 No puedes proponerte a ti mismo.')

    const user = getUser(sender)
    const tu = getUser(target)

    if (user.pareja)
      return conn.reply(m.chat,
        box('💞 YA TIENES PAREJA',
`${tag(sender)} ❤️ ${tag(user.pareja)}
No puedes proponer estando en relación.`),
        m, { mentions: [sender, user.pareja] })

    if (tu.pareja)
      return conn.reply(m.chat,
        box('💔 PERSONA OCUPADA',
`${tag(target)} ❤️ ${tag(tu.pareja)}
Respeta relaciones ajenas.`),
        m, { mentions: [target, tu.pareja] })

    tu.propuesta = sender
    tu.propuestaFecha = ahora
    saveDB(db)

    return conn.reply(m.chat,
      box('💘 PROPUESTA DE AMOR',
`${tag(sender)} quiere estar con ${tag(target)} ❤️
Responde con:
✨ *.aceptar*
✨ *.rechazar*`),
      m, { mentions: [sender, target] })
  }

  /* 💖 ACEPTAR */
  if (command === 'aceptar') {

    const user = getUser(sender)
    if (!user.propuesta) return m.reply('💭 No tienes propuestas.')

    const proposer = user.propuesta
    const proposerUser = getUser(proposer)

    if (user.pareja || proposerUser.pareja)
      return m.reply('❌ Uno de los dos ya tiene pareja.')

    user.estado = 'novios'
    proposerUser.estado = 'novios'
    user.pareja = proposer
    proposerUser.pareja = sender
    user.relacionFecha = ahora
    proposerUser.relacionFecha = ahora
    user.propuesta = null
    proposerUser.propuesta = null

    saveDB(db)

    return conn.reply(m.chat,
      box('💞 NUEVA PAREJA',
`${tag(sender)} ❤️ ${tag(proposer)}
Ahora son novios 💑
Deben esperar 7 días para casarse.`),
      m, { mentions: [sender, proposer] })
  }

  /* ❌ RECHAZAR */
  if (command === 'rechazar') {
    const user = getUser(sender)
    if (!user.propuesta) return m.reply('❌ No tienes propuestas.')

    const proposer = user.propuesta
    user.propuesta = null
    saveDB(db)

    return conn.reply(m.chat,
      box('💔 PROPUESTA RECHAZADA',
`${tag(sender)} ha rechazado a ${tag(proposer)}.`),
      m, { mentions: [sender, proposer] })
  }

  /* 💑 RELACION */
  if (command === 'relacion') {
    const user = getUser(sender)
    if (!user.pareja)
      return m.reply('💔 No tienes pareja.')

    const estado = user.matrimonioFecha ? '💍 Casados' : '💑 Novios'
    const tiempoJuntos = tiempo(ahora - user.relacionFecha)

    return conn.reply(
      m.chat,
      box('💖 ESTADO DE RELACIÓN',
`${tag(sender)} ❤️ ${tag(user.pareja)}
Estado: ${estado}
Tiempo juntos: ${tiempoJuntos}
Nivel de amor: ❤️ ${user.amor}`),
      m,
      { mentions: [sender, user.pareja] }
    )
  }

  /* 💍 CASARSE */
  if (command === 'casarse') {

    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 No tienes pareja.')
    if (user.matrimonioFecha) return m.reply('💍 Ya están casados.')

    const tiempoRelacion = ahora - user.relacionFecha

    if (tiempoRelacion < SIETE_DIAS) {
      const faltan = tiempo(SIETE_DIAS - tiempoRelacion)
      return conn.reply(
        m.chat,
        box('⏳ AÚN NO PUEDEN CASARSE',
`${tag(sender)} ❤️ ${tag(user.pareja)}
Deben esperar 7 días.
Faltan ${faltan}.`),
        m,
        { mentions: [sender, user.pareja] }
      )
    }

    const pareja = getUser(user.pareja)
    pareja.propuestaMatrimonio = sender
    pareja.propuestaMatrimonioFecha = ahora
    saveDB(db)

    return conn.reply(m.chat,
      box('💒 PROPUESTA DE MATRIMONIO',
`${tag(sender)} 💍 ${tag(user.pareja)}
Responde:
✨ *.si*
✨ *.no*`),
      m,
      { mentions: [sender, user.pareja] })
  }

  /* 💍 SI */
  if (command === 'si') {

    const user = getUser(sender)
    if (!user.propuestaMatrimonio)
      return m.reply('❌ No tienes propuestas.')

    const proposer = user.propuestaMatrimonio
    const proposerUser = getUser(proposer)

    if (user.pareja !== proposer)
      return m.reply('❌ Ya no son pareja.')

    user.matrimonioFecha = ahora
    proposerUser.matrimonioFecha = ahora
    user.propuestaMatrimonio = null
    proposerUser.propuestaMatrimonio = null

    saveDB(db)

    return conn.reply(m.chat,
      box('💍 MATRIMONIO CONFIRMADO',
`${tag(sender)} 💍 ${tag(proposer)}
Ahora están oficialmente casados 💖`),
      m,
      { mentions: [sender, proposer] })
  }

  /* ❌ NO */
  if (command === 'no') {
    const user = getUser(sender)
    if (!user.propuestaMatrimonio)
      return m.reply('❌ No tienes propuestas.')

    const proposer = user.propuestaMatrimonio
    user.propuestaMatrimonio = null
    saveDB(db)

    return conn.reply(m.chat,
      box('💔 MATRIMONIO RECHAZADO',
`${tag(sender)} ha rechazado casarse con ${tag(proposer)}.`),
      m,
      { mentions: [sender, proposer] })
  }

  /* 💔 TERMINAR */
  if (command === 'terminar') {

    const user = getUser(sender)
    if (!user.pareja) return m.reply('❌ No tienes pareja.')

    const exId = user.pareja
    const pareja = getUser(exId)

    user.pareja = null
    pareja.pareja = null
    user.estado = 'soltero'
    pareja.estado = 'soltero'
    user.relacionFecha = null
    pareja.relacionFecha = null
    user.matrimonioFecha = null
    pareja.matrimonioFecha = null
    user.amor = 0
    pareja.amor = 0

    saveDB(db)

    return conn.reply(
      m.chat,
      box('💔 RELACIÓN TERMINADA',
`${tag(sender)} 💔 ${tag(exId)}
Ahora ambos están solteros.`),
      m,
      { mentions: [sender, exId] }
    )
  }

  /* 💔 DIVORCIAR */
  if (command === 'divorciar') {

    const user = getUser(sender)
    if (!user.matrimonioFecha)
      return m.reply('❌ No estás casado.')

    const pareja = getUser(user.pareja)

    user.matrimonioFecha = null
    pareja.matrimonioFecha = null
    user.estado = 'novios'
    pareja.estado = 'novios'

    saveDB(db)

    return conn.reply(
      m.chat,
      box('💔 DIVORCIO',
`${tag(sender)} 💔 ${tag(user.pareja)}
Siguen siendo novios.`),
      m,
      { mentions: [sender, user.pareja] }
    )
  }

  /* 💕 INTERACCIONES */
  if (['besar','abrazar','amor'].includes(command)) {

    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 No tienes pareja.')

    const pareja = getUser(user.pareja)

    let suma = 0
    if (command === 'besar') suma = 5
    if (command === 'abrazar') suma = 3
    if (command === 'amor') suma = 10

    user.amor += suma
    pareja.amor += suma

    saveDB(db)

    return conn.reply(
      m.chat,
      box('💞 MOMENTO ROMÁNTICO',
`${tag(sender)} 💕 ${tag(user.pareja)}
Nuevo nivel de amor: ❤️ ${user.amor}`),
      m,
      { mentions: [sender, user.pareja] }
    )
  }

  /* 👑 LISTA PAREJAS */
  if (command === 'listapareja') {

    if (!ownersJid.includes(sender))
      return m.reply('❌ Solo el dueño.')

    let texto = ''
    let mentions = []

    for (let id in db) {
      const user = db[id]
      if (user.pareja && id < user.pareja) {
        const estado = user.matrimonioFecha ? '💍 Casados' : '💑 Novios'
        texto += `💖 ${tag(id)} ❤️ ${tag(user.pareja)}
Estado: ${estado}
Amor: ❤️ ${user.amor}
─────────────\n`
        mentions.push(id, user.pareja)
      }
    }

    if (!texto) texto = '😿 No hay parejas activas.'

    return conn.reply(m.chat,
      box('💞 PAREJAS ACTIVAS', texto),
      m,
      { mentions })
  }

  /* 🧹 CLEARSHIP */
  if (command === 'clearship') {

    if (!ownersJid.includes(sender))
      return m.reply('❌ Solo el dueño.')

    for (let id in db) {
      db[id] = {
        pareja: null,
        estado: 'soltero',
        propuesta: null,
        propuestaFecha: null,
        propuestaMatrimonio: null,
        propuestaMatrimonioFecha: null,
        relacionFecha: null,
        matrimonioFecha: null,
        amor: 0
      }
    }

    saveDB(db)
    return m.reply('🧹 Todas las parejas fueron eliminadas.')
  }

}

handler.command = [
  'pareja','aceptar','rechazar','terminar',
  'casarse','si','no','divorciar',
  'relacion','amor','besar','abrazar',
  'listapareja','clearship'
]

export default handler
