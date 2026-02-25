let handler = async (m, { conn }) => {

  const menu = `
🗂️ *MENÚ DE GESTIÓN DE MULTIMEDIA*
━━━━━━━━━━━━━━━━━━━━━━━

📄 *.medias*
Muestra la lista de archivos guardados

📤 *.media <id>*
Envía el archivo seleccionado  
📩 *Se envía al privado*

🗑️ *.media del <id>*
Elimina un archivo específico

🗑️ *.media del 3 7 9*
Elimina varios archivos a la vez  
(separados por espacios)

🔥 *.media clear*
Elimina **TODO** el historial multimedia  
⚠️ *Acción irreversible*

━━━━━━━━━━━━━━━━━━━━━━━
🐾 FelixCat-Bot
`

  await conn.reply(m.chat, menu, m)
}

handler.help = ['mmenu']
handler.tags = ['tools']
handler.command = ['mmenu']

export default handler 
