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

🖼️ *Multimedia / Perfil*
• .gpu — Descargar foto de perfil de usuario 🧑🖼️
• .gpo — Descargar foto del grupo 🏞️

🎖️ *Gestión de Insignias (Solo Owner)*
• .otorgar @user <insignia> — Otorgar insignia 🏅
• .quitar @user <insignia> — Quitar insignia ❌
• .verinsignias @user — Ver insignias 📋

🚨 *Advertencias para Administradores (Solo Owner)*
• .admad @admin [motivo] — Dar advertencia ⚠️
• .unadmad @admin — Quitar advertencia 🟢
• .listadmad — Ver lista de advertencias 📋
• .clearadmad — Limpiar todas las advertencias 🧹

🚫 *Lista Negra*
• .ln @user — Agregar ⚠️
• .unln @user — Quitar ✅
• .vln — Ver lista 📋
• .clrn — Limpiar lista 🗑️
• .resetuser @user — Reiniciar datos 🔄

⚙️ *Gestión del Bot*
• .restart — Reinicia el bot 🔁
• .update — Actualiza el bot 🆙
• .exec / .exec2 — Ejecuta código 💻
• .setcmd — Configura comando ⚙️
• .setprefix — Cambia prefijo ✏️
• .dsowner — Quita dueño ❌
• .join <link> — Unirse a grupo 🔗
• .resetlink — Resetear link del grupo ♻️
• .setpp — Cambiar foto del bot 🤖🖼️
• .setpg — Cambiar foto del grupo 👥🖼️

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
