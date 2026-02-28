// 📂 plugins/perfil.js — PERFIL FelixCat 🐾 FULL SISTEMA JSON

import fs from 'fs'
import path from 'path'

const perfilesPath = './database/perfiles.json'
const parejasPath = './database/parejas.json'

// =====================
// FUNCIONES JSON
// =====================

const loadJSON = (file) => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}))
  }
  return JSON.parse(fs.readFileSync(file))
}

const saveJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// =====================
// HANDLER
// =====================

let handler = async (m, { conn, text, command }) => {
  try {

    const jid = conn.decodeJid ? conn.decodeJid(m.sender) : m.sender
    const username = jid.split('@')[0]

    let perfiles = loadJSON(perfilesPath)
    let parejas = loadJSON(parejasPath)

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
      saveJSON(perfilesPath, perfiles)
    }

    let user = perfiles[jid]

    if (m.isGroup && !user.joinGroup) {
      user.joinGroup = Date.now()
      saveJSON(perfilesPath, perfiles)
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

    let isAdmin = m.isAdmin || false

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

    // =====================
    // DETECTAR PAREJA
    // =====================

    let estadoAmor = '💔 Soltero'
    let parejaTag = ''

    if (parejas[jid]) {
      const data = parejas[jid]

      if (data.jid) {
        const parejaJid = data.jid
        const tipo = data.tipo || 'novios'

        if (tipo === 'casados') {
          estadoAmor = '💍 Casado(a)'
        } else {
          estadoAmor = '❤️ En una relación'
        }

        parejaTag = `\n💞 Pareja: @${parejaJid.split('@')[0]}`
      }
    }

    // =====================
    // TARGET
    // =====================

    const getTarget = () => {
      if (m.mentionedJid?.length) return m.mentionedJid[0]
      if (m.quoted?.sender) return m.quoted.sender
      return null
    }

    // =====================
    // COMANDOS
    // =====================

    if (command === 'setbr') {
      if (!text) return m.reply('✏️ Uso:\n.setbr 31/12/1998')
      user.birth = text.trim()
      saveJSON(perfilesPath, perfiles)
      return m.reply('✅ Fecha guardada.')
    }

    if (command === 'bio') {
      if (!text) return m.reply('✏️ Uso:\n.bio texto')
      user.bio = text.trim()
      saveJSON(perfilesPath, perfiles)
      return m.reply('✅ Bio guardada.')
    }

    if (command === 'genero') {
      if (!text) return m.reply('✏️ Escribe tu género')
      user.genero = text.trim()
      saveJSON(perfilesPath, perfiles)
      return m.reply('✅ Género guardado.')
    }

    // =====================
    // OTORGAR
    // =====================

    if (command === 'otorgar') {

      if (!isRealOwner) return m.reply('❌ Solo los dueños.')

      const target = getTarget()
      if (!target) return m.reply('✏️ Menciona usuario.')

      const nombre = text.replace(/@\d+/g, '').trim()
      if (!nombre) return m.reply('✏️ Escribe insignia.')

      if (!perfiles[target])
        perfiles[target] = {
          registered: Date.now(),
          insignias: []
        }

      if (!perfiles[target].insignias)
        perfiles[target].insignias = []

      if (!perfiles[target].insignias.includes(nombre))
        perfiles[target].insignias.push(nombre)

      saveJSON(perfilesPath, perfiles)

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

      if (!isRealOwner) return m.reply('❌ Solo los dueños.')

      const target = getTarget()
      if (!target) return m.reply('✏️ Menciona usuario.')

      if (!perfiles[target]?.insignias?.length)
        return m.reply('❌ No tiene insignias.')

      perfiles[target].insignias = []
      saveJSON(perfilesPath, perfiles)

      return m.reply('🗑️ Insignias eliminadas.')
    }

    // =====================
    // INSIGNIAS (LISTAR)
    // =====================

    if (command === 'insignias') {

      if (!isRealOwner) return m.reply('❌ Solo los dueños.')

      let lista = []
      let mentions = []

      for (let id in perfiles) {
        if (perfiles[id].insignias?.length) {
          lista.push(`👤 @${id.split('@')[0]}\n🏅 ${perfiles[id].insignias.join(', ')}`)
          mentions.push(id)
        }
      }

      if (!lista.length)
        return m.reply('❌ Nadie tiene insignias.')

      return conn.reply(
        m.chat,
        `🏅 *USUARIOS CON INSIGNIAS*\n\n${lista.join('\n\n')}`,
        m,
        { mentions }
      )
    }

    // =====================
    // PERFIL
    // =====================

    if (command === 'perfil') {

      const edad = user.birth ? calcularEdad(user.birth) : null
      const dias = user.birth ? diasParaCumple(user.birth) : null

      let rol = 'Usuario 👤'
      if (isRealOwner) rol = 'Dueño 👑'
      else if (isAdmin) rol = 'Admin 🛡️'

      let insignias = []
      if (user.insignias?.length)
        insignias = user.insignias
      else
        insignias = ['Ninguna']

      const texto = `
👤 *PERFIL*

🆔 @${username}
⭐ Rol: ${rol}

🏅 Insignias:
${insignias.join('\n')}

🚻 Género: ${user.genero || 'No definido'}

🎂 Nacimiento: ${user.birth || 'No registrado'}
🎉 Edad: ${edad || 'No disponible'}
🎂 Cumple en: ${dias || 'No disponible'} días

💖 Estado: ${estadoAmor}${parejaTag}

📝 Bio:
${user.bio || 'Sin biografía'}
`.trim()

      await conn.sendMessage(
        m.chat,
        { text: texto, mentions: [jid, ...(parejas[jid]?.jid ? [parejas[jid].jid] : [])] },
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
