import fs from 'fs'
import path from 'path'

const perfilesPath = path.resolve('./perfiles.json')
const parejasPath = path.resolve('./parejas.json')

// Crear perfiles.json si no existe
if (!fs.existsSync(perfilesPath)) {
  fs.writeFileSync(perfilesPath, JSON.stringify({}, null, 2))
}

let handler = async (m, { conn, text, command }) => {
  try {

    const jid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    const username = jid.split('@')[0]

    // =====================
    // CARGAR PERFILES.JSON
    // =====================

    let perfiles = {}

    try {
      perfiles = JSON.parse(fs.readFileSync(perfilesPath))
    } catch {
      perfiles = {}
    }

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

    if (m.isGroup && !user.joinGroup) {
      user.joinGroup = Date.now()
    }

    const guardar = () => {
      fs.writeFileSync(perfilesPath, JSON.stringify(perfiles, null, 2))
    }

    // =====================
    // CARGAR PAREJAS.JSON
    // =====================

    let parejas = {}

    if (fs.existsSync(parejasPath)) {
      try {
        parejas = JSON.parse(fs.readFileSync(parejasPath))
      } catch {
        parejas = {}
      }
    }

    // =====================
    // OWNER
    // =====================

    const senderNumber = jid.replace(/[^0-9]/g, '')

    const ownerNumbers = (global.owner || []).map(v => {
      if (Array.isArray(v)) v = v[0]
      return String(v).replace(/[^0-9]/g, '')
    })

    const isRealOwner = ownerNumbers.includes(senderNumber)

    // =====================
    // ADMIN
    // =====================

    let isAdmin = false

    if (m.isAdmin !== undefined) {
      isAdmin = m.isAdmin
    } else if (m.isGroup) {
      try {
        const meta = await conn.groupMetadata(m.chat)
        const participant = meta.participants.find(p =>
          (conn.decodeJid ? conn.decodeJid(p.id) : p.id) === jid
        )
        if (participant) {
          isAdmin =
            participant.admin === 'admin' ||
            participant.admin === 'superadmin'
        }
      } catch {}
    }

    // =====================
    // FUNCIONES FECHA
    // =====================

    const calcularEdad = (fecha) => {
      const [d, m, a] = fecha.split('/').map(Number)
      if (!d || !m || !a) return null
      const nacimiento = new Date(a, m - 1, d)
      const hoy = new Date()
      let edad = hoy.getFullYear() - nacimiento.getFullYear()
      const diff = hoy.getMonth() - nacimiento.getMonth()
      if (diff < 0 || (diff === 0 && hoy.getDate() < nacimiento.getDate()))
        edad--
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

      if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return { nombre: 'Aries ♈', elemento: '🔥 Fuego' }
      if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return { nombre: 'Tauro ♉', elemento: '🌍 Tierra' }
      if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return { nombre: 'Géminis ♊', elemento: '🌪️ Aire' }
      if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return { nombre: 'Cáncer ♋', elemento: '💧 Agua' }
      if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return { nombre: 'Leo ♌', elemento: '🔥 Fuego' }
      if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return { nombre: 'Virgo ♍', elemento: '🌍 Tierra' }
      if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return { nombre: 'Libra ♎', elemento: '🌪️ Aire' }
      if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return { nombre: 'Escorpio ♏', elemento: '💧 Agua' }
      if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return { nombre: 'Sagitario ♐', elemento: '🔥 Fuego' }
      if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return { nombre: 'Capricornio ♑', elemento: '🌍 Tierra' }
      if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return { nombre: 'Acuario ♒', elemento: '🌪️ Aire' }
      return { nombre: 'Piscis ♓', elemento: '💧 Agua' }
    }

    // =====================
    // COMANDOS
    // =====================

    if (command === 'setbr') {
      if (!text) return m.reply('✏️ Uso: .setbr 31/12/2000')
      user.birth = text.trim()
      guardar()
      return m.reply('✅ Fecha guardada.')
    }

    if (command === 'bio') {
      if (!text) return m.reply('✏️ Uso: .bio texto')
      user.bio = text.trim()
      guardar()
      return m.reply('✅ Bio guardada.')
    }

    if (command === 'genero') {
      if (!text) return m.reply('✏️ Escribe tu género')
      user.genero = text.trim()
      guardar()
      return m.reply('✅ Género guardado.')
    }

    const getTarget = () => {
      if (m.mentionedJid?.length) return m.mentionedJid[0]
      if (m.quoted?.sender) return m.quoted.sender
      return null
    }

    if (command === 'otorgar') {

      if (!isRealOwner) return m.reply('❌ Solo los dueños.')

      const target = getTarget()
      if (!target) return m.reply('✏️ Menciona usuario.')

      const nombre = text.replace(/@\d+/g, '').trim()
      if (!nombre) return m.reply('✏️ Escribe insignia.')

      if (!perfiles[target]) {
        perfiles[target] = {
          registered: Date.now(),
          insignias: [],
          genero: null,
          birth: null,
          bio: null
        }
      }

      if (!perfiles[target].insignias)
        perfiles[target].insignias = []

      if (!perfiles[target].insignias.includes(nombre))
        perfiles[target].insignias.push(nombre)

      guardar()

      return conn.reply(
        m.chat,
        `🏅 Insignia otorgada\n👤 @${target.split('@')[0]}\n🎖️ ${nombre}`,
        m,
        { mentions: [target] }
      )
    }

    if (command === 'quitar') {

      if (!isRealOwner) return m.reply('❌ Solo los dueños.')

      const target = getTarget()
      if (!target) return m.reply('✏️ Menciona usuario.')

      if (!perfiles[target]?.insignias?.length)
        return m.reply('❌ No tiene insignias.')

      perfiles[target].insignias = []
      guardar()

      return conn.reply(
        m.chat,
        `🗑️ Insignias eliminadas de @${target.split('@')[0]}`,
        m,
        { mentions: [target] }
      )
    }

    if (command === 'insignias') {

      if (!isRealOwner) return m.reply('❌ Solo los dueños.')

      let lista = []
      let mentions = []

      for (let id in perfiles) {
        let u = perfiles[id]
        if (u.insignias?.length) {
          lista.push(`👤 @${id.split('@')[0]}\n🏅 ${u.insignias.join(', ')}`)
          mentions.push(id)
        }
      }

      if (!lista.length) return m.reply('❌ Nadie tiene insignias.')

      return conn.reply(
        m.chat,
        `🏅 *USUARIOS CON INSIGNIAS*\n\n${lista.join('\n\n')}`,
        m,
        { mentions }
      )
    }

    if (command === 'perfil') {

      const edad = user.birth ? calcularEdad(user.birth) : null
      const dias = user.birth ? diasParaCumple(user.birth) : null
      const zodiaco = user.birth ? obtenerZodiaco(user.birth) : null

      const pareja = parejas[jid]
      let parejaTexto = pareja ? `💍 @${pareja.split('@')[0]}` : 'Soltero/a 💔'

      let insignias = []

      if (isRealOwner) insignias.push('👑 Dueño')
      else if (isAdmin) insignias.push('🛡️ Admin')

      if (user.insignias?.length)
        insignias.push(...user.insignias)

      if (!insignias.length) insignias.push('Ninguna')

      const txt = `
👤 *PERFIL DE USUARIO*

🆔 @${username}

🏅 Insignias:
${insignias.join('\n')}

💞 Pareja: ${parejaTexto}

🚻 Género: ${user.genero || 'No definido'}

🎂 Nacimiento: ${user.birth || 'No registrado'}
♑ Signo: ${zodiaco?.nombre || 'No disponible'}
🌌 Elemento: ${zodiaco?.elemento || 'No disponible'}

🎉 Edad: ${edad || 'No disponible'}
🎂 Cumple en: ${dias ? dias + ' días' : 'No disponible'}

📝 Bio: ${user.bio || 'Sin biografía'}
`.trim()

      return conn.sendMessage(
        m.chat,
        { text: txt, mentions: pareja ? [jid, pareja] : [jid] },
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
