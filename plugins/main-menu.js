// plugins/menu.js

const botname = global.botname || '😸 FelixCat-Bot 😸'
const creador = 'Anónimo🐼'
const versionBot = '10.6.1'

let handler = async (m, { conn }) => {
  try {

    const saludo = getSaludoGatuno()

    const fecha = new Date().toLocaleString('es-UY', {
      timeZone: 'America/Montevideo',
      hour12: false
    })

    let menu = `
╭━━━ ✨ *CENTRO FELINO* ✨ ━━━╮
│ 😺 *${botname}* 😺
│ 👑 *Creador:* ${creador}
│ ⚙️ *Versión:* ${versionBot}
│ 💬 *${saludo}*
│ ⏰ *Hora actual:* ${fecha}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

🌦️ *Consultas rápidas:*
┃ 🔮 *.horoscopo <signo>*
┃ 🚨 *.reportar <motivo>*
┃ 🌍 *.clima <ciudad>*
┃ 🕐 *.hora*
┃ 🌐 *.traducir <idioma> <texto>*
┃ ✉️ *.sug*
┗━━━━━━━━━━━━━━━━━━━━━┛

┏━━━ 📚 *TIPOS DE MENÚ* ━━━┓
┃ 🎮 *.menuj*
┃ 👥 *.menugp*
┃ 🔥 *.menuhot*
┃ 👑 *.menuowner*
┗━━━━━━━━━━━━━━━━━━━━━┛

🐾 *${botname}* siempre vigilante 😼  
✨ _“Un maullido, una acción.”_
`

    await conn.reply(m.chat, menu.trim(), m)

    await conn.sendMessage(m.chat, {
      react: { text: '🐾', key: m.key }
    })

  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, `❌ Error al mostrar el menú\n${err}`, m)
  }
}

handler.help = ['menu', 'menú', 'allmenu']
handler.tags = ['main']
handler.command = /^(menu|menú|allmenu)$/i

handler.filename = __filename

export default handler


function getSaludoGatuno() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "🌅 Maullidos buenos días!"
  if (hour >= 12 && hour < 18) return "☀️ Maullidos buenas tardes!"
  return "🌙 Maullidos buenas noches!"
}
