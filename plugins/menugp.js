// plugins/menugp.js
let handler = async (m, { conn, isAdmin, chat }) => {
  try {
    const chatData = global.db.data.chats[chat] || {};
    const autoFraseEstado = chatData.autoFrase ? '🟢 Activado' : '🔴 Desactivado';

    let menuText = `
╭━〔 *🐾 PANEL DE ADMINISTRADORES* 〕━╮
┃
┃ 👑 *Administradores*
┃   • .p @user — Promover
┃   • .d @user — Degradar
┃
┃ 👥 *Gestión de Usuarios*
┃   • .k @user — Expulsar
┃
┃ 🔐 *Control del Grupo*
┃   • .g — Abrir / Cerrar grupo
┃
┃ 🤫 *Silencios*
┃   • .mute @user — Silenciar usuario
┃   • .unmute @user — Quitar silencio
┃
┃ 📢 *Menciones*
┃   • .tagall — Mención general
┃   • .ht — Mención oculta
┃
┃ 🧹 *Moderación*
┃   • .del — Eliminar mensaje
┃
┃ ⚠️ *Advertencias*
┃   • .warn @user — Advertir
┃   • .unwarn @user — Quitar advertencia
┃   • .warnlist — Ver advertidos
┃
┃ 🧩 *Extras*
┃   • AutoFrase: ${autoFraseEstado}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
🐱 *FelixCat_Bot* — Modo administrador activo 🛡️
    `;

    await conn.sendMessage(m.chat, { text: menuText.trim() }, { quoted: m });

  } catch (e) {
    console.error(e);
    await m.reply('✖️ Error al mostrar el menú de administradores.');
  }
};

handler.command = ['menugp'];
handler.group = true;

export default handler;
