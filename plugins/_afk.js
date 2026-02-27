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
    text: `😴 ${m.pushName || 'Usuario'} ahora está AFK.\n📌 Motivo: ${text}`
  }, { quoted: m })
}

handler.before = async function (m, { conn }) {
  if (!m.isGroup) return

  let afkData = loadAfk()

  // 🔹 Si vuelve del AFK
  if (afkData[m.sender]) {
    let tiempo = Date.now() - afkData[m.sender].time
    let segundos = Math.floor(tiempo / 1000)

    await conn.sendMessage(m.chat, {
      text: `👋 ${m.pushName || 'Usuario'} volvió del AFK.\n⏳ Ausente ${segundos}s\n📌 Motivo: ${afkData[m.sender].reason}`
    }, { quoted: m })

    delete afkData[m.sender]
    saveAfk(afkData)
  }

  // 🔹 Si mencionan a alguien AFK
  let mentioned = m.mentionedJid?.[0]
  if (!mentioned) return

  if (!afkData[mentioned]) return

  let tiempo = Date.now() - afkData[mentioned].time
  let segundos = Math.floor(tiempo / 1000)

  await conn.sendMessage(m.chat, {
    text: `😴 Ese usuario está AFK.\n⏳ Ausente ${segundos}s\n📌 Motivo: ${afkData[mentioned].reason}`
  }, { quoted: m })
}

handler.command = ['afk']
handler.tags = ['grupo']
handler.help = ['afk <motivo>']
handler.group = true

export default handler
