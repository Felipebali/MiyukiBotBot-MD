// 📂 plugins/perfil.js — PERFIL FelixCat 🐾 ZODIACO PRO + FOTO + SISTEMA REAL DE PAREJAS + ESTADO

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
// FUNCIONES EXTRA
// =====================

const calcularEdad = (fecha) => {
  const [d, m, a] = fecha.split('/').map(Number)
  if (!d || !m || !a) return null
  const nacimiento = new Date(a, m - 1, d)
  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate()))
    edad--
  return edad
}

const signoZodiacal = (fecha) => {
  const [d, m] = fecha.split('/').map(Number)
  if (!d || !m) return null

  const signos = [
    ['Capricornio ♑', 19], ['Acuario ♒', 18], ['Piscis ♓', 20],
    ['Aries ♈', 19], ['Tauro ♉', 20], ['Géminis ♊', 20],
    ['Cáncer ♋', 22], ['Leo ♌', 22], ['Virgo ♍', 22],
    ['Libra ♎', 22], ['Escorpio ♏', 21], ['Sagitario ♐', 21],
    ['Capricornio ♑', 31]
  ]

  return d <= signos[m - 1][1]
    ? signos[m - 1][0]
    : signos[m][0]
}

const tiempoRelacion = (fecha) => {
  if (!fecha) return null
  const diff = Date.now() - fecha
  const dias = Math.floor(diff / 86400000)
  return `${dias} día(s)`
}

// =====================
// HANDLER
// =====================

let handler = async (m, { conn, text, command }) => {
  try {
    const perfiles = loadPerfiles()
    const parejas = loadParejas()

    const jid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    const username = jid.split('@')[0]

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

    const senderNumber = jid.replace(/[^0-9]/g, '')
    const ownerNumbers = (global.owner || []).map(v => {
      if (Array.isArray(v)) v = v[0]
      return String(v).replace(/[^0-9]/g, '')
    })

    const isRealOwner = ownerNumbers.includes(senderNumber)
    const isAdmin = m.isAdmin || false

    // =====================
    // BIO
    // =====================

    if (command === 'bio') {
      if (!text) return m.reply('✍️ Escribe tu nueva bio.')
      user.bio = text.trim()
      savePerfiles(perfiles)
      return m.reply('✅ Bio actualizada.')
    }

    // =====================
    // GENERO
    // =====================

    if (command === 'genero') {
      if (!text) return m.reply('⚧️ Escribe tu género.')
      user.genero = text.trim()
      savePerfiles(perfiles)
      return m.reply('✅ Género actualizado.')
    }

    // =====================
    // FECHA NACIMIENTO
    // =====================

    if (command === 'setbr') {
      if (!text) return m.reply('🎂 Usa formato: .setbr 12/05/2005')
      user.birth = text.trim()
      savePerfiles(perfiles)
      return m.reply('✅ Fecha de nacimiento guardada.')
    }

    // =====================
    // PERFIL
    // =====================

    if (command === 'perfil') {

      let estadoTexto = '💔 Estado: Soltero/a'
      let parejaTexto = ''
      let amorTexto = ''
      let tiempoTexto = ''
      let parejaJid = null

      const data = parejas[jid]

      if (data?.pareja) {
        parejaJid = data.pareja

        const estado = data.estado || 'novios'

        estadoTexto =
          estado === 'casados'
            ? '💍 Estado: Casado/a'
            : '💑 Estado: De novio/a'

        parejaTexto = `❤️ Pareja: @${parejaJid.split('@')[0]}`
        amorTexto = `💖 Amor: ${data.amor || 0}`
        tiempoTexto = data.relacionFecha
          ? `⏳ Tiempo juntos: ${tiempoRelacion(data.relacionFecha)}`
          : ''
      }

      const edad = user.birth ? calcularEdad(user.birth) : null
      const signo = user.birth ? signoZodiacal(user.birth) : null

      const textoPerfil = `
👤 PERFIL

@${username}

⭐ Rol: ${isRealOwner ? 'Dueño 👑' : isAdmin ? 'Admin 🛡️' : 'Usuario 👤'}

${estadoTexto}
${parejaTexto}
${amorTexto}
${tiempoTexto}

🏅 Insignias:
${user.insignias?.length ? user.insignias.join('\n') : 'Ninguna'}

🚻 Género: ${user.genero || 'No definido'}
🎂 Nacimiento: ${user.birth || 'No registrado'}
${edad ? `🎉 Edad: ${edad}` : ''}
${signo ? `🔮 Signo: ${signo}` : ''}

📝 Bio: ${user.bio || 'Sin bio'}
`.trim()

      savePerfiles(perfiles)

      let pp = null
      try {
        pp = await conn.profilePictureUrl(jid, 'image')
      } catch {
        pp = null
      }

      const mentions = [jid]
      if (parejaJid) mentions.push(parejaJid)

      // 🔥 SI TIENE FOTO
      if (pp) {
        return conn.sendMessage(
          m.chat,
          {
            image: { url: pp },
            caption: textoPerfil,
            mentions
          },
          { quoted: m }
        )
      }

      // 🔥 SI NO TIENE FOTO → SOLO TEXTO
      return conn.sendMessage(
        m.chat,
        {
          text: textoPerfil,
          mentions
        },
        { quoted: m }
      )
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
