// 🔹 handler amoroso completo — FELI 2026 (con 7 días para casarse)
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

  // 🔥 NUEVA FUNCIÓN TAG (muestra nombre real)
  const tag = (id) => {
    try {
      return `@${conn.getName(id)}`
    } catch {
      return `@${id.split('@')[0]}`
    }
  }

  const tiempo = (ms) => {
    const dias = Math.floor(ms / 86400000)
    return `${dias} días`
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
      return m.reply(`😡 Ya tienes pareja con ${tag(user.pareja)}`, null, { mentions: [user.pareja] })

    if (tu.estado !== 'soltero')
      return m.reply(`😳 ${tag(target)} ya tiene pareja con ${tag(tu.pareja)}`, null, { mentions: [target, tu.pareja] })

    tu.propuesta = sender
    tu.propuestaFecha = ahora
    saveDB(db)

    return conn.reply(
      m.chat,
      `💖 *Propuesta de Amor*\n\n${tag(sender)} quiere estar con ${tag(target)} ❤️\n\n👉 *.aceptar*\n👉 *.rechazar*`,
      m,
      { mentions: [sender, target] }
    )
  }

  // ✅ ACEPTAR
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

    return conn.reply(
      m.chat,
      `💞 *¡Ahora son pareja!*\n\n${tag(sender)} ❤️ ${tag(proposer)}`,
      m,
      { mentions: [sender, proposer] }
    )
  }

  // 💍 CASARSE
  if (command === 'casarse') {
    const user = getUser(sender)
    const parejaId = user.pareja

    if (!parejaId) return m.reply('💍 ' + fraseSoltero())
    if (user.matrimonioFecha) return m.reply('💒 Ya estás casado/a.')
    if (!user.relacionFecha) return m.reply('❌ Error en la relación.')

    const diasRelacion = Math.floor((ahora - user.relacionFecha) / 86400000)

    if (diasRelacion < 7) {
      return m.reply(
        `⏳ Deben esperar 7 días para casarse.\n\n` +
        `💞 Llevan: ${diasRelacion} día(s)\n` +
        `📅 Faltan: ${7 - diasRelacion} día(s)`
      )
    }

    const pareja = getUser(parejaId)
    user.matrimonioFecha = ahora
    pareja.matrimonioFecha = ahora
    saveDB(db)

    return conn.reply(
      m.chat,
      `💒 ¡Felicidades!\n\n${tag(sender)} 💍 ${tag(parejaId)}\nDespués de ${diasRelacion} días juntos ❤️`,
      m,
      { mentions: [sender, parejaId] }
    )
  }

  // 💑 RELACIÓN
  if (command === 'relacion') {
    const user = getUser(sender)
    if (!user.pareja) return m.reply(fraseSoltero())

    const dias = tiempo(ahora - user.relacionFecha)

    return conn.reply(
      m.chat,
      `💑 *Relación*\n${tag(sender)} ❤️ ${tag(user.pareja)}\nEstado: ${user.estado}\nTiempo: ${dias}\nAmor: ${user.amor}`,
      m,
      { mentions: [sender, user.pareja] }
    )
  }
}

handler.command = [
  'pareja','aceptar','rechazar',
  'casarse','relacion'
]

export default handler
