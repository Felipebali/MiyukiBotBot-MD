// 📂 plugins/perfil.js — PERFIL FelixCat 🐾 JSON VERSION

import fs from 'fs'

const filePath = './database/perfiles.json'

// Crear archivo si no existe
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({}, null, 2))
}

const readDB = () => JSON.parse(fs.readFileSync(filePath))
const saveDB = (data) =>
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

let handler = async (m, { conn, text, command }) => {
  try {

    const jid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    const username = jid.split('@')[0]

    let db = readDB()

    if (!db[jid]) {
      db[jid] = {
        registered: Date.now(),
        joinGroup: null,
        insignias: [],
        genero: null,
        birth: null,
        bio: null
      }
      saveDB(db)
    }

    let user = db[jid]

    if (m.isGroup && !user.joinGroup) {
      user.joinGroup = Date.now()
      saveDB(db)
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

      const signos = [
        'Capricornio ♑',
        'Acuario ♒',
        'Piscis ♓',
        'Aries ♈',
        'Tauro ♉',
        'Géminis ♊',
        'Cáncer ♋',
        'Leo ♌',
        'Virgo ♍',
        'Libra ♎',
        'Escorpio ♏',
        'Sagitario ♐'
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
      if (m.mentionedJid?.length) return conn.decodeJid(m.mentionedJid[0])
      if (m.quoted?.sender) return conn.decodeJid(m.quoted.sender)
      return null
    }

    // =====================
    // COMANDOS SIMPLES
    // =====================

    if (command === 'setbr') {
      if (!text) return m.reply('✏️ Uso: .setbr 31/12/1998')
      user.birth = text.trim()
      saveDB(db)
      return m.reply('✅ Fecha guardada.')
    }

    if (command === 'bio') {
      if (!text) return m.reply('✏️ Uso: .bio texto')
      user.bio = text.trim()
      saveDB(db)
      return m.reply('✅ Bio guardada.')
    }

    if (command === 'genero') {
      if (!text) return m.reply('✏️ Escribe tu género')
      user.genero = text.trim()
      saveDB(db)
      return m.reply('✅ Género guardado.')
    }

    // =====================
    // OTORGAR
    // =====================

    if (command === 'otorgar') {

      if (!isRealOwner) return m.reply('❌ Solo los dueños.')

      let target = getTarget()
      if (!target) return m.reply('✏️ Menciona usuario.')

      const nombre = text.replace(/@\d+/g, '').trim()
      if (!nombre) return m.reply('✏️ Escribe insignia.')

      if (!db[target])
        db[target] = { registered: Date.now(), insignias: [] }

      if (!db[target].insignias.includes(nombre))
        db[target].insignias.push(nombre)

      saveDB(db)

      return conn.reply(
        m.chat,
        `🏅 Insignia otorgada a @${target.split('@')[0]}`,
        m,
        { mentions: [target] }
      )
    }

    // =====================
    // QUITAR TODAS
    // =====================

    if (command === 'quitar') {

      if (!isRealOwner) return m.reply('❌ Solo los dueños.')

      let target = getTarget()
      if (!target) return m.reply('✏️ Menciona usuario.')

      if (!db[target]?.insignias?.length)
        return m.reply('❌ No tiene insignias.')

      db[target].insignias = []
      saveDB(db)

      return conn.reply(
        m.chat,
        `🗑️ Insignias eliminadas de @${target.split('@')[0]}`,
        m,
        { mentions: [target] }
      )
    }

    // =====================
    // PERFIL
    // =====================

    if (command === 'perfil') {

      const edad = user.birth ? calcularEdad(user.birth) : null
      const dias = user.birth ? diasParaCumple(user.birth) : null
      const signo = user.birth ? obtenerZodiaco(user.birth) : 'No disponible'

      let insignias = []
      if (isRealOwner) insignias.push('👑 Dueño')
      else if (isAdmin) insignias.push('🛡️ Admin')
      if (user.insignias?.length) insignias.push(...user.insignias)
      if (!insignias.length) insignias.push('Ninguna')

      const txt = `
👤 *PERFIL DE USUARIO*

🆔 @${username}
⭐ Rol: ${isRealOwner ? 'Dueño 👑' : isAdmin ? 'Admin 🛡️' : 'Usuario 👤'}

🏅 Insignias:
${insignias.join('\n')}

🚻 Género: ${user.genero || 'No definido'}

🎂 Nacimiento: ${user.birth || 'No registrado'}
♑ Signo: ${signo}

🎉 Edad: ${edad || 'No disponible'}
🎂 Cumple en: ${dias || 'No disponible'} días

📝 Bio: ${user.bio || 'Sin biografía'}
`.trim()

      let pp = null
      try {
        pp = await conn.profilePictureUrl(jid, 'image')
      } catch {}

      await conn.sendMessage(
        m.chat,
        pp
          ? { image: { url: pp }, caption: txt, mentions: [jid] }
          : { text: txt, mentions: [jid] },
        { quoted: m }
      )
    }

  } catch (e) {
    console.error(e)
    m.reply('❌ Error interno.')
  }
}

handler.command = [
  'perfil',
  'setbr',
  'bio',
  'genero',
  'otorgar',
  'quitar'
]

export default handler
