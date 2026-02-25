let handler = async (m, { conn }) => {

  const menu = `
📸 *MENÚ DE RECUPERACIÓN MULTIMEDIA*
━━━━━━━━━━━━━━━━━━━━━━━

🔹 *.r* / *.ver*
Recupera una imagen o sticker citado  
📍 Se muestra en el grupo  
📤 Se guarda y se copia al owner

🔹 *.rr*
Recupera una imagen o sticker  
📩 Se envía solo al privado del owner

🔹 *.mlist*
Muestra la lista de multimedia recuperada  
📄 Últimos 15 archivos

🔹 *.mlist <id>*
Muestra detalles de un archivo recuperado

🔹 *.re <id>*
Reenvía un archivo por ID  
📩 *Siempre al privado del owner*

🔹 *.miclear*
Elimina todo el historial de multimedia recuperada  
⚠️ *Comando solo para owner*

━━━━━━━━━━━━━━━━━━━━━━━
🐾 FelixCat-Bot
`

  await conn.reply(m.chat, menu, m)
}

handler.help = ['rmenu']
handler.tags = ['tools']
handler.command = ['rmenu']

export default handler 
