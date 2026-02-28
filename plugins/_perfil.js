// 📂 plugins/perfil.js — PERFIL FelixCat 🐾 ZODIACO PRO + FOTO + SISTEMA REAL DE PAREJAS

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

    const user = perfiles[jid]

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
      if (!d || !m || !a) return 'No disponible'
      const nacimiento = new Date(a, m - 1, d)
      const hoy = new Date()
      let edad = hoy.getFullYear() - nacimiento.getFullYear()
      if (hoy.getMonth() < nacimiento.getMonth() || 
          (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate()))
        edad--
      return edad
    }

    const diasParaCumple = (fecha) => {
      const [d, m] = fecha.split('/').map(Number)
      if (!d || !m) return 'No disponible'
      const hoy = new Date()
      let cumple = new Date(hoy.getFullYear(), m - 1, d)
      if (cumple < hoy) cumple.setFullYear(hoy.getFullYear() + 1)
      return Math.ceil((cumple - hoy) / 86400000)
    }

    const obtenerZodiaco = (fecha) => {
      const [d, m] = fecha.split('/').map(Number)
      if (!d || !m) return { nombre: 'No disponible', elemento: 'No disponible' }

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

    const tiempoJuntos = (fecha) => {
      if (!fecha) return 0
      const inicio = new Date(fecha)
      const hoy = new Date()
      return Math.floor((hoy - inicio) / 86400000)
    }

    const getTarget = () => {
      if (m.mentionedJid?.length) return m.mentionedJid[0]
      if (m.quoted?.sender) return m.quoted.sender
      return null
    }

    // =====================
    // COMANDOS
    // =====================

    // SETBR
    if (command === 'setbr') {
      if (!text) return m.reply('Usa: .setbr DD/MM/AAAA')
      user.birth = text.trim()
      savePerfiles(perfiles)
      return m.reply('🎂 Fecha guardada.')
    }

    // BIO
    if (command === 'bio') {
      if (!text) return m.reply('Escribe tu bio.')
      user.bio = text.trim()
      savePerfiles(perfiles)
      return m.reply('📝 Bio actualizada.')
    }

    // GENERO
    if (command === 'genero') {
      if (!text) return m.reply('Ejemplo: .genero Hombre')
      user.genero = text.trim()
      savePerfiles(perfiles)
      return m.reply('🚻 Género actualizado.')
    }

    // OTORGAR INSIGNIA
    if (command === 'otorgar') {
      if (!isRealOwner) return m.reply('❌ Solo el owner.')
      const target = getTarget()
      if (!target) return m.reply('Menciona a alguien.')
      const insignia = text.replace(/@\d+/g, '').trim()
      if (!insignia) return m.reply('Escribe la insignia.')
      if (!perfiles[target]) perfiles[target] = { insignias: [] }
      perfiles[target].insignias.push(insignia)
      savePerfiles(perfiles)
      return m.reply('🏅 Insignia otorgada.')
    }

    // QUITAR INSIGNIAS
    if (command === 'quitar') {
      if (!isRealOwner) return m.reply('❌ Solo el owner.')
      const target = getTarget()
      if (!target) return m.reply('Menciona a alguien.')
      if (perfiles[target]) perfiles[target].insignias = []
      savePerfiles(perfiles)
      return m.reply('🗑️ Insignias eliminadas.')
    }

    // VER INSIGNIAS
    if (command === 'insignias') {
      return m.reply(
        user.insignias?.length
          ? `🏅 Tus insignias:\n${user.insignias.join('\n')}`
          : 'No tienes insignias.'
      )
    }

    // PERFIL
    if (command === 'perfil') {

      let parejaTexto = '💔 Sin pareja'
      let parejaJid = null
      let amor = 0
      let diasRelacion = 0
      let estado = ''

      const data = parejas[jid]
      if (data && data.pareja) {
        parejaJid = data.pareja
        estado = data.matrimonioFecha ? '💍 Casados' : '❤️ Novios'
        amor = data.amor || 0
        diasRelacion = tiempoJuntos(data.matrimonioFecha || data.relacionFecha)
        parejaTexto = `
${estado}
💞 Pareja: @${parejaJid.split('@')[0]}
🔥 Amor: ${amor}%
⏳ Tiempo juntos: ${diasRelacion} días
`.trim()
      }

      const edad = user.birth ? calcularEdad(user.birth) : 'No disponible'
      const dias = user.birth ? diasParaCumple(user.birth) : 'No disponible'
      const zodiaco = user.birth ? obtenerZodiaco(user.birth) : { nombre: 'No disponible', elemento: 'No disponible' }

      const textoPerfil = `
👤 PERFIL

@${username}

⭐ Rol: ${isRealOwner ? 'Dueño 👑' : isAdmin ? 'Admin 🛡️' : 'Usuario 👤'}

🏅 Insignias:
${user.insignias?.length ? user.insignias.join('\n') : 'Ninguna'}

🚻 Género: ${user.genero || 'No definido'}
🎂 Nacimiento: ${user.birth || 'No registrado'}
🎉 Edad: ${edad}
🎂 Próximo cumple: ${dias} días

♑ Signo: ${zodiaco.nombre}
🌌 Elemento: ${zodiaco.elemento}

${parejaTexto}

📝 Bio: ${user.bio || 'Sin bio'}
`.trim()

      savePerfiles(perfiles)

      let pp = null
      try { pp = await conn.profilePictureUrl(jid, 'image') } catch {}

      const mentions = [jid]
      if (parejaJid) mentions.push(parejaJid)

      if (pp) {
        return conn.sendMessage(
          m.chat,
          { image: { url: pp }, caption: textoPerfil, mentions },
          { quoted: m }
        )
      } else {
        return conn.reply(m.chat, textoPerfil, m, { mentions })
      }
    }

  } catch (e) {
    console.error(e)
    m.reply('❌ Error en perfil.')
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
