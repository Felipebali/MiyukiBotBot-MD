import { cpus, totalmem, freemem, platform, hostname } from 'os'
import { performance } from 'perf_hooks'
import { sizeFormatter } from 'human-readable'

let format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

let handler = async (m, { conn, usedPrefix }) => {
  try {
    let botname = conn.user.name || "Bot"
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)

    let totalreg = Object.keys(global.db?.data?.users || {}).length || 0
    let totalchats = Object.keys(global.db?.data?.chats || {}).length || 0
    let totalStats = Object.values(global.db?.data?.stats || {}).reduce((total, stat) => total + (stat.total || 0), 0) || 0
    let totalf = Object.values(global.plugins || {}).filter((v) => v.help && v.tags).length || 0

    const chats = Object.entries(conn.chats || {}).filter(([id, data]) => id && data && !id.endsWith('broadcast'))
    const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'))
    const privados = chats.filter(([id]) => id.endsWith('@s.whatsapp.net'))

    let sistemaPlatform = platform()
    let sistemaHostname = hostname()
    let ramTotal = totalmem()
    let ramLibre = freemem()
    let ramUsada = ramTotal - ramLibre

    let timestamp = performance.now()
    let sum = 0
    for (let i = 0; i < 1000000; i++) sum += i
    let latensi = performance.now() - timestamp

    const used = process.memoryUsage()
    let memoryInfo = Object.keys(used).map((key) => `┃ ➪ ${key.padEnd(10)}: ${format(used[key])}`).join('\n')

    let botMode = '🔒 Desconocido'
    try {
      if (global.db.data.settings && conn.user.jid && global.db.data.settings[conn.user.jid]) {
        botMode = global.db.data.settings[conn.user.jid].public ? '🌐 Público' : '🔒 Privado'
      }
    } catch (e) {
      console.log('Error al obtener modo del bot:', e)
    }

    let vegeta = `
╭━━━〔 🌪️ INFO DE ${botname} 〕━━━⬣
┃ ➪ ⚡ Prefijo: [ ${usedPrefix} ]
┃ ➪ 📦 Total Plugins: ${totalf}
┃ ➪ 🖥️ Plataforma: ${sistemaPlatform}
┃ ➪ 📡 Servidor: ${sistemaHostname}
┃ ➪ 💻 RAM: ${format(ramUsada)} / ${format(ramTotal)}
┃ ➪ 💾 Libre RAM: ${format(ramLibre)}
┃ ➪ 🚀 Velocidad: ${latensi.toFixed(4)} ms
┃ ➪ ⏱️ Uptime: ${uptime}
┃ ➪ 🔮 Modo: ${botMode}
┃ ➪ ✈️ Comandos Ejecutados: ${toNum(totalStats)} (${totalStats})
┃ ➪ 💫 Grupos Registrados: ${toNum(totalchats)} (${totalchats})
┃ ➪ 📌 Usuarios Registrados: ${toNum(totalreg)} (${totalreg})
╰━━━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 💬 CHATS DE ${botname} 〕━━━⬣
┃ ➪ 🪧 ${groupsIn.length} Chats en Grupos
┃ ➪ 📰 ${groupsIn.length} Grupos Unidos
┃ ➪ 📄 0 Grupos Salidos
┃ ➪ 💬 ${privados.length} Chats Privados
┃ ➪ 💭 ${chats.length} Chats Totales
╰━━━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ⚡ NODEJS MEMORIA 〕━━━⬣
${memoryInfo}
╰━━━━━━━━━━━━━━━━━━━━━━⬣
`.trim()

    await conn.sendMessage(m.chat, { 
      text: vegeta
    }, { quoted: m })
    
  } catch (error) {
    console.error('Error en comando info:', error)
    await conn.reply(m.chat, '❌ Ocurrió un error al obtener la información del bot.', m)
  }
}

handler.help = ['infobot', 'info']
handler.tags = ['info']
handler.command = /^(infobot|info|estado|status)$/i

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

function toNum(number) {
  if (number >= 1000 && number < 1000000) return (number / 1000).toFixed(1) + 'k'
  if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M'
  if (number <= -1000 && number > -1000000) return (number / 1000).toFixed(1) + 'k'
  if (number <= -1000000) return (number / 1000000).toFixed(1) + 'M'
  return number.toString()
}
