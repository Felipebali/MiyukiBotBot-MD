// 🌸 Handler Amoroso Completo — FELI 2026 LOVE SUPREME 💎
import fs from 'fs'
import path from 'path'

const dir = './database'
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const file = path.join(dir, 'parejas.json')
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
    return `${dias} día(s)`
  }

  const box = (title, text) => {
    return `╭━━━〔 ${title} 〕━━━⬣
${text}
╰━━━━━━━━━━━━━━━━⬣`
  }

  const frasesSoltero = [
    '💔 Tu corazón está libre por ahora.',
    '🌙 El amor llegará cuando menos lo esperes.',
    '😿 Aún no tienes pareja.',
    '💌 El destino está escribiendo tu historia.'
  ]
  const fraseSoltero = () =>
    frasesSoltero[Math.floor(Math.random() * frasesSoltero.length)]

  /* 💘 PROPUESTA DE PAREJA */
  if (command === 'pareja') {
    const target = getTarget()
    if (!target) return m.reply('💌 Menciona a alguien a quien quieras proponerle tu corazón.')
    if (target === sender) return m.reply('😹 No puedes enamorarte de ti mismo.')

    const user = getUser(sender)
    const tu = getUser(target)

    if (user.estado !== 'soltero')
      return conn.reply(m.chat,
        box('💞 YA TIENES PAREJA', `¡Ya estás enamorado/a de ${tag(user.pareja)}! 💖`),
        m, { mentions: [user.pareja] })

    if (tu.estado !== 'soltero')
      return conn.reply(m.chat,
        box('💔 YA OCUPADO/A', `¡${tag(target)} ya tiene su corazón ocupado! 😿`),
        m, { mentions: [target] })

    tu.propuesta = sender
    tu.propuestaFecha = ahora
    saveDB(db)

    return conn.reply(m.chat,
      box('💘 PROPUESTA DE AMOR',
`${tag(sender)} te ha escrito una cartita de amor ❤️:

"Desde que te conocí, mi corazón late por ti.
¿Quieres ser mi pareja y compartir momentos mágicos juntos?"

Responde con:
✨ *.aceptar* — Aceptar este dulce corazón
✨ *.rechazar* — Lo siento, mi corazón va por otro camino`
      ),
      m, { mentions: [sender, target] })
  }

  /* 💖 ACEPTAR PAREJA */
  if (command === 'aceptar') {
    const user = getUser(sender)
    if (!user.propuesta) return m.reply('💭 No tienes propuestas pendientes.')

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
      box('💞 ¡NUEVA PAREJA!',
`${tag(sender)} y ${tag(proposer)} han unido sus corazones ❤️

Que su amor crezca cada día más y vivan momentos inolvidables 💌`),
      m, { mentions: [sender, proposer] })
  }

  /* ❌ RECHAZAR PAREJA */
  if (command === 'rechazar') {
    const user = getUser(sender)
    if (!user.propuesta) return m.reply('❌ No tienes propuestas.')

    const proposer = user.propuesta
    user.propuesta = null
    saveDB(db)

    return conn.reply(m.chat,
      box('💔 PROPUESTA RECHAZADA',
`${tag(sender)} ha tenido que rechazar la propuesta de ${tag(proposer)}.

El corazón a veces es selectivo ❤️‍🩹`),
      m, { mentions: [sender, proposer] })
  }

  /* 💑 ESTADO DE RELACIÓN */
  if (command === 'relacion') {
    const user = getUser(sender)
    if (!user.pareja) return m.reply(fraseSoltero())

    const estado = user.matrimonioFecha ? '💍 Casados' : '💑 Novios'
    const tiempoJuntos = tiempo(ahora - user.relacionFecha)

    return conn.reply(
      m.chat,
      box('💖 ESTADO DE RELACIÓN',
`${tag(sender)} ❤️ ${tag(user.pareja)}

Estado: ${estado}
Tiempo juntos: ${tiempoJuntos}
Nivel de amor: ${user.amor} ❤️`),
      m, { mentions: [sender, user.pareja] }
    )
  }

  /* 💍 PROPUESTA DE CASAMIENTO */
  if (command === 'casarse') {
    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 No tienes pareja con quien casarte.')
    if (user.matrimonioFecha) return m.reply('💍 ¡Ya están casados!')

    const pareja = getUser(user.pareja)
    pareja.propuestaMatrimonio = sender
    pareja.propuestaMatrimonioFecha = ahora
    saveDB(db)

    return conn.reply(m.chat,
      box('💒 PROPUESTA DE MATRIMONIO',
`${tag(sender)} te ha enviado una propuesta de matrimonio 💍

"Mi amor, quiero que seamos compañeros de vida para siempre.
¿Quieres casarte conmigo y construir nuestro futuro juntos? 💖"

Responde con:
✨ *.si* — Aceptar esta propuesta
✨ *.no* — Rechazarla`),
      m, { mentions: [sender, user.pareja] })
  }

  /* ✨ ACEPTAR MATRIMONIO */
  if (command === 'si') {
    const user = getUser(sender)
    if (!user.propuestaMatrimonio) return m.reply('💭 No tienes propuestas de matrimonio pendientes.')

    const proposer = user.propuestaMatrimonio
    const proposerUser = getUser(proposer)

    user.matrimonioFecha = ahora
    proposerUser.matrimonioFecha = ahora
    user.propuestaMatrimonio = null

    saveDB(db)

    return conn.reply(m.chat,
      box('💍 ¡FELICIDADES! MATRIMONIO CONFIRMADO',
`${tag(sender)} ha aceptado casarse con ${tag(proposer)} ❤️

Que su amor sea eterno y que la felicidad los acompañe siempre 💌`),
      m, { mentions: [sender, proposer] })
  }

  /* ❌ RECHAZAR MATRIMONIO */
  if (command === 'no') {
    const user = getUser(sender)
    if (!user.propuestaMatrimonio) return m.reply('💭 No tienes propuestas de matrimonio pendientes.')

    const proposer = user.propuestaMatrimonio
    user.propuestaMatrimonio = null
    saveDB(db)

    return conn.reply(m.chat,
      box('💔 PROPUESTA DE MATRIMONIO RECHAZADA',
`${tag(sender)} ha tenido que rechazar la propuesta de matrimonio de ${tag(proposer)}.

A veces los corazones necesitan más tiempo 💌`),
      m, { mentions: [sender, proposer] })
  }

  /* 💔 DIVORCIAR */
  if (command === 'divorciar') {
    const user = getUser(sender)
    if (!user.matrimonioFecha) return m.reply('❌ No estás casado.')

    const pareja = getUser(user.pareja)

    user.matrimonioFecha = null
    pareja.matrimonioFecha = null
    user.estado = 'novios'
    pareja.estado = 'novios'

    saveDB(db)

    return conn.reply(m.chat,
      box('💔 DIVORCIO',
`${tag(sender)} se ha divorciado.

Siguen siendo novios, pero el corazón ha cambiado 💌`),
      m, { mentions: [sender, pareja] })
  }

  /* 💕 INTERACCIONES */
  if (['besar','abrazar','amor'].includes(command)) {
    const user = getUser(sender)
    if (!user.pareja) return m.reply(fraseSoltero())

    if (command === 'besar') user.amor += 5
    if (command === 'abrazar') user.amor += 3
    if (command === 'amor') user.amor += 10

    saveDB(db)

    return conn.reply(
      m.chat,
      box('💞 MOMENTO ROMÁNTICO',
`${tag(sender)} 💕 ${tag(user.pareja)}

Nuevo nivel de amor: ${user.amor} ❤️`),
      m, { mentions: [sender, user.pareja] }
    )
  }

  /* 👑 LISTA DE PAREJAS DETALLADA */
  if (command === 'listapareja') {
    if (!ownersJid.includes(sender)) return m.reply('❌ Solo el dueño puede usar esto.')

    let texto = ''
    let mentions = []

    for (let id in db) {
      const user = db[id]
      if (user.pareja && id < user.pareja) {
        const parejaUser = db[user.pareja]
        const estado = user.matrimonioFecha ? '💍 Casados' : '💑 Novios'
        const tiempoJuntos = user.relacionFecha ? tiempo(ahora - user.relacionFecha) : '0 días'
        texto += `💖 ${tag(id)} ❤️ ${tag(user.pareja)}
Estado: ${estado}
Tiempo juntos: ${tiempoJuntos}
Nivel de amor: ${user.amor} ❤️
─────────────\n`
        mentions.push(id, user.pareja)
      }
    }

    if (!texto) texto = '😿 No hay parejas activas.'

    return conn.reply(m.chat, box('💞 PAREJAS ACTIVAS', texto), m, { mentions })
  }

  /* 🧹 CLEAR TOTAL */
  if (command === 'clearship') {
    if (!ownersJid.includes(sender)) return m.reply('❌ Solo el dueño puede usar esto.')

    for (let id in db) {
      db[id] = {
        pareja: null,
        estado: 'soltero',
        propuesta: null,
        propuestaMatrimonio: null,
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
