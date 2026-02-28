// 📂 plugins/perfil.js — PERFIL FelixCat 🐾 ZODIACO PRO + FOTO + PAREJA REAL

import fs from 'fs'
import path from 'path'

const dbPath = './database'
const perfilesFile = path.join(dbPath, 'perfiles.json')
const parejasFile = path.join(dbPath, 'parejas.json')

// =====================
// CREAR DB SI NO EXISTE
// =====================

if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath)

if (!fs.existsSync(perfilesFile))
  fs.writeFileSync(perfilesFile, JSON.stringify({}, null, 2))

if (!fs.existsSync(parejasFile))
  fs.writeFileSync(parejasFile, JSON.stringify({}, null, 2))

const loadPerfiles = () => JSON.parse(fs.readFileSync(perfilesFile))
const savePerfiles = (data) =>
  fs.writeFileSync(perfilesFile, JSON.stringify(data, null, 2))

const loadParejas = () => JSON.parse(fs.readFileSync(parejasFile))

// =====================
// HANDLER
// =====================

let handler = async (m, { conn, text, command }) => {
  try {

    const perfiles = loadPerfiles()
    const parejas = loadParejas()

    const jid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    const username = jid.split('@')[0]

    // =====================
    // CREAR PERFIL SI NO EXISTE
    // =====================

    if (!perfiles[jid]) {
      perfiles[jid] = {
        registered: Date.now(),
        joinGroup: null,
        insignias: [],
        genero: null,
        birth: null,
        bio: null
      }
    }

    let user = perfiles[jid]

    if (m.isGroup && !user.joinGroup)
      user.joinGroup = Date.now()

    // =====================
    // OWNER CHECK
    // =====================

    const senderNumber = jid.replace(/[^0-9]/g, '')

    const ownerNumbers = (global.owner || []).map(v => {
      if (Array.isArray(v)) v = v[0]
      return String(v).replace(/[^0-9]/g, '')
    })

    const isRealOwner = ownerNumbers.includes(senderNumber)
    const isAdmin = m.isAdmin || false

    // =====================
    // FUNCIONES
    // =====================

    const calcularEdad = (fecha) => {
      const [d, m, a] = fecha.split('/').map(Number)
      if (!d || !m || !a) return null
      const nacimiento = new Date(a, m - 1, d)
      const hoy = new Date()
      let edad = hoy.getFullYear() - nacimiento.getFullYear()
      if (
        hoy.getMonth() < nacimiento.getMonth() ||
        (hoy.getMonth() === nacimiento.getMonth() &&
          hoy.getDate() < nacimiento.getDate())
      ) edad--
      return edad
    }

    const diasParaCumple = (fecha) => {
      const [d, m] = fecha.split('/').map(Number)
      if (!d || !m) return null
      const hoy = new Date()
      let cumple = new Date(hoy.getFullYear(), m - 1, d)
      if (cumple < hoy) cumple.setFullYear(hoy.getFullYear() + 1)
      return Math.ceil((cumple - hoy) / 86400000)
    }

    const obtenerZodiaco = (fecha) => {
      const [d, m] = fecha.split('/').map(Number)
      if (!d || !m) return null

      const signos = [
        { nombre: 'Capricornio ♑', elemento: '🌍 Tierra' },
        { nombre: 'Acuario ♒', elemento: '🌪️ Aire' },
        { nombre: 'Piscis ♓', elemento: '💧 Agua' },
        { nombre: 'Aries ♈', elemento: '🔥 Fuego' },
        { nombre: 'Tauro ♉', elemento: '🌍 Tierra' },
        { nombre: 'Géminis ♊', elemento: '🌪️ Aire' },
        { nombre: 'Cáncer ♋', elemento: '💧 Agua' },
        { nombre: 'Leo ♌', elemento: '🔥 Fuego' },
        { nombre: 'Virgo ♍', elemento: '🌍 Tierra' },
        { nombre: 'Libra ♎', elemento: '🌪️ Aire' },
        { nombre: 'Escorpio ♏', elemento: '💧 Agua' },
        { nombre: 'Sagitario ♐', elemento: '🔥 Fuego' }
      ]

      let index = 0

      if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) index = 1
      else if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) index = 2
      else if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) index = 3
      else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) index = 4
      else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) index = 5
      else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) index = 6
      else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) index = 7
      else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) index = 8
      else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) index = 9
      else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) index = 10
      else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) index = 11

      return signos[index]
    }

    const getTarget = () => {
      if (m.mentionedJid?.length) return m.mentionedJid[0]
      if (m.quoted?.sender) return m.quoted.sender
      return null
    }

    // =====================
    // OTORGAR
    // =====================

    if (command === 'otorgar') {

      if (!isRealOwner) return m.reply('Solo los dueños.')

      const target = getTarget()
      if (!target) return m.reply('Menciona al usuario.')

      const nombre = text.replace(/@\d+/g, '').trim()
      if (!nombre) return m.reply('Escribe el nombre de la insignia.')

      if (!perfiles[target]) {
        perfiles[target] = {
          registered: Date.now(),
          insignias: []
        }
      }

      if (!perfiles[target].insignias)
        perfiles[target].insignias = []

      if (!perfiles[target].insignias.includes(nombre))
        perfiles[target].insignias.push(nombre)

      savePerfiles(perfiles)

      return conn.reply(
        m.chat,
        `🏅 Insignia otorgada\n👤 @${target.split('@')[0]}\n🎖️ ${nombre}`,
        m,
        { mentions: [target] }
      )
    }

    // =====================
    // QUITAR
    // =====================

    if (command === 'quitar') {

      if (!isRealOwner) return m.reply('Solo los dueños.')

      const target = getTarget()
      if (!target) return m.reply('Menciona al usuario.')

      if (!perfiles[target]?.insignias?.length)
        return m.reply('Ese usuario no tiene insignias.')

      perfiles[target].insignias = []
      savePerfiles(perfiles)

      return m.reply('Insignias eliminadas.')
    }

    // =====================
    // INSIGNIAS LISTA
    // =====================

    if (command === 'insignias') {

      let lista = []
      let mentions = []

      for (let id in perfiles) {
        if (perfiles[id].insignias?.length) {
          lista.push(
            `👤 @${id.split('@')[0]}\n🏅 ${perfiles[id].insignias.join(', ')}`
          )
          mentions.push(id)
        }
      }

      if (!lista.length)
        return m.reply('Nadie tiene insignias.')

      return conn.reply(
        m.chat,
        `🏅 USUARIOS CON INSIGNIAS\n\n${lista.join('\n\n')}`,
        m,
        { mentions }
      )
    }

    // =====================
    // PERFIL CON FOTO + PAREJA REAL
    // =====================

    if (command === 'perfil') {

      let parejaJid = null
      let parejaTexto = '💔 Sin pareja'

      if (parejas[jid]) {

        if (typeof parejas[jid] === 'string')
          parejaJid = parejas[jid]

        else if (parejas[jid].jid)
          parejaJid = parejas[jid].jid

        if (parejaJid)
          parejaTexto = `💍 Pareja: @${parejaJid.split('@')[0]}`
      }

      const edad = user.birth ? calcularEdad(user.birth) : null
      const dias = user.birth ? diasParaCumple(user.birth) : null
      const zodiaco = user.birth ? obtenerZodiaco(user.birth) : null

      const texto = `
👤 PERFIL

@${username}

⭐ Rol: ${isRealOwner ? 'Dueño 👑' : isAdmin ? 'Admin 🛡️' : 'Usuario 👤'}

🏅 Insignias:
${user.insignias?.length ? user.insignias.join('\n') : 'Ninguna'}

🚻 Género: ${user.genero || 'No definido'}
🎂 Nacimiento: ${user.birth || 'No registrado'}
🎉 Edad: ${edad || 'No disponible'}
🎂 Próximo cumple: ${dias || 'No disponible'} días

♑ Signo: ${zodiaco?.nombre || 'No disponible'}
🌌 Elemento: ${zodiaco?.elemento || 'No disponible'}

${parejaTexto}

📝 Bio: ${user.bio || 'Sin bio'}
`.trim()

      savePerfiles(perfiles)

      let pp = null
      try {
        pp = await conn.profilePictureUrl(jid, 'image')
      } catch {}

      const mentions = [jid]
      if (parejaJid) mentions.push(parejaJid)

      if (pp) {
        return conn.sendMessage(
          m.chat,
          { image: { url: pp }, caption: texto, mentions },
          { quoted: m }
        )
      } else {
        return conn.reply(m.chat, texto, m, { mentions })
      }
    }

  } catch (e) {
    console.error(e)
    m.reply('Error en perfil.')
  }
}

handler.command = [
  'perfil',
  'setbr',
  'bio',
  'genero',
  'otorgar',
  'quitar',
  'insignias'
]

export default handler
