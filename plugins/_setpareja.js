import fs from 'fs'
import path from 'path'

const dir = './database'
const file = path.join(dir, 'parejas.json')

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
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

let handler = async (m, { conn, text }) => {

  const db = loadDB()
  const sender = conn.decodeJid(m.sender)
  const ownersJid = getOwnersJid()
  const ahora = Date.now()

  if (!ownersJid.includes(sender))
    return m.reply('❌ Solo el dueño puede usar este comando.')

  // ======================
  // OBTENER USUARIOS
  // ======================

  let users = []

  // menciones
  if (m.mentionedJid && m.mentionedJid.length) {
    users.push(...m.mentionedJid)
  }

  // numeros escritos
  if (text) {
    const nums = text.match(/\d{7,15}/g)

    if (nums) {
      for (let num of nums) {
        const jid = num + '@s.whatsapp.net'

        // verificar si existe en WhatsApp
        const exists = await conn.onWhatsApp(num)

        if (exists && exists[0]?.jid) {
          users.push(exists[0].jid)
        }
      }
    }
  }

  // eliminar duplicados
  users = [...new Set(users)]

  if (users.length < 2)
    return m.reply(
`💡 Usa dos usuarios

Ejemplos:
.setpareja @user1 @user2
.setpareja 59891234567 59898765432
.setpareja @user1 59898765432`
)

  const user1 = users[0]
  const user2 = users[1]

  if (user1 === user2)
    return m.reply('❌ No puedes emparejar a la misma persona.')

  const getUser = (id) => {
    if (!db[id]) {
      db[id] = {
        pareja: null,
        estado: 'soltero',
        relacionFecha: null,
        matrimonioFecha: null,
        amor: 0
      }
    }
    return db[id]
  }

  const tag = id => '@' + id.split('@')[0]

  const box = (title, text) => `╭━━━〔 ${title} 〕━━━⬣
${text}
╰━━━━━━━━━━━━━━━━⬣`

  const u1 = getUser(user1)
  const u2 = getUser(user2)

  // limpiar parejas anteriores
  if (u1.pareja) {
    const ex = getUser(u1.pareja)
    ex.pareja = null
    ex.estado = 'soltero'
    ex.relacionFecha = null
  }

  if (u2.pareja) {
    const ex = getUser(u2.pareja)
    ex.pareja = null
    ex.estado = 'soltero'
    ex.relacionFecha = null
  }

  // crear relación
  u1.pareja = user2
  u2.pareja = user1

  u1.estado = 'novios'
  u2.estado = 'novios'

  u1.relacionFecha = ahora
  u2.relacionFecha = ahora

  u1.amor = 0
  u2.amor = 0

  saveDB(db)

  return conn.reply(
    m.chat,
    box(
      '👑 PAREJA FORZADA',
      `${tag(user1)} ❤️ ${tag(user2)}
Ahora son pareja oficialmente 💞`
    ),
    m,
    { mentions: [user1, user2] }
  )
}

handler.command = ['setpareja']
handler.rowner = true

export default handler
