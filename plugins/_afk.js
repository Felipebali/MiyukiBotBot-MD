import fs from 'fs'
import path from 'path'

const filePath = path.resolve('./database/afk.json')

const loadAfk = () => {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}))
  return JSON.parse(fs.readFileSync(filePath))
}

const saveAfk = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, text }) => {
  if (!m.isGroup)
    return m.reply('❌ Este comando solo funciona en grupos.')

  if (!text)
    return m.reply('✏️ Escribe un motivo.\nEjemplo: .afk Estoy comiendo')

  let afkData = loadAfk()

  afkData[m.sender] = {
    time: Date.now(),
    reason: text
  }

  saveAfk(afkData)

  await conn.sendMessage(m.chat, {
    text: `😴 @${m.sender.split('@')[0]} ahora está AFK.\n📌 Motivo: ${text}`,
    mentions: [m.sender]
  }, { quoted: m })
}

// ===============================
// 🔥 SOLO DETECTA MENCIONES
// ===============================
handler.before = async function (m, { conn }) {
  if (!m.isGroup) return

  let afkData = loadAfk()

  if (!m.mentionedJid) return

  for (let user of m.mentionedJid) {

    if (!afkData[user]) continue

    let tiempo = Date.now() - afkData[user].time
    let segundos = Math.floor(tiempo / 1000)

    await conn.sendMessage(m.chat, {
      text: `😴 @${user.split('@')[0]} está AFK.\n⏳ Ausente ${segundos}s\n📌 Motivo: ${afkData[user].reason}`,
      mentions: [user]
    }, { quoted: m })
  }
}

handler.command = ['afk']
handler.tags = ['grupo']
handler.help = ['afk <motivo>']
handler.group = true

export default handler
