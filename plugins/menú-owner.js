// 📂 plugins/menu-owner.js
let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } })

    const fecha = new Date().toLocaleString('es-UY', {
      timeZone: 'America/Montevideo',
      hour12: false
    })

    const menuText = `
╭━━━〔 *🐾 PANEL DEL DUEÑO 🐾* 〕━━━╮
┃ 👑 *FelixCat_Bot – Control Total*  
┃ 📆 ${fecha}
╰━━━━━━━━━━━━━━━━━━━━━━╯

⚙️ *Gestión del Bot*
• .restart — Reinicia el bot 🔁
• .update — Actualiza el bot 🆙
• .exec / .exec2 — Ejecuta código 💻
• .setcmd — Configura comando ⚙️
• .setprefix — Cambia prefijo ✏️
• .dsowner — Quita dueño ❌
• .join <link> — Unirse a grupo 🔗
• .resetlink — Resetear link del grupo ♻️

🛡️ *Administradores*
• .autoadmin — Dar admin al bot 🧩
• .dar — Dar admin a todos 🫡
• .quitar — Quitar admin a todos 🧹
• .chetar — Activar modo Pro ⚙️
• .deschetar — Desactivar modo Pro 💤

🚨 *AdminLog*
• .adminlog — Activar/Desactivar logs 🟢🔴
• .adminh — Ver historial 📋
• .adminclear — Limpiar historial 🗑️

🚫 *Lista Negra*
• .addn @user — Agregar ⚠️
• .remn @user — Quitar ✅
• .listn — Ver lista 📋
• .clrn — Limpiar lista 🗑️
• .seen @user — Consultar usuario 🔍
• .resetuser @user — Reiniciar datos 🔄

💬 *Comandos Útiles*
• a — Activa una alarma ⏰
• buenas — Saludo automático 🐱
• salir — Bot abandona el grupo 🚪
• sh — Ejecuta comando shell 💽
• u — Menciona a todos 📣
• .gpu — Descargar foto de perfil de usuario 🖼️
• .gpo — Descargar foto del grupo 🏞️

━━━━━━━━━━━━━━━━━━━
🐾 *FelixCat – Propietario Supremo*
💠 "Control total con estilo felino." 💠
━━━━━━━━━━━━━━━━━━━
`.trim()

    await conn.sendMessage(m.chat, { text: menuText }, { quoted: m })
  } catch (e) {
    console.error(e)
    await m.reply('✖️ Error al mostrar el menú del dueño.')
  }
}

handler.command = ['menuow', 'mw']
handler.owner = true

export default handler
