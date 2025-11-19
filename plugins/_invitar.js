// 📂 plugins/add-invite.js — FelixCat_Bot 🐾
// Envía una invitación del grupo a un número indicado
// Autor: Feli 💀

// Dependencias
import moment from 'moment-timezone'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {

  // ❗ Validaciones iniciales
  if (!text)
    return conn.reply(m.chat, '❀ *Por favor, ingrese el número al que quiere enviar la invitación.*\nEjemplo: `.add 098123456`', m)

  if (text.includes('+'))
    return conn.reply(m.chat, 'ꕥ *Ingrese el número sin el + ni espacios.*', m)

  if (isNaN(text))
    return conn.reply(m.chat, 'ꕥ *Ingrese solo números y sin código de país.*\nEjemplo correcto: `098123456`', m)

  // 🐾 Datos del grupo
  const group = m.chat
  const link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)

  // 🐱 Etiquetas y fecha
  const tag = m.sender ? '@' + m.sender.split('@')[0] : 'usuario'
  const nombreChat = m.isGroup ? (await conn.getName(m.chat)) : 'Chat Privado'
  const fecha = moment.tz('America/Caracas').format('DD/MM/YYYY hh:mm:ss A')

  // 🐾 Mensaje de invitación
  const mensaje = `
❀ 𝗜𝗡𝗩𝗜𝗧𝗔𝗖𝗜𝗢́𝗡 𝗙𝗘𝗟𝗜𝗫𝗖𝗔𝗧_𝗕𝗢𝗧 🐾

ꕥ *Usuario:* ${tag}
❃ *Desde:* ${nombreChat}
✦ *Fecha:* ${fecha}

✧ *Aquí tienes una invitación al grupo:*  
${link}

~ Atentamente: FelixCat_Bot 🐾
`.trim()

  // 📩 Enviar la invitación
  await conn.reply(`${text}@s.whatsapp.net`, mensaje, m, { mentions: [m.sender] })

  // ✔️ Confirmación al ejecutor
  await m.reply('❀ *El enlace de invitación fue enviado correctamente.* 🐾')
}

handler.help = ['invite']
handler.tags = ['group']
handler.command = ['add', 'agregar', 'añadir']
handler.group = true
handler.botAdmin = true

export default handler
