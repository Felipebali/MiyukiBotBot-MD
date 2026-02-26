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

  /* 💘 PROPUESTA */
  if (command === 'pareja') {
    const target = getTarget()
    if (!target) return m.reply('💌 Menciona a alguien.')
    if (target === sender) return m.reply('😹 No puedes ser pareja contigo mismo.')

    const user = getUser(sender)
    const tu = getUser(target)

    if (user.estado !== 'soltero')
      return conn.reply(m.chat,
        box('💞 YA TIENES PAREJA',
        `Estás con ${tag(user.pareja)} 💖`),
        m, { mentions: [user.pareja] })

    if (tu.estado !== 'soltero')
      return conn.reply(m.chat,
        box('💔 YA OCUPADO/A',
        `${tag(target)} ya tiene pareja.`),
        m, { mentions: [target] })

    tu.propuesta = sender
    tu.propuestaFecha = ahora
    saveDB(db)

    return conn.reply(m.chat,
      box('💘 PROPUESTA DE AMOR',
      `${tag(sender)} quiere estar contigo ❤️

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

    user.estado = 'novios'
    proposerUser.estado = 'novios'
    user.pareja = proposer
    proposerUser.pareja = sender
    user.relacionFecha = ahora
    proposerUser.relacionFecha = ahora
    user.propuesta = null

    saveDB(db)

    return conn.reply(m.chat,
      box('💞 NUEVA PAREJA',
      `${tag(sender)} ❤️ ${tag(proposer)}

Ahora son novios oficialmente 💖`),
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
      `${tag(sender)} rechazó a ${tag(proposer)}.`),
      m, { mentions: [sender, proposer] })
  }

  /* 💑 RELACION */
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
      m,
      { mentions: [sender, user.pareja] }
    )
  }

  /* 💍 CASARSE */
  if (command === 'casarse') {
    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 No tienes pareja.')
    if (user.matrimonioFecha) return m.reply('💍 Ya están casados.')

    const pareja = getUser(user.pareja)

    user.matrimonioFecha = ahora
    pareja.matrimonioFecha = ahora

    saveDB(db)

    return conn.reply(m.chat,
      box('💍 MATRIMONIO',
      `${tag(sender)} 💍 ${tag(user.pareja)}

Ahora están oficialmente casados ❤️`),
      m, { mentions: [sender, user.pareja] })
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
      `${tag(sender)} se divorció.

Siguen siendo novios.`),
      m, { mentions: [sender] })
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
      m,
      { mentions: [sender, user.pareja] }
    )
  }

  /* 👑 LISTA */
  if (command === 'listapareja') {
    if (!ownersJid.includes(sender))
      return m.reply('❌ Solo el dueño puede usar esto.')

    let texto = ''
    let mentions = []

    for (let id in db) {
      const user = db[id]
      if (user.pareja && id < user.pareja) {
        const estado = user.matrimonioFecha ? '💍 Casados' : '💑 Novios'
        texto += `💖 ${tag(id)} ❤️ ${tag(user.pareja)} — ${estado}\n`
        mentions.push(id, user.pareja)
      }
    }

    if (!texto) texto = '😿 No hay parejas activas.'

    return conn.reply(m.chat,
      box('💞 PAREJAS ACTIVAS', texto),
      m, { mentions })
  }

  /* 🧹 CLEAR TOTAL */
  if (command === 'clearship') {
    if (!ownersJid.includes(sender))
      return m.reply('❌ Solo el dueño puede usar esto.')

    for (let id in db) {
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

    saveDB(db)
    return m.reply('🧹 Todas las parejas fueron eliminadas.')
  }
}

handler.command = [
  'pareja','aceptar','rechazar','terminar',
  'casarse','divorciar',
  'relacion','amor','besar','abrazar',
  'listapareja','clearship'
]

export default handler
