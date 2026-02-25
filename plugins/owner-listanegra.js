import fs from 'fs'
import path from 'path'

const filePath = path.join('./database', 'blacklist.json')

// Crear carpeta si no existe
if (!fs.existsSync('./database')) fs.mkdirSync('./database')

// Cargar lista negra
let blacklist = []
if (fs.existsSync(filePath)) {
    try {
        blacklist = JSON.parse(fs.readFileSync(filePath))
    } catch (e) {
        console.log('Error al leer blacklist.json', e)
        blacklist = []
    }
}

// Guardar lista negra en archivo
const saveBlacklist = () => {
    fs.writeFileSync(filePath, JSON.stringify(blacklist, null, 2))
}

let handler = async (m, { conn, text, usedPrefix, command }) => {

  // 🔹 AGREGAR A LISTA NEGRA
  if (command === 'ln') {
    if (!m.quoted) return m.reply(`❌ Debes citar el mensaje del usuario.`)
    let user = m.quoted.sender

    if (blacklist.includes(user))
      return m.reply(`⚠️ Ese usuario ya está en la lista negra.`)

    blacklist.push(user)
    saveBlacklist()

    await m.reply(`🚫 Usuario agregado a lista negra:
@${user.split('@')[0]}`, null, { mentions: [user] })

    // 🔥 Auto kick inmediato
    if (m.isGroup) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      } catch (e) {
        console.log(e)
      }
    }
  }

  // 🔹 ELIMINAR POR ÍNDICE
  if (command === 'ln2') {
    if (!text) return m.reply(`❌ Usa: ${usedPrefix}ln2 <número>`)

    let index = parseInt(text) - 1
    if (isNaN(index) || !blacklist[index])
      return m.reply(`❌ Índice inválido.`)

    let removed = blacklist.splice(index, 1)
    saveBlacklist()

    m.reply(`✅ Eliminado de la lista negra:
@${removed[0].split('@')[0]}`, null, { mentions: removed })
  }

  // 🔹 VER LISTA
  if (command === 'vln') {
    if (blacklist.length === 0) return m.reply(`📭 La lista negra está vacía.`)

    let txt = `🚫 *LISTA NEGRA*\n\n`
    blacklist.forEach((u, i) => {
      txt += `${i + 1}. @${u.split('@')[0]}\n`
    })

    m.reply(txt, null, { mentions: blacklist })
  }
}

// 🔥 AUTO KICK CUANDO ENTRA AL GRUPO
handler.before = async function (m, { conn, participants }) {
  if (!m.isGroup) return

  for (let user of participants) {
    if (blacklist.includes(user)) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      } catch (e) {
        console.log(e)
      }
    }
  }
}

handler.command = ['ln', 'ln2', 'vln']
handler.rowner = true
handler.group = true

export default handler
