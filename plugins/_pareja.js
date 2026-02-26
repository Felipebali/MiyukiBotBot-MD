// 🔹 handler amoroso completo — FELI 2026 FINAL 7 DIAS
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

  const frasesSoltero = [
    '😿 Estás soltero/a, busca a alguien especial 💔',
    '💔 Sin pareja aún, el amor llegará 😉',
    '😹 Nadie para abrazar, pero siempre queda el chat 😏',
    '💌 Tu corazón está libre, ¡aprovéchalo!'
  ]

  const fraseSoltero = () =>
    frasesSoltero[Math.floor(Math.random() * frasesSoltero.length)]

  // 💌 PROPUESTA
  if (command === 'pareja') {
    const target = getTarget()
    if (!target) return m.reply('💌 Menciona o responde al mensaje.')
    if (target === sender) return m.reply('😹 No puedes ser pareja contigo mismo.')

    const user = getUser(sender)
    const tu = getUser(target)

    if (user.estado !== 'soltero')
      return conn.reply(m.chat,
        `😡 Ya tienes pareja con ${tag(user.pareja)}`,
        m, { mentions: [user.pareja] })

    if (tu.estado !== 'soltero')
      return conn.reply(m.chat,
        `😳 ${tag(target)} ya tiene pareja con ${tag(tu.pareja)}`,
        m, { mentions: [target, tu.pareja] })

    tu.propuesta = sender
    tu.propuestaFecha = ahora
    saveDB(db)

    return conn.reply(m.chat,
      `💖 ${tag(sender)} quiere estar con ${tag(target)} ❤️\n\n👉 *.aceptar*\n👉 *.rechazar*`,
      m, { mentions: [sender, target] })
  }

  // ✅ ACEPTAR
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
      `💞 ${tag(sender)} ❤️ ${tag(proposer)} ahora son pareja`,
      m, { mentions: [sender, proposer] })
  }

  // ❌ RECHAZAR
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

  // 💔 TERMINAR
  if (command === 'terminar') {
    const user = getUser(sender)
    if (!user.pareja) return m.reply('💔 ' + fraseSoltero())

    const pareja = getUser(user.pareja)

    pareja.pareja = null
    pareja.estado = 'soltero'
    pareja.relacionFecha = null
    pareja.matrimonioFecha = null
    pareja.amor = 0

    user.pareja = null
    user.estado = 'soltero'
    user.relacionFecha = null
    user.matrimonioFecha = null
    user.amor = 0

    saveDB(db)

    return conn.reply(m.chat,
      `💔 ${tag(sender)} terminó su relación.`,
      m, { mentions: [sender] })
  }

  // 💍 CASARSE (SOLO DESPUÉS DE 7 DÍAS)
  if (command === 'casarse') {
    const user = getUser(sender)

    if (!user.pareja)
      return conn.reply(m.chat, '💍 ' + fraseSoltero(), m)

    if (user.matrimonioFecha)
      return conn.reply(m.chat, '💒 Ya estás casado/a.', m)

    if (!user.relacionFecha)
      return conn.reply(m.chat, '⚠️ Error en la relación.', m)

    const diasRelacion = Math.floor((ahora - user.relacionFecha) / 86400000)

    if (diasRelacion < 7) {
      return conn.reply(
        m.chat,
        `⏳ Necesitan mínimo 7 días de relación.\nActualmente llevan ${diasRelacion} día(s).`,
        m,
        { mentions: [sender, user.pareja] }
      )
    }

    const pareja = getUser(user.pareja)

    if (pareja.pareja !== sender)
      return conn.reply(m.chat, '💔 La relación ya no es válida.', m)

    user.matrimonioFecha = ahora
    pareja.matrimonioFecha = ahora

    saveDB(db)

    return conn.reply(
      m.chat,
      `💒✨ ¡BODA CONFIRMADA! ✨💒\n\n${tag(sender)} 💍 ${tag(user.pareja)}\n\nDespués de ${diasRelacion} días juntos ahora están casados ❤️`,
      m,
      { mentions: [sender, user.pareja] }
    )
  }

  // 💔 DIVORCIAR
  if (command === 'divorciar') {
    const user = getUser(sender)
    if (!user.matrimonioFecha)
      return conn.reply(m.chat, '💒 No estás casado/a.', m)

    const pareja = getUser(user.pareja)

    user.matrimonioFecha = null
    pareja.matrimonioFecha = null

    saveDB(db)

    return conn.reply(
      m.chat,
      `💔 ${tag(sender)} se divorció de ${tag(user.pareja)}`,
      m,
      { mentions: [sender, user.pareja] }
    )
  }

  // ❤️ INTERACCIONES
  if (['besar','abrazar','amor','relacion'].includes(command)) {
    const user = getUser(sender)
    if (!user.pareja) return m.reply(fraseSoltero())

    const pareja = getUser(user.pareja)

    if (command === 'besar') user.amor += 5
    if (command === 'abrazar') user.amor += 3
    if (command === 'amor') user.amor += 10

    pareja.amor = user.amor
    saveDB(db)

    if (command === 'relacion') {
      const tiempoJuntos = tiempo(ahora - user.relacionFecha)
      return conn.reply(
        m.chat,
        `💑 ${tag(sender)} ❤️ ${tag(user.pareja)}\nTiempo: ${tiempoJuntos}\nAmor: ${user.amor}`,
        m,
        { mentions: [sender, user.pareja] }
      )
    }

    return conn.reply(
      m.chat,
      `❤️ ${tag(sender)} 💕 ${tag(user.pareja)}\nNivel de amor: ${user.amor}`,
      m,
      { mentions: [sender, user.pareja] }
    )
  }

  // 📜 LISTA PAREJAS (OWNER)
  if (command === 'listapareja') {
    if (!ownersJid.includes(sender))
      return m.reply('❌ Solo el dueño puede usar este comando.')

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

  // 🧹 CLEARSHIP (OWNER)
  if (command === 'clearship') {
    if (!ownersJid.includes(sender))
      return m.reply('❌ Solo el dueño puede usar este comando.')

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
