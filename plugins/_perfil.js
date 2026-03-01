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

    const getTarget = () => {
      if (m.mentionedJid?.length) return m.mentionedJid[0]
      if (m.quoted?.sender) return m.quoted.sender
      return null
    }

    // =====================
    // OTORGAR INSIGNIA
    // =====================

    if (command === 'otorgar') {
      if (!isRealOwner)
        return conn.reply(m.chat, '❌ Solo el owner puede otorgar insignias.', m)

      const target = getTarget()
      if (!target)
        return conn.reply(m.chat, '⚠️ Menciona o responde al usuario.', m)

      const insignia = text.replace(/@\d+/g, '').trim()
      if (!insignia)
        return conn.reply(m.chat, '✍️ Escribe la insignia.', m)

      if (!perfiles[target]) {
        perfiles[target] = {
          registered: Date.now(),
          insignias: []
        }
      }

      if (!perfiles[target].insignias)
        perfiles[target].insignias = []

      perfiles[target].insignias.push(insignia)
      savePerfiles(perfiles)

      return conn.sendMessage(
        m.chat,
        {
          text: `🏅 *INSIGNIA OTORGADA*

➤ Usuario: @${target.split('@')[0]}
➤ Insignia: ${insignia}

✨ Ahora forma parte de su perfil.`,
          mentions: [target]
        },
        { quoted: m }
      )
    }

    // =====================
    // QUITAR INSIGNIAS
    // =====================

    if (command === 'quitar') {
      if (!isRealOwner)
        return conn.reply(m.chat, '❌ Solo el owner puede quitar insignias.', m)

      const target = getTarget()
      if (!target)
        return conn.reply(m.chat, '⚠️ Menciona o responde al usuario.', m)

      if (!perfiles[target] || !perfiles[target].insignias?.length)
        return conn.reply(m.chat, '⚠️ Ese usuario no tiene insignias.', m)

      perfiles[target].insignias = []
      savePerfiles(perfiles)

      return conn.sendMessage(
        m.chat,
        {
          text: `🗑️ *INSIGNIAS ELIMINADAS*

➤ Usuario: @${target.split('@')[0]}

Todas sus insignias fueron removidas correctamente.`,
          mentions: [target]
        },
        { quoted: m }
      )
    }

    // =====================
    // VER INSIGNIAS DE TODOS
    // =====================

    if (command === 'insignias') {
      const usuariosConInsignias = Object.entries(perfiles)
        .filter(([_, u]) => u.insignias?.length)

      if (!usuariosConInsignias.length)
        return m.reply('No hay usuarios con insignias.')

      const texto = usuariosConInsignias
        .map(([jid, u]) => `@${jid.split('@')[0]}: ${u.insignias.join(', ')}`)
        .join('\n')

      const mentions = usuariosConInsignias.map(([jid]) => jid)

      return conn.sendMessage(
        m.chat,
        {
          text: `🏅 *INSIGNIAS REGISTRADAS*

${texto}`,
          mentions
        },
        { quoted: m }
      )
    }

    // =====================
    // PERFIL
    // =====================

    if (command === 'perfil') {

      let parejaTexto = '💔 Sin pareja'
      let parejaJid = null

      const data = parejas[jid]
      if (data?.pareja) {
        parejaJid = data.pareja
        parejaTexto = `❤️ Pareja: @${parejaJid.split('@')[0]}`
      }

      const textoPerfil = `
👤 PERFIL

@${username}

⭐ Rol: ${isRealOwner ? 'Dueño 👑' : isAdmin ? 'Admin 🛡️' : 'Usuario 👤'}

🏅 Insignias:
${user.insignias?.length ? user.insignias.join('\n') : 'Ninguna'}

🚻 Género: ${user.genero || 'No definido'}
🎂 Nacimiento: ${user.birth || 'No registrado'}

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
        return conn.sendMessage(
          m.chat,
          { text: textoPerfil, mentions },
          { quoted: m }
        )
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
