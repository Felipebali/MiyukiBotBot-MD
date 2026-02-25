// 📂 plugins/bot.js — TEST BOT SOLO OWNERS 👑

let handler = async (m, { conn }) => {

  const sender = m.sender.replace(/[^0-9]/g, '')

  const ownerNumbers = (global.owner || []).map(v => {
    if (Array.isArray(v)) v = v[0]
    return String(v).replace(/[^0-9]/g, '')
  })

  if (!ownerNumbers.includes(sender)) {
    return m.reply('❌ Este comando es solo para los dueños.')
  }

  const uptime = process.uptime() * 1000
  const seconds = Math.floor(uptime / 1000) % 60
  const minutes = Math.floor(uptime / (1000 * 60)) % 60
  const hours = Math.floor(uptime / (1000 * 60 * 60))

  const tiempo = `${hours}h ${minutes}m ${seconds}s`

  await conn.reply(
    m.chat,
`👑 *FelixCat Bot*

✅ Estado: Online
⚡ Funcionando correctamente
⏱️ Tiempo activo: ${tiempo}

🐾 Sistema operativo normal 😸`,
    m
  )
}

handler.command = ['bot']

export default handler
