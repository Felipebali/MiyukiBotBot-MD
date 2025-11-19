// plugins/menugp.js
let handler = async (m, { conn, isAdmin, chat }) => {
  try {
    const chatData = global.db.data.chats[chat] || {};
    const autoFraseEstado = chatData.autoFrase ? '🟢 Activado' : '🔴 Desactivado';

    let menuText = `
╭━━━┅┅ *🐾 MENÚ ADMINISTRADORES 🐾* ┅┅━━━╮
┃
┃ 👑 *Gestión del grupo y miembros*
┃
┃ 💠 *PROMOVER / DEGRADAR*
┃  ├ 🐾 .p <@user> — Promover a admin 😺
┃  └ 🐾 .d <@user> — Degradar admin 😿
┃
┃ 💠 *ELIMINAR USUARIOS*
┃  ├ 🐾 .k <@user> — Expulsar usuario ✂️
┃  └ 🐾  F — Expulsar un usuario al azar 🎯
┃
┃ 💠 *CERRAR / ABRIR GRUPO*
┃  └ 🐾 .g — Alternar grupo 🔒 / 🔓
┃
┃ 💠 *SILENCIAR / DESILENCIAR*
┃  ├ 🐾 .mute <@user> — Silenciar 🤫
┃  └ 🐾 .unmute <@user> — Desilenciar 🗣️
┃
┃ 💠 *MENCIÓN GENERAL*
┃  ├ 🐾 .tagall — Mencionar a todos 📣
┃  ├ 🐾 .ht — Mención oculta 👻
┃  └ 🐾  T — Ultra TagAll ⚔️ (sin prefijo)
┃
┃ 💠 *BORRAR MENSAJES*
┃  └ 🐾 .del — Elimina mensaje respondido ❌
┃
┃ 💠 *ADVERTENCIAS*
┃  ├ 🐾 .warn @user — Dar advertencia ⚠️
┃  ├ 🐾 .unwarn @user — Quitar advertencia 🟢
┃  └ 🐾 .warnlist — Ver lista de advertidos 📋
┃
┃ 🧩 *Funciones extra:*
┃  └ AutoFrase: ${autoFraseEstado}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
🐱 *FelixCat_Bot* — Siempre atento 🐾
    `;

    await conn.sendMessage(m.chat, { text: menuText.trim() }, { quoted: m });

  } catch (e) {
    console.error(e);
    await m.reply('✖️ Error al mostrar el menú de grupo.');
  }
};

handler.command = ['menugp'];
handler.group = true;

export default handler;
